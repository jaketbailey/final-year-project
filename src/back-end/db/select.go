package db

import (
	"fmt"
	"time"
)

// GetAllHazards function
func GetAllHazard() ([]Hazard, error) {
	hazards := []Hazard{}
	query := `
	SELECT 
		h.id AS "Hazard ID",
		h.hazard_date AS "Date",
		gt.type AS "Geometry Type",
		coord.latitude AS "Lat",
		coord.longitude AS "Lon",
		c.name AS "Category",
		c.description AS "Category Description",
		p.property_name AS "Property",
		p.property_value AS "Property Value"
	FROM
		hazard as h
		JOIN geometry_table as g ON g.id = h.geometry_id 
		JOIN category as c ON c.id = h.category_id 
		JOIN geometry_type as gt ON gt.id = g.type_id 
		JOIN hazard_property AS hp ON hp.hazard_id = h.id 
		JOIN property AS p ON p.id = hp.property_id 
		JOIN coordinate AS coord ON coord.id = ANY(g.coordinates)
	WHERE
		ST_DWithin(
			coord.location,
			ST_SetSRID(ST_MakePoint(50.909698, -1.404351), 4326),
			-- ST_MakePoint(@longitude, @latitude)::geo,
			0.5 * 1609.34
		)
	GROUP BY  
		h.id,
		h.hazard_date,
		gt.type,
		coord.latitude,
		coord.longitude,
		c.name,
		c.description,
		p.property_name,
		p.property_value
	ORDER BY
		h.id;
	`

	rows, err := db.Query(query)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	defer rows.Close()
	previousRowID := 0
	var previousProperty Property
	for rows.Next() {
		coordinates := []Coordinate{}
		properties := []Property{}

		var id int
		var geometryType, category, categoryDesc, propertyKey, propertyValue string
		var lat, lon float64
		var hazardDate time.Time

		err = rows.Scan(&id, &hazardDate, &geometryType, &lat, &lon, &category, &categoryDesc, &propertyKey, &propertyValue)
		if err != nil {
			fmt.Println(err)
			return nil, err
		}

		if (id == 1 && id != previousRowID) || id != previousRowID {
			coordinate := Coordinate{
				Latitude:  lat,
				Longitude: lon,
			}
			coordinates = append(coordinates, coordinate)

			geometry := Geometry{
				Type:        geometryType,
				Coordinates: coordinates,
			}

			category := Property{
				Key:   category,
				Value: categoryDesc,
			}
			properties = append(properties, category)

			property := Property{
				Key:   propertyKey,
				Value: propertyValue,
			}
			properties = append(properties, property)

			hazard := Hazard{
				ID:         id,
				Date:       hazardDate,
				Geometry:   geometry,
				Properties: properties,
			}
			hazards = append(hazards, hazard)

			previousRowID = id
		} else {
			if propertyKey != previousProperty.Key {
				coordinate := Coordinate{
					Latitude:  lat,
					Longitude: lon,
				}

				property := Property{
					Key:   propertyKey,
					Value: propertyValue,
				}

				checkCoord, _ := in_array(coordinate, hazards[len(hazards)-1].Geometry.Coordinates)
				if checkCoord != true {
					hazards[len(hazards)-1].Geometry.Coordinates = append(hazards[len(hazards)-1].Geometry.Coordinates, coordinate)
				}

				checkProperty, _ := in_array(property, hazards[len(hazards)-1].Properties)
				if checkProperty != true {
					hazards[len(hazards)-1].Properties = append(hazards[len(hazards)-1].Properties, property)
				}
			}
		}
	}
	return hazards, err
}

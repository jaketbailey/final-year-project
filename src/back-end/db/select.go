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
		hazard.id AS "Hazard ID",
		hazard_date AS "Date",
		geometry_type.type AS "Geometry Type",
		coordinate.latitude AS "Lat",
		coordinate.longitude AS "Lon",
		category.name AS "Category",
		category.description AS "Category Description"
	FROM
		hazard
		JOIN geometry ON geometry.id = hazard.geometry_id
		JOIN category ON category.id = hazard.category_id
		JOIN geometry_type ON geometry_type.id = geometry.type_id
		LEFT JOIN LATERAL (
			SELECT
				coordinate.latitude,
				coordinate.longitude
			FROM
				coordinate
			WHERE
				coordinate.id = ANY(
					geometry.coordinates
				)
		) AS coordinate ON TRUE
	GROUP BY  
		hazard.id,
		hazard_date,
		geometry_type.type,
		coordinate.latitude,
		coordinate.longitude,
		category.name,
		category.description
	ORDER BY
		hazard.id;
	`

	rows, err := db.Query(query)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	defer rows.Close()
	previousRowID := 0
	for rows.Next() {
		coordinates := []Coordinate{}
		properties := []Property{}

		var id int
		var geometryType, category, categoryDesc string
		var lat, lon float64
		var hazardDate time.Time

		err = rows.Scan(&id, &hazardDate, &geometryType, &lat, &lon, &category, &categoryDesc)
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

			property := Property{
				Key:   category,
				Value: categoryDesc,
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
			coordinate := Coordinate{
				Latitude:  lat,
				Longitude: lon,
			}

			hazards[len(hazards)-1].Geometry.Coordinates = append(hazards[len(hazards)-1].Geometry.Coordinates, coordinate)
		}
	}
	return hazards, err
}

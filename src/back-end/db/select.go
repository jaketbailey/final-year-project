package db

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
)

// GetCategories retrieves a list of categories from the database.
//
// The function queries the 'category' table in the database to fetch
// categories sorted by ID. It returns a slice of Category structures,
// each containing an ID and a Name. If any errors occur during the
// database query or result processing, an error is returned.
//
// Parameters:
//   - c: Gin context representing the HTTP request and response context.
//
// Returns:
//   - A slice of Category representing the retrieved categories.
//   - An error if any issues occur during the database query or result processing.
//
// Example Usage:
//
//	categories, err := GetCategories(c)
//	if err != nil {
//	    // Handle error
//	}
//	// Use the retrieved categories
//
// Note: This function assumes the existence of a 'category' table in the
// database with 'id' and 'name' columns.
func GetCategories(c *gin.Context) ([]Category, error) {
	categories := []Category{}
	query := `
	SELECT 
		id,
		name
	FROM 
		category
	ORDER BY 
		id;
	`
	rows, err := db.Query(query)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var category Category
		err := rows.Scan(&category.ID, &category.Name)
		if err != nil {
			fmt.Println(err)
			return nil, err
		}
		categories = append(categories, category)
	}
	return categories, nil
}

type GeometryType struct {
	ID   int
	Type string
}

// GetGeometryTypes retrieves a list of geometry types from the database.
//
// The function queries the 'geometry_type' table in the database to fetch
// geometry types sorted by ID. It returns a slice of GeometryType structures,
// each containing an ID and a Type. If any errors occur during the
// database query or result processing, an error is returned.
//
// Parameters:
//   - c: Gin context representing the HTTP request and response context.
//
// Returns:
//   - A slice of GeometryType representing the retrieved geometry types.
//   - An error if any issues occur during the database query or result processing.
//
// Example Usage:
//
//	geoTypes, err := GetGeometryTypes(c)
//	if err != nil {
//	    // Handle error
//	}
//	// Use the retrieved geometry types
//
// Note: This function assumes the existence of a 'geometry_type' table in the
// database with 'id' and 'type' columns.
func GetGeometryTypes(c *gin.Context) ([]GeometryType, error) {
	geometryTypes := []GeometryType{}
	query := `
	SELECT 
		id,
		type
	FROM 
		geometry_type
	ORDER BY 
		id;
	`
	rows, err := db.Query(query)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var geoType GeometryType
		err := rows.Scan(&geoType.ID, &geoType.Type)
		if err != nil {
			fmt.Println(err)
			return nil, err
		}
		geometryTypes = append(geometryTypes, geoType)
	}
	return geometryTypes, nil
}

// GetHazards retrieves a list of hazards from the database based on
// specified geographical coordinates (latitude, longitude) and radius.
//
// The function queries the database to fetch hazards that fall within
// a specified radius of the provided latitude and longitude. It returns
// a slice of Hazard structures, each containing an ID, Date, Geometry
// (including Coordinates and Geometry Type), and Properties (including
// Category and Hazard-specific properties).
//
// Parameters:
//   - c: Gin context representing the HTTP request and response context.
//
// Returns:
//   - A slice of Hazard representing the retrieved hazards.
//   - An error if any issues occur during the database query or result processing.
//
// Example Usage:
//
//	hazards, err := GetHazards(c)
//	if err != nil {
//	    // Handle error
//	}
//	// Use the retrieved hazards
//
// Note: This function assumes the existence of tables 'hazard', 'geometry_table',
// 'category', 'geometry_type', 'hazard_property', 'property', and 'coordinate' in
// the database with appropriate columns and relationships.
func GetHazards(c *gin.Context) ([]Hazard, error) {
	hazards := []Hazard{}
	latitude := c.Query("latitude")
	longitude := c.Query("longitude")
	radius := c.Query("radius")
	query := fmt.Sprintf(`
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
			location::geography,
			ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography,
			%s * 1609.34 
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
	`, longitude, latitude, radius)
	fmt.Println(query)

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

package db

import (
	"encoding/json"
	"fmt"

	"github.com/gin-gonic/gin"
)

// CreateHazard creates a new hazard using the provided JSON request body.
//
// The function takes a Gin context (`c`) as a parameter, reads and validates
// the JSON request body, converts the Coordinates and Properties fields to
// PostgreSQL-compatible JSON, and then executes a PostgreSQL function
// (`create_hazard_from_json`) to store the hazard in the database.
//
// Parameters:
//   - c: Gin context representing the HTTP request and response context.
//
// Returns:
//   - An interface{} representing the created hazard.
//   - An error if any issues occur during processing.
//
// Example Usage:
//
//	hazard, err := CreateHazard(c)
//	if err != nil {
//	    // Handle error
//	}
//	// Use the created hazard
//
// Note: This function assumes the existence of the 'create_hazard_from_json'
// PostgreSQL function, and it formats the input parameters as a JSON object.
func CreateHazard(c *gin.Context) (interface{}, error) {
	var hazard HazardRequestBody

	if c.BindJSON(&hazard) != nil {
		return nil, fmt.Errorf("Error binding JSON")
	}
	// Convert Coordinates to PostgreSQL-compatible JSON
	coordinatesJSON, err := json.Marshal(hazard.Coordinates)
	if err != nil {
		return nil, fmt.Errorf("Error marshaling coordinates: %v", err)
	}

	// Convert Properties to PostgreSQL-compatible JSON
	propertiesJSON, err := json.Marshal(hazard.Properties)
	if err != nil {
		return nil, fmt.Errorf("Error marshaling properties: %v", err)
	}

	_, err = db.Exec(`
		SELECT create_hazard_from_json(
			'{
				"name": "` + hazard.Name + `",
				"hazardType": "` + fmt.Sprint(hazard.HazardType) + `",
				"description": "` + hazard.Description + `",
				"geometryType": ` + fmt.Sprint(hazard.GeometryType) + `,
				"date": "` + hazard.Date + `",
				"timeframe": "` + hazard.Timeframe + `",
				"coordinates": ` + string(coordinatesJSON) + `,
				"properties": ` + string(propertiesJSON) + `
			}'::jsonb
		)
	`)
	if err != nil {
		fmt.Printf("Error executing PostgreSQL function: %v", err)
	}

	return hazard, nil
}

package db

import (
	"encoding/json"
	"fmt"

	"github.com/gin-gonic/gin"
)

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

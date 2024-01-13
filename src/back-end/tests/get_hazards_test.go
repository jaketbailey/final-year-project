package tests

import (
	"cycling-route-planner/src/back-end/db"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
)

func TestGetHazards(t *testing.T) {
	err := godotenv.Load("../../../.env")
	if err != nil {
		log.Fatal(err)
		log.Fatal("Error loading .env file")
	}
	db.Init()

	// Set Gin to test mode
	gin.SetMode(gin.TestMode)

	// Create a new Gin router
	r := gin.New()

	// Define the route using your GetCategories function
	r.GET(fmt.Sprintf("/api/hazards"), func(c *gin.Context) {
		rows, err := db.GetHazards(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, rows)
	})

	mockLat := "50.79899"
	mockLon := "-1.09125"
	mockRadius := "50"

	// Create a new HTTP request with POST method and empty body
	req, err := http.NewRequest("GET", fmt.Sprintf("/api/hazards?latitude=%s&longitude=%s&radius=%s", mockLat, mockLon, mockRadius), nil)
	assert.NoError(t, err)

	// Create a response recorder to record the response
	res := httptest.NewRecorder()

	// Perform the request using the router
	r.ServeHTTP(res, req)

	// Check the HTTP status code
	assert.Equal(t, http.StatusOK, res.Code)

	// Parse the response body and check the content
	var response []map[string]interface{}
	err = json.Unmarshal(res.Body.Bytes(), &response)
	assert.NoError(t, err)

	// Check that each object in the response has the keys "ID" and "Name"
	// Iterate through the response hazards
	for _, hazard := range response {
		fmt.Println(hazard)
		assert.Contains(t, hazard, "ID")
		assert.Contains(t, hazard, "Date")
		assert.Contains(t, hazard, "Geometry")

		// Assert Geometry object contains "Type" and "Coordinates"
		geometry, ok := hazard["Geometry"].(map[string]interface{})
		assert.True(t, ok, "Geometry should be a map")

		assert.Contains(t, geometry, "Type")
		assert.Contains(t, geometry, "Coordinates")

		// Assert Coordinates is an array of objects
		coordinates, ok := geometry["Coordinates"].([]interface{})
		assert.True(t, ok, "Coordinates should be an array")

		// Iterate through each coordinate object
		for _, coordinate := range coordinates {
			// Assert coordinate is a map
			coordMap, ok := coordinate.(map[string]interface{})
			assert.True(t, ok, "Coordinate should be a map")

			// Assert the presence of "Latitude" and "Longitude"
			assert.Contains(t, coordMap, "Latitude")
			assert.Contains(t, coordMap, "Longitude")

			// Assert Latitude and Longitude are float64
			assert.IsType(t, 0.0, coordMap["Latitude"], "Latitude should be a float64")
			assert.IsType(t, 0.0, coordMap["Longitude"], "Longitude should be a float64")
		}
	}
}

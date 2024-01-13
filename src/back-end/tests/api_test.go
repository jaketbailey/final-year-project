package tests

import (
	"cycling-route-planner/src/back-end/db"
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
)

type Category struct {
	ID   int    `json:"ID"`
	Name string `json:"Name"`
}

func TestGetCategories(t *testing.T) {
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
	r.POST("/api/categories", func(c *gin.Context) {
		rows, err := db.GetCategories(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, rows)
	})

	// Create a new HTTP request with POST method and empty body
	req, err := http.NewRequest("POST", "/api/categories", nil)
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
	for _, category := range response {
		assert.Contains(t, category, "ID")
		assert.Contains(t, category, "Name")
	}
}

func main() {
	// Run the test using: go test -v
	// This will execute the TestGetCategories function
}

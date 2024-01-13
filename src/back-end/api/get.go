package api

import (
	"net/http"

	"cycling-route-planner/src/back-end/db"

	"github.com/gin-gonic/gin"
)

func GetTest(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "pong",
	})
}

// GET Req handler functions for the for multiple endpoints.
// It retrieves data from the database and returns a JSON response.
// If an error occurs during the database query, it responds with a 500 Internal Server Error
// and includes the error message in the response JSON.

func GetCategories(c *gin.Context) {
	rows, err := db.GetCategories(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, rows)
}

func GetGeometryTypes(c *gin.Context) {
	rows, err := db.GetGeometryTypes(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, rows)
}

func GetHazards(c *gin.Context) {
	rows, err := db.GetHazards(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, rows)
}

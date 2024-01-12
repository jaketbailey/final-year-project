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

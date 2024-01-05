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

func GetAllHazard(c *gin.Context) {
	rows, err := db.GetAllHazard()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, rows)
}

package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func PutTest(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "Good",
	})
}

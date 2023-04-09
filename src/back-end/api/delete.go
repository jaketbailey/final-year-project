package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func DeleteTest(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "Good",
	})
}

package api

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func PostTest(c *gin.Context) {
	fmt.Println("test")
	// message := c.PostForm()
	c.JSON(http.StatusOK, gin.H{"status": "Good"})
}

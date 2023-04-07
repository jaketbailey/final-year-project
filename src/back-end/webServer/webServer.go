package webServer

import (
	"net/http"

	"fmt"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
)

func Init() {
	// Set the router as the default one shipped with Gin
	router := gin.Default()

	// Serve frontend static files
	router.Use(static.Serve("/", static.LocalFile("./src/client/build", true)))

	// Setup route group for the API
	api := router.Group("/api")
	{
		api.GET("/", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message": "pong",
			})
		})
		api.POST("/test", func(c *gin.Context) {
			fmt.Println("test")
			// message := c.PostForm()
			c.JSON(http.StatusOK, gin.H{"status": "Good"})
		})
	}

	// Start and run the server
	router.Run(":5000")
}

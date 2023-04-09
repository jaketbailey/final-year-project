package api

import (
	"github.com/gin-gonic/gin"
)

func Init(router *gin.Engine) {
	// Setup route group for the API
	api := router.Group("/api")
	{
		// GET Routes
		api.GET("/ping", GetTest)

		// POST Routes
		api.POST("/test", PostTest)

		// PUT Routes

		// DELETE Routes
	}
}

package api

import (
	"cycling-route-planner/src/back-end/utils/logger"

	"github.com/gin-gonic/gin"
)

func Init(router *gin.Engine) {

	Logger := logger.New()

	Logger.Info().Println("API Init()")

	// Setup route group for the API
	api := router.Group("/api")
	{
		// GET Routes
		api.GET("/ping", GetTest)

		// POST Routes
		api.POST("/test", PostTest)

		// PUT Routes
		api.PUT("/test", PutTest)

		// DELETE Routes
		api.DELETE("/test", DeleteTest)

	}
}

// API package for the back-end
package api

import (
	"cycling-route-planner/src/back-end/utils/logger"

	"github.com/gin-gonic/gin"
)

func Init(router *gin.Engine) {

	Logger := logger.New()

	// Setup route group for the API
	api := router.Group("/api")
	{
		// GET Routes
		api.GET("/ping", GetTest)
		api.GET("/hazards", GetHazards)

		// POST Routes
		api.POST("/test", PostTest)
		api.POST("/send-email", PostSendEmail)
		api.POST("/create-strava-activity", PostCreateStravaActivity)

		// PUT Routes
		api.PUT("/test", PutTest)

		// DELETE Routes
		api.DELETE("/test", DeleteTest)
	}

	Logger.Info().Println("Router group /api created")
}

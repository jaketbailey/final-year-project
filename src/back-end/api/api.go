package api

import (
	"github.com/gin-gonic/gin"
)

func Init(router *gin.Engine) {
	// Setup route group for the API
	api := router.Group("/api")
	{
		api.GET("/", GetTest)
		api.POST("/test", PostTest)
	}
}

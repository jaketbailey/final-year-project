package server

import (
	"cycling-route-planner/src/back-end/utils/logger"

	"github.com/gin-gonic/gin"
)

func NewRouter() *gin.Engine {
	Logger := logger.New()

	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	Logger.Info().Println("New Router Created")
	return router
}

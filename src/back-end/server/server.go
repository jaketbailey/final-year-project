package server

import (
	"cycling-route-planner/src/back-end/api"
	"cycling-route-planner/src/back-end/config"
	"cycling-route-planner/src/back-end/utils/logger"
	"fmt"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
)

func Init(mode string) {

	Logger := logger.New()

	Logger.Info().Printf("Running in %s mode", mode)

	// Set the router as the default one shipped with Gin
	if mode == "dev" {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	port := config.GetDotEnvInt("SERVER_PORT")

	router := NewRouter()
	router.Use(static.Serve("/", static.LocalFile("./src/client/build", true)))
	router.Use(static.Serve("/uploads", static.LocalFile("./src/client/route_image_uploads", true)))
	router.Use(static.Serve("/exchange_token", static.LocalFile("./src/client/build", true)))
	router.Use(static.Serve("/garmin", static.LocalFile("./src/client/build", true)))

	api.Init(router)

	// Start and run the server
	Logger.Info().Println("Server Starting")
	router.Run(fmt.Sprintf(":%d", port))

}

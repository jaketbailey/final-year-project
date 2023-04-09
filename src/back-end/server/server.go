package server

import (
	"cycling-route-planner/src/back-end/api"
	"cycling-route-planner/src/back-end/config"
	"fmt"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
)

func Init(mode string) {
	// Set the router as the default one shipped with Gin
	if mode == "dev" {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	port := config.GetDotEnvInt("SERVER_PORT")

	router := NewRouter()
	router.Use(static.Serve("/", static.LocalFile("./src/client/build", true)))

	api.Init(router)

	// Start and run the server
	router.Run(fmt.Sprintf(":%d", port))
}

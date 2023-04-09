package server

import (
	"cycling-route-planner/src/back-end/api"

	"github.com/gin-gonic/contrib/static"
)

func Init() {
	// Set the router as the default one shipped with Gin
	router := NewRouter()
	router.Use(static.Serve("/", static.LocalFile("./src/client/build", true)))

	api.Init(router)

	// Start and run the server
	router.Run(":5000")
}

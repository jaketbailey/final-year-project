package main

import (
	api "cycling-route-planner/src/back-end/api"
	webServer "cycling-route-planner/src/back-end/webServer"
)

func main() {
	api.Init()
	webServer.Init()
}

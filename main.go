package main

import (
	"cycling-route-planner/src/back-end/config"
	"cycling-route-planner/src/back-end/db"
	"cycling-route-planner/src/back-end/server"
)

func main() {
	mode := config.Init()
	db.Init()
	server.Init(mode)
}

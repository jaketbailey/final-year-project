package main

import (
	"cycling-route-planner/src/back-end/db"
	"cycling-route-planner/src/back-end/server"
)

func main() {
	db.Init()
	server.Init()
}

// Path: src\back-end\db.go
// Package api contains the API for the PostgreSQL database
package db

import (
	"cycling-route-planner/src/back-end/config"
	"cycling-route-planner/src/back-end/utils/logger"
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq"
)

type Property struct {
	Key   string
	Value string
}

type Coordinate struct {
	Latitude  float64
	Longitude float64
}

type Geometry struct {
	Type        string
	Coordinates []Coordinate
}

type Hazard struct {
	ID         int
	Date       time.Time
	Geometry   Geometry
	Properties []Property
}

var db *sql.DB

func Init() {

	Logger := logger.New()

	host := config.GetDotEnvStr("DB_HOST")
	port := config.GetDotEnvInt("DB_PORT")
	user := config.GetDotEnvStr("DB_USER")
	password := config.GetDotEnvStr("DB_PASSWORD")
	dbname := config.GetDotEnvStr("DB_NAME")
	sslmode := config.GetDotEnvStr("DB_SSLMODE")

	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)

	database, err := sql.Open("postgres", psqlInfo)
	db = database
	if err != nil {
		panic(err)
	}
	// defer db.Close()

	err = database.Ping()
	if err != nil {
		panic(err)
	}

	Logger.Info().Printf("Successfully connected to %s database!", dbname)
}

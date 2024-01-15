// Path: src\back-end\db.go
// Package api contains the API for the PostgreSQL database
package db

import (
	"cycling-route-planner/src/back-end/config"
	"cycling-route-planner/src/back-end/utils/logger"
	"database/sql"
	"fmt"
	"reflect"
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

type HazardRequestBody struct {
	Name         string `json:"name"`
	Description  string `json:"description"`
	GeometryType int    `json:"geometryType"`
	HazardType   int    `json:"hazardType"`
	Timeframe    string `json:"timeframe"`
	Date         string `json:"date"`
	Coordinates  []struct {
		Latitude  float64 `json:"lat"`
		Longitude float64 `json:"lng"`
	} `json:"coordinates"`
	Properties []struct {
		Key   string `json:"key"`
		Value string `json:"value"`
	} `json:"properties"`
}

type HazardReportRequestBody struct {
	HazardId   string `json:"hazardId"`
	ReportBody string `json:"reportBody"`
	Date       string `json:"date"`
}

type Category struct {
	ID          int
	Name        string
	Description string
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

func in_array(v interface{}, in interface{}) (ok bool, i int) {
	val := reflect.Indirect(reflect.ValueOf(in))
	switch val.Kind() {
	case reflect.Slice, reflect.Array:
		for ; i < val.Len(); i++ {
			if ok = v == val.Index(i).Interface(); ok {
				return
			}
		}
	}
	return
}

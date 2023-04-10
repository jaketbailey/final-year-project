// Path: src\back-end\db.go
// Package api contains the API for the PostgreSQL database
package db

import (
	"cycling-route-planner/src/back-end/config"
	"cycling-route-planner/src/back-end/utils/logger"
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

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

	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		panic(err)
	}

	Logger.Info().Printf("Successfully connected to %s database!", dbname)
}

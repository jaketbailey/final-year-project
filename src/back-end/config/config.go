package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

func Init() string {
	err := godotenv.Load(".env")
	if err != nil {
		panic("Error loading .env file")
	}

	return GetDotEnvStr("MODE")
}

func GetDotEnvStr(key string) string {
	v := os.Getenv(key)

	if v == "" {
		panic("Missing environment variable: " + key)
	}
	return v
}

func GetDotEnvInt(key string) int {
	s := GetDotEnvStr(key)
	v, err := strconv.Atoi(s)
	if err != nil {
		panic("Missing environment variable: " + key)
	}
	return v
}

func GetDotEnvBool(key string) bool {
	s := GetDotEnvStr(key)
	v, err := strconv.ParseBool(s)
	if err != nil {
		panic("Missing environment variable: " + key)
	}
	return v
}

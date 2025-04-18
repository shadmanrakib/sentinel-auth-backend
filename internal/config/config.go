package config

import (
	"fmt"
	"os"
)

type Config struct {
	API_ADDR    string
	DB_HOST     string
	DB_USER     string
	DB_PASSWORD string
	DB_NAME     string
	DB_PORT     string
}

func getNonemptyEnvOrError(variable string) (string, error) {
	val := os.Getenv(variable)

	if val == "" {
		return "", fmt.Errorf("Env variable %s is empty", variable)
	}

	return val, nil
}

func InitConfig() (Config, error) {
	API_ADDR, err := getNonemptyEnvOrError("API_ADDR")
	if err != nil {
		return Config{}, err
	}

	DB_HOST, err := getNonemptyEnvOrError("DB_HOST")
	if err != nil {
		return Config{}, err
	}

	DB_USER, err := getNonemptyEnvOrError("DB_USER")
	if err != nil {
		return Config{}, err
	}

	DB_PASSWORD, err := getNonemptyEnvOrError("DB_PASSWORD")
	if err != nil {
		return Config{}, err
	}

	DB_NAME, err := getNonemptyEnvOrError("DB_NAME")
	if err != nil {
		return Config{}, err
	}

	DB_PORT, err := getNonemptyEnvOrError("DB_PORT")
	if err != nil {
		return Config{}, err
	}

	config := Config{
		API_ADDR,
		DB_HOST,
		DB_USER,
		DB_PASSWORD,
		DB_NAME,
		DB_PORT,
	}

	return config, nil
}

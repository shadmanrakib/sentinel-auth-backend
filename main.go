package main

import (
	"log"
	"net/http"
	"sentinel-auth-backend/internal/config"
	"sentinel-auth-backend/internal/database"

	"github.com/gin-gonic/gin"
)

func main() {
	// initialize config data from environment variables
	appConfig, err := config.InitConfig()
	if err != nil {
		log.Fatal(err)
	}

	// create database and run necessary migrations
	database.SetupDb(appConfig)

	router := gin.Default()

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	router.Run(appConfig.API_ADDR) // listen and serve on 0.0.0.0:8080
}

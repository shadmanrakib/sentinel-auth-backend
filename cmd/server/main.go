package main

import (
	"log"
	"sentinel-auth-backend/internal/config"
	"sentinel-auth-backend/internal/database"
	"sentinel-auth-backend/internal/routes"

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

	// very basic versioning
	v1 := router.Group("v1")

	// register nested routes
	routes.RegisterAdminRoutes(v1.Group("/admin"))
	routes.RegisterAuthRoutes(v1.Group("/auth"))

	router.Run(appConfig.API_ADDR) // listen and serve on 0.0.0.0:8080
}

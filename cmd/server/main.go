package main

import (
	"log"
	"sentinel-auth-backend/internal/api"
	"sentinel-auth-backend/internal/config"
	"sentinel-auth-backend/internal/database"
	"sentinel-auth-backend/internal/routes"
	"sentinel-auth-backend/internal/server"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// initialize config data from environment variables
	appConfig, err := config.InitConfig()
	if err != nil {
		log.Fatal(err)
	}

	// create database and run necessary migrations
	db := database.SetupDb(appConfig)
	database.SeedDb(db)

	server := server.Create(db, &appConfig)

	router := gin.Default()

	wrapper := api.ServerInterfaceWrapper{
		Handler: server,
	}

	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"*"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	corsConfig.AllowCredentials = true
	router.Use(cors.New(corsConfig))

	// very basic versioning
	v1 := router.Group("v1")

	// register misc top level v1 routes
	routes.RegisterRootRoutes(v1, &wrapper)

	// register nested routes
	routes.RegisterAdminRoutes(v1.Group("/admin"), &wrapper)
	routes.RegisterAuthRoutes(v1.Group("/auth"), &wrapper)
	routes.RegisterUserRoutes(v1.Group("/user"), &wrapper)

	router.Run(appConfig.API_ADDR) // listen and serve on 0.0.0.0:8080
}

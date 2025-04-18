package database

import (
	"fmt"
	"log"
	"sentinel-auth-backend/config"
	"sentinel-auth-backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func SetupDb(appConfig config.Config) *gorm.DB {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		appConfig.DB_HOST,
		appConfig.DB_USER,
		appConfig.DB_PASSWORD,
		appConfig.DB_NAME,
		appConfig.DB_PORT,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatal("❌ Database connection failed:", err)
	}

	err = db.AutoMigrate(&models.User{})
	if err != nil {
		log.Fatal("❌ Migration failed:", err)
	}

	return db
}

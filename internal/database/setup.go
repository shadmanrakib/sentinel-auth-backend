package database

import (
	"fmt"
	"log"
	"sentinel-auth-backend/internal/config"
	"sentinel-auth-backend/internal/models"

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

	dbModels := []interface{}{
		&models.User{},
		&models.Client{},
		&models.ProviderOption{},
		&models.ClientProvider{},
		&models.Identity{},
		&models.RedeemAuthCode{},
	}
	err = db.AutoMigrate(dbModels...)
	if err != nil {
		log.Fatal("❌ Migration failed:", err)
	}

	return db
}

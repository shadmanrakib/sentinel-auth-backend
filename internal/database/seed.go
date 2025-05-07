package database

import (
	"crypto/rand"
	"fmt"
	"log"
	"sentinel-auth-backend/internal/models"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

func SeedDb(db *gorm.DB) {
	// Check if database is already seeded by looking for a root client
	var count int64
	db.Model(&models.Client{}).Where("is_root_client = ?", true).Count(&count)
	if count > 0 {
		log.Println("✅ Database already seeded")
		return
	}

	// Create root client
	rootClient := models.Client{
		Name:           "Admin Root Client",
		Secret:         GenerateSecureSecret(),
		RedirectUris:   pq.StringArray{"http://localhost:3000/callback"},
		AllowedOrigins: pq.StringArray{"http://localhost:3000"},
		IsRootClient:   true,
	}

	if err := db.Create(&rootClient).Error; err != nil {
		log.Fatal("❌ Failed to create root client:", err)
	}

	emailProvider := models.ProviderOption{
		ID:          "email",
		Name:        "Email Authentication",
		Description: "Authenticate users using email and password",
		Mappings:    map[string]interface{}{},
	}

	if err := db.Create(&emailProvider).Error; err != nil {
		log.Fatal("❌ Failed to create email provider:", err)
	}

	clientProvider := models.ClientProvider{
		ClientId:         rootClient.ID,
		ProviderOptionId: "email",
		Enabled:          true,
		Data:             map[string]interface{}{},
	}

	if err := db.Create(&clientProvider).Error; err != nil {
		log.Fatal("❌ Failed to create client provider association:", err)
	}
}

func GenerateSecureSecret() string {
	b := make([]byte, 32)
	rand.Read(b)
	return fmt.Sprintf("%x", b)
}

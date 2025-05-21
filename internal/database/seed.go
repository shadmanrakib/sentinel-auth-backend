package database

import (
	"log"
	"sentinel-auth-backend/internal/crypto"
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
		Name:   "Admin Root Client",
		Secret: crypto.GenerateSecureSecret(),
		// TODO: Figure out how to handle the urls for root
		RedirectUris:   pq.StringArray{"http://localhost:3000/callback"},
		AllowedOrigins: pq.StringArray{"http://localhost:3000"},
		IsRootClient:   true,
	}

	if err := db.Create(&rootClient).Error; err != nil {
		log.Fatal("❌ Failed to create root client:", err)
	}

	emailLogoUrl := "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLW1haWwtaWNvbiBsdWNpZGUtbWFpbCI+PHBhdGggZD0ibTIyIDctOC45OTEgNS43MjdhMiAyIDAgMCAxLTIuMDA5IDBMMiA3Ii8+PHJlY3QgeD0iMiIgeT0iNCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjE2IiByeD0iMiIvPjwvc3ZnPg=="

	emailProvider := models.ProviderOption{
		ID:          "email",
		Name:        "Email",
		Description: "Authenticate users using email and password",
		LogoUrl:     &emailLogoUrl,
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

	log.Println("Root client id", clientProvider.ClientId)
}

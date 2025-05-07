package auth

import (
	"sentinel-auth-backend/internal/database"
	"sentinel-auth-backend/internal/models"
	"time"

	"gorm.io/gorm"
)

type GenerateAuthCodeResponse struct {
	Code      string
	ExpiresIn int
}

func GenerateAuthCode(db *gorm.DB, identity *models.Identity) (*GenerateAuthCodeResponse, error) {
	code := database.GenerateSecureSecret()
	expiresIn := 600 // in seconds (10 minutes)

	expiresAt := time.Now().Add(time.Duration(expiresIn) * time.Second)

	redeemAuthCode := models.RedeemAuthCode{
		ClientId:   identity.ClientId,
		IdentityId: identity.ID,
		UserId:     identity.UserId,
		Code:       code,
		Redeemed:   false,
		Revoked:    false,
		ExpiresAt:  expiresAt,
	}

	result := db.Create(&redeemAuthCode)

	if result.Error != nil {
		return nil, result.Error
	}

	resp := GenerateAuthCodeResponse{
		Code: code, ExpiresIn: expiresIn,
	}

	return &resp, nil
}

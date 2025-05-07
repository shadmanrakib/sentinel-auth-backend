package auth

import (
	"errors"
	"sentinel-auth-backend/internal/models"
	"time"

	"gorm.io/gorm"
)

type RedeemAuthCodeError string

const (
	RedeemAuthCodeErrorNotFound    RedeemAuthCodeError = "failed to find code"
	RedeemAuthCodeErrorInvalidCode RedeemAuthCodeError = "invalid code"
)

type Tokens struct {
	Access    string
	Id        string
	Refresh   string
	ExpiresIn int
}

func RedeemAuthCode(db *gorm.DB, clientId string, code string) (*Tokens, error) {
	var authCodeRecord models.RedeemAuthCode

	result := db.First(&authCodeRecord, "code = ? AND client_id = ?", code, clientId)

	if result.Error != nil || result.RowsAffected == 0 {
		return nil, errors.New(string(RedeemAuthCodeErrorNotFound))
	}

	now := time.Now()
	hasExpired := authCodeRecord.ExpiresAt.Unix() <= now.Unix()
	if hasExpired || authCodeRecord.Redeemed || authCodeRecord.Revoked {
		return nil, errors.New(string(RedeemAuthCodeErrorInvalidCode))
	}

	accessToken := "eyJhbGsciOiJIsdUzI1ds345ffNiIsIdassanR5cCI6IkpXVCJ9"
	idToken := "eyJhbGciOsiJIUzIs435df2341NiIsInsdsadasdR5cCI6IkpXVCJ9"
	refresh := "RT_23FJLJHJ023I4"

	tokens := Tokens{
		Access:    accessToken,
		Id:        idToken,
		Refresh:   refresh,
		ExpiresIn: 360000,
	}

	authCodeRecord.Redeemed = true
	db.Save(&authCodeRecord)

	return &tokens, nil
}

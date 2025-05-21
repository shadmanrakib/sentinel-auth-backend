package auth

import (
	"errors"
	"sentinel-auth-backend/internal/crypto"
	"sentinel-auth-backend/internal/models"
	"time"

	"gorm.io/gorm"
)

type RedeemAuthCodeError string

const (
	RedeemAuthCodeErrorNotFound            RedeemAuthCodeError = "failed to find code"
	RedeemAuthCodeErrorInvalidCode         RedeemAuthCodeError = "invalid code"
	RedeemAuthCodeErrorCodeChallengeFailed RedeemAuthCodeError = "code challenge failed"
)

type Tokens struct {
	Access    string
	Id        string
	Refresh   string
	ExpiresIn int
}

func RedeemAuthCode(db *gorm.DB, clientId string, code string, codeVerifier string, client *models.Client) (*Tokens, error) {
	var authCodeRecord models.RedeemAuthCode

	result := db.Preload("Identity").Preload("User").Preload("Client").First(&authCodeRecord, "code = ? AND client_id = ?", code, clientId)

	if result.Error != nil || result.RowsAffected == 0 {
		return nil, errors.New(string(RedeemAuthCodeErrorNotFound))
	}

	now := time.Now()
	hasExpired := authCodeRecord.ExpiresAt.Unix() <= now.Unix()
	if hasExpired || authCodeRecord.Redeemed || authCodeRecord.Revoked {
		return nil, errors.New(string(RedeemAuthCodeErrorInvalidCode))
	}

	if !passesCodeChallenge(authCodeRecord.CodeChallenge, authCodeRecord.CodeChallengeMethod, codeVerifier) {
		return nil, errors.New(string(RedeemAuthCodeErrorCodeChallengeFailed))
	}

	shortTokenDurationSeconds := 60 * 60 * 1
	accessToken, err := crypto.CreateAccessToken(
		client.ID,
		client.Secret,
		"",
		authCodeRecord.Identity.ProviderOptionId,
		crypto.UserData{},
		crypto.Identities{},
		[]string{"profile"},
		now.Unix(),
		shortTokenDurationSeconds,
	)
	if err != nil {
		return nil, err
	}

	idToken, err := crypto.CreateIdToken(
		client.ID,
		client.Secret,
		"",
		authCodeRecord.Identity.ProviderOptionId,
		crypto.UserData{},
		crypto.Identities{},
		now.Unix(),
		shortTokenDurationSeconds,
	)
	if err != nil {
		return nil, err
	}

	// 100 year duration
	refresh, err := crypto.CreateRefreshToken(db, "", now.Unix(), 60*60*24*365*100, &authCodeRecord.Identity, authCodeRecord.CodeChallenge, authCodeRecord.CodeChallengeMethod)
	if err != nil {
		return nil, err
	}

	tokens := Tokens{
		Access:    accessToken,
		Id:        idToken,
		Refresh:   refresh,
		ExpiresIn: shortTokenDurationSeconds,
	}

	authCodeRecord.Redeemed = true
	db.Save(&authCodeRecord)

	return &tokens, nil
}

package auth

import (
	"errors"
	"sentinel-auth-backend/internal/crypto"
	"sentinel-auth-backend/internal/models"
	"time"

	"gorm.io/gorm"
)

type RefreshTokensWithRefreshTokenError string

const (
	RefreshTokensWithRefreshTokenErrorInvalidToken RefreshTokensWithRefreshTokenError = "invalid refresh token"
)

type RefreshedTokens struct {
	Access    string
	Id        string
	ExpiresIn int
}

func getRefreshTokenByToken(db *gorm.DB, token string) (*models.RefreshToken, error) {
	var rf models.RefreshToken
	result := db.Preload("User").Preload("Client").Preload("ProviderOption").Preload("Identity").First(&rf, "token = ?", token)

	if result.RowsAffected == 0 {
		return nil, errors.New("failed to find")
	}

	return &rf, nil
}

func RefreshTokensWithRefreshToken(db *gorm.DB, clientId string, token string, codeVerifier string) (*RefreshedTokens, error) {
	rf, err := getRefreshTokenByToken(db, token)
	if err != nil || rf.ClientId != clientId {
		return nil, errors.New(string(RefreshTokensWithRefreshTokenErrorInvalidToken))
	}

	now := time.Now()
	hasExpired := rf.ExpiresAt.Unix() <= now.Unix()
	if hasExpired || rf.Revoked {
		return nil, errors.New(string(RefreshTokensWithRefreshTokenErrorInvalidToken))
	}

	if !passesCodeChallenge(rf.CodeChallenge, rf.CodeChallengeMethod, codeVerifier) {
		return nil, errors.New(string(RedeemAuthCodeErrorCodeChallengeFailed))
	}

	shortTokenDurationSeconds := 60 * 60 * 1
	accessToken, err := crypto.CreateAccessToken(
		rf.Client.ID,
		rf.Client.Secret,
		"",
		rf.Identity.ProviderOptionId,
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
		rf.Client.ID,
		rf.Client.Secret,
		"",
		rf.Identity.ProviderOptionId,
		crypto.UserData{},
		crypto.Identities{},
		now.Unix(),
		shortTokenDurationSeconds,
	)
	if err != nil {
		return nil, err
	}

	tokens := RefreshedTokens{
		Access:    accessToken,
		Id:        idToken,
		ExpiresIn: shortTokenDurationSeconds,
	}

	return &tokens, nil
}

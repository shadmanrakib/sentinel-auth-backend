package auth

import (
	"errors"
	"sentinel-auth-backend/internal/models"
	"strings"

	"gorm.io/gorm"
)

type SignInWithEmailError string

const (
	SignInWithEmailErrorUnknownUser         SignInWithEmailError = "failed to find user"
	SignInWithEmailErrorPasswordCheckFailed SignInWithEmailError = "failed to verify password"
	SignInWithEmailErrorBadIdentityData     SignInWithEmailError = "identity data is malformed"
)

func findIdentity(db *gorm.DB, clientId string, providerOptionId string, providerSub string) (*models.Identity, error) {
	var identity models.Identity
	result := db.First(&identity, "client_id = ? AND provider_option_id = ? AND provider_sub = ?", clientId, providerOptionId, providerSub)
	if result.Error != nil {
		return nil, result.Error
	}
	if result.RowsAffected == 0 {
		return nil, errors.New("no matches")
	}

	return &identity, nil
}

func SignInWithEmail(db *gorm.DB, clientId string, email string, password string) (*models.Identity, error) {
	email = strings.ToLower(strings.Trim(email, " "))
	identity, err := findIdentity(db, clientId, "email", email)

	if err != nil {
		return nil, errors.New(string(SignInWithEmailErrorUnknownUser))
	}

	hash := identity.Data["password_hash"]

	switch v := hash.(type) {
	case string:
		matches, _ := CompareHashAndPassword(v, password)
		if !matches {
			return nil, errors.New(string(SignInWithEmailErrorPasswordCheckFailed))
		}
		return identity, nil
	default:
		return nil, errors.New(string(SignInWithEmailErrorBadIdentityData))
	}
}

package auth

import (
	"fmt"
	"sentinel-auth-backend/internal/models"
	"sentinel-auth-backend/internal/validators"
	"strings"

	"gorm.io/gorm"
)

type CreateUserWithEmailError string

const (
	CreateUserWithEmailErrorMissingRequiredFields CreateUserWithEmailError = "Missing required fields"
	CreateUserWithEmailErrorInvalidEmail          CreateUserWithEmailError = "Invalid email"
	CreateUserWithEmailErrorWeakPassword          CreateUserWithEmailError = "Weak password"
	CreateUserWithEmailErrorEmailTaken            CreateUserWithEmailError = "Email already taken"
	CreateUserWithEmailErrorInvalidClient         CreateUserWithEmailError = "Client does not exist"
	CreateUserWithEmailErrorInvalidClientProvider CreateUserWithEmailError = "Provider not enabled for client"
	CreateUserWithEmailErrorGeneric               CreateUserWithEmailError = "An error occured"
)

func doesClientExist(db *gorm.DB, clientId string) bool {
	var client models.Client
	result := db.First(&client, clientId)
	return result.RowsAffected > 0
}

func getClientProvider(db *gorm.DB, clientId string, providerOptionId string) (*models.ClientProvider, error) {
	var clientProvider models.ClientProvider
	result := db.First(&clientProvider, "client_id = ? AND provider_option_id = ?", clientId, providerOptionId)

	if result.RowsAffected == 0 {
		return nil, fmt.Errorf("%s", "Failed to find")
	}

	return &clientProvider, nil
}

func isEmailTaken(db *gorm.DB, clientId string, email string) bool {
	var existingUser models.Identity
	result := db.First(&existingUser, "client_id = ? AND sub = ? AND provider_option_id = ?", clientId, email, "email")
	return result.RowsAffected > 0
}

func CreateUserWithEmail(db *gorm.DB, clientId string, email string, password string, metadata *map[string]interface{}) (*models.User, *models.Identity, error) {
	email = strings.ToLower(strings.Trim(email, " "))

	if email == "" || password == "" || clientId == "" {
		return nil, nil, fmt.Errorf("%s", CreateUserWithEmailErrorMissingRequiredFields)
	}

	if valid, _ := validators.IsValidEmail(email); !valid {
		return nil, nil, fmt.Errorf("%s", CreateUserWithEmailErrorInvalidEmail)
	}

	if !validators.IsPasswordStrong(password) {
		return nil, nil, fmt.Errorf("%s", CreateUserWithEmailErrorWeakPassword)
	}

	if !doesClientExist(db, clientId) {
		return nil, nil, fmt.Errorf("%s", CreateUserWithEmailErrorInvalidClient)
	}

	if isEmailTaken(db, clientId, email) {
		return nil, nil, fmt.Errorf("%s", CreateUserWithEmailErrorEmailTaken)
	}

	clientProvider, err := getClientProvider(db, clientId, "email")
	if err != nil && !clientProvider.Enabled {
		return nil, nil, fmt.Errorf("%s", CreateUserWithEmailErrorInvalidClientProvider)
	}

	user := models.User{
		ClientId: clientId,
		Email:    email,
	}

	result := db.Create(&user)

	if result.Error != nil {
		return nil, nil, result.Error
	}

	data := make(models.JsonDictionary)
	hash, err := HashPassword(password)
	if err != nil {
		return nil, nil, fmt.Errorf("%s", CreateUserWithEmailErrorGeneric)
	}
	data["password_hash"] = hash

	identity := models.Identity{
		ClientId:         clientId,
		UserId:           user.ID,
		ProviderSub:      email,
		ProviderOptionId: "email",
		ClientProviderId: clientProvider.ID,
		Data:             data,
	}

	result = db.Create(&identity)
	if result.Error != nil {
		return nil, nil, result.Error
	}

	return &user, &identity, nil
}

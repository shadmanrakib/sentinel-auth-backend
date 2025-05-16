package crypto

import (
	"fmt"
	"log"
	"sentinel-auth-backend/internal/models"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

type Claims = map[string]interface{}

type UserData struct {
	id         string
	attributes Claims
}

type Identities = map[string]Claims

func CreateIdToken(
	secretKeyId string,
	secretKey string,
	issuer string,
	sign_in_provider string,
	userData UserData,
	identities Identities,
	authTime int64,
	tokenDurationInSeconds int,
) (string, error) {
	// TODO: fetch user data outside and pass in
	// TODO: define a struct for this user data

	expiredAt := authTime + int64(tokenDurationInSeconds)

	var token = jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		jwt.MapClaims{
			"typ":       "JWT",
			"alg":       "HS256",
			"kid":       secretKeyId,
			"iss":       issuer,
			"aud":       userData.id,
			"auth_time": authTime,
			"iat":       authTime,
			"exp":       expiredAt,
			"sub":       userData.id,
			"sentinel": map[string]interface{}{
				"identities":       identities,
				"attributes":       userData.attributes,
				"sign_in_provider": sign_in_provider,
			},
		})

	var tokenStr, err = token.SignedString([]byte(secretKey))

	return tokenStr, err
}

func CreateAccessToken(
	secretKeyId string,
	secretKey string,
	issuer string,
	signInProvider string,
	userData UserData,
	identities Identities,
	scopes []string,
	authTime int64,
	tokenDurationInSeconds int,
) (string, error) {
	// TODO: fetch user data outside and pass in
	// TODO: define a struct for this user data

	expiredAt := authTime + int64(tokenDurationInSeconds)

	var token = jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		jwt.MapClaims{
			"typ": "JWT",
			"alg": "HS256",
			"kid": secretKeyId,
			"iss": issuer,
			// TODO: maybe replace with url provided by user
			"aud":       "sentinel",
			"auth_time": authTime,
			"iat":       authTime,
			"exp":       expiredAt,
			"sub":       userData.id,
			"scopes":    []string{},
		})

	var tokenStr, err = token.SignedString([]byte(secretKey))

	return tokenStr, err
}

func CreateRefreshToken(
	db *gorm.DB,
	issuer string,
	authTime int64,
	tokenDurationInSeconds int,
	identity *models.Identity,
) (string, error) {
	expiresAtTimestamp := authTime + int64(tokenDurationInSeconds)
	expiresAt := time.Unix(expiresAtTimestamp, 0)

	random := GenerateSecureSecret()
	token := fmt.Sprintf("RT_%s", random)

	log.Printf("Identity values:")
	log.Printf("  ID: '%s'", identity.ID)
	log.Printf("  ClientId: '%s'", identity.ClientId)
	log.Printf("  ProviderSub: '%s'", identity.ProviderSub)
	log.Printf("  ProviderOptionId: '%s'", identity.ProviderOptionId)
	log.Printf("  ClientProviderId: '%s'", identity.ClientProviderId)
	log.Printf("  UserId: '%s'", identity.UserId)

	rf := models.RefreshToken{
		ClientId:         identity.ClientId,
		ProviderSub:      identity.ProviderSub,
		ProviderOptionId: identity.ProviderOptionId,
		ClientProviderId: identity.ClientProviderId,
		IdentityId:       identity.ID,
		UserId:           identity.UserId,
		Token:            token,
		Revoked:          false,
		ExpiresAt:        expiresAt,
	}

	db.Create(&rf)

	return token, nil
}

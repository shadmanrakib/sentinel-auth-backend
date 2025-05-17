package crypto

import (
	"errors"
	"fmt"
	"sentinel-auth-backend/internal/models"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

type ClaimsDict = map[string]interface{}

type UserData struct {
	id         string
	attributes ClaimsDict
}

type Identities = map[string]ClaimsDict

type TokenClaims struct {
	jwt.RegisteredClaims

	Algorithm string                 `json:"alg,omitempty"`
	KID       string                 `json:"kid,omitempty"`
	AuthTime  int64                  `json:"auth_time,omitempty"`
	Scopes    []string               `json:"scopes,omitempty"`
	Sentinel  map[string]interface{} `json:"sentinel,omitempty"`
	TokenType string                 `json:"typ,omitempty"`
}

func CreateIdToken(
	secretKeyId string,
	secretKey string,
	issuer string,
	signInProvider string,
	userData UserData,
	identities Identities,
	authTime int64,
	tokenDurationInSeconds int,
) (string, error) {
	// TODO: fetch user data outside and pass in
	// TODO: define a struct for this user data

	expiredAt := authTime + int64(tokenDurationInSeconds)

	claims := TokenClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    issuer,
			Audience:  jwt.ClaimStrings{userData.id},
			IssuedAt:  jwt.NewNumericDate(time.Unix(authTime, 0)),
			ExpiresAt: jwt.NewNumericDate(time.Unix(expiredAt, 0)),
			Subject:   userData.id,
		},
		TokenType: "JWT",
		Algorithm: "HS256",
		KID:       secretKeyId,
		AuthTime:  authTime,
		Sentinel: map[string]interface{}{
			"identities":       identities,
			"attributes":       userData.attributes,
			"sign_in_provider": signInProvider,
		},
	}

	var token = jwt.NewWithClaims(
		jwt.SigningMethodHS256, claims,
	)

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

	claims := TokenClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    issuer,
			Audience:  jwt.ClaimStrings{"sentinel"},
			IssuedAt:  jwt.NewNumericDate(time.Unix(authTime, 0)),
			ExpiresAt: jwt.NewNumericDate(time.Unix(expiredAt, 0)),
			Subject:   userData.id,
		},
		TokenType: "JWT",
		Algorithm: "HS256",
		KID:       secretKeyId,
		AuthTime:  authTime,
		Scopes:    scopes,
		Sentinel: map[string]interface{}{
			"identities":       identities,
			"attributes":       userData.attributes,
			"sign_in_provider": signInProvider,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

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

func VerifyToken(client *models.Client, jwtToken string) (*TokenClaims, error) {
	var claims TokenClaims

	_, err := jwt.ParseWithClaims(jwtToken, &claims, func(t *jwt.Token) (interface{}, error) {
		fmt.Printf("Token algorithm: %v\n", t.Header["alg"])
		fmt.Printf("Client secret: %v\n", client.Secret)

		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("non-hmac signing method")
		}
		return []byte(client.Secret), nil
	})

	if err != nil {
		return nil, err
	}

	return &claims, nil
}

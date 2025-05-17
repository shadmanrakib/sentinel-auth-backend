package handlers

import (
	"encoding/json"
	"net/http"
	"sentinel-auth-backend/internal/api"
	"sentinel-auth-backend/internal/crypto"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func tokenClaimsToMap(tokenClaims *crypto.TokenClaims) (map[string]interface{}, error) {
	marshalled, err := json.Marshal(tokenClaims)
	if err != nil {
		return nil, err
	}

	var claimsMap map[string]interface{}
	err = json.Unmarshal(marshalled, &claimsMap)
	if err != nil {
		return nil, err
	}

	return claimsMap, nil
}

func MakePostAuthVerifyHandler(db *gorm.DB) func(*gin.Context) {
	return func(ctx *gin.Context) {
		// parse json request body and validate in proper schema
		var req api.AuthVerifyRequest
		if err := ctx.ShouldBindJSON(&req); err != nil {
			ctx.JSON(http.StatusBadRequest, api.ErrorResponse{
				Error:            "invalid_request",
				ErrorDescription: "Invalid request format: " + err.Error(),
			})
			return
		}

		client, err := getClientById(db, req.ClientId)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, api.ErrorResponse{
				Error:            "invalid_request",
				ErrorDescription: "Invalid request format: " + err.Error(),
			})
			return
		}

		claims, err := crypto.VerifyToken(client, req.Token)

		// handle errors in creating user
		if err != nil {
			ctx.JSON(http.StatusUnauthorized, api.ErrorResponse{
				Error:            "verification_failed",
				ErrorDescription: "Failed to verify token",
			})
			return

		}

		claimsMap, err := tokenClaimsToMap(claims)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, api.ErrorResponse{
				Error:            "internal_server_error",
				ErrorDescription: "Something went wrong :(",
			})
			return
		}

		ctx.JSON(http.StatusOK, api.AuthVerifyResponse{
			Valid:  true,
			Claims: claimsMap,
		})
	}
}

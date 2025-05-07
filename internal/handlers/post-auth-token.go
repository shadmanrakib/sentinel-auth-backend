package handlers

import (
	"net/http"
	"sentinel-auth-backend/internal/api"
	"sentinel-auth-backend/internal/auth"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func MakePostAuthTokenHandler(db *gorm.DB) func(*gin.Context) {
	return func(ctx *gin.Context) {
		// parse json request body and validate in proper schema
		var req api.AuthTokenRequest
		if err := ctx.ShouldBindJSON(&req); err != nil {
			ctx.JSON(http.StatusBadRequest, api.ErrorResponse{
				Error:            "invalid_request",
				ErrorDescription: "Invalid request format: " + err.Error(),
			})
			return
		}

		tokens, err := auth.RedeemAuthCode(db, req.ClientId, req.Code)

		// handle errors in creating user
		if err != nil {
			switch err.Error() {
			case string(auth.RedeemAuthCodeErrorNotFound):
				ctx.JSON(http.StatusUnauthorized, api.ErrorResponse{
					Error:            "invalid_credentials",
					ErrorDescription: "Invalid credentials",
				})
				return
			case string(auth.RedeemAuthCodeErrorInvalidCode):
				ctx.JSON(http.StatusUnauthorized, api.ErrorResponse{
					Error:            "invalid_credentials",
					ErrorDescription: "Invalid credentials",
				})
				return
			default:
				ctx.JSON(http.StatusInternalServerError, "Something went wrong :(")
				return
			}
		}

		ctx.JSON(http.StatusOK, api.AuthTokenTokensResponse{
			AccessToken:  tokens.Access,
			IdToken:      tokens.Id,
			RefreshToken: tokens.Refresh,
			ExpiresIn:    &tokens.ExpiresIn,
		})
	}
}

package handlers

import (
	"net/http"
	"sentinel-auth-backend/internal/api"
	"sentinel-auth-backend/internal/auth"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func MakePostAuthRefreshHandler(db *gorm.DB) func(*gin.Context) {
	return func(ctx *gin.Context) {
		// parse json request body and validate in proper schema
		var req api.AuthRefreshRequest
		if err := ctx.ShouldBindJSON(&req); err != nil {
			ctx.JSON(http.StatusBadRequest, api.ErrorResponse{
				Error:            "invalid_request",
				ErrorDescription: "Invalid request format: " + err.Error(),
			})
			return
		}

		tokens, err := auth.RefreshTokensWithRefreshToken(db, req.ClientId, req.RefreshToken)

		// handle errors in creating user
		if err != nil {
			switch err.Error() {
			case string(auth.RefreshTokensWithRefreshTokenErrorInvalidToken):
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

		ctx.JSON(http.StatusOK, api.AuthRefreshTokensResponse{
			AccessToken: tokens.Access,
			IdToken:     tokens.Id,
			ExpiresIn:   tokens.ExpiresIn,
		})
	}
}

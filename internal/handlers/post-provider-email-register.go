package handlers

import (
	"net/http"
	"sentinel-auth-backend/internal/api"
	"sentinel-auth-backend/internal/auth"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func MakePostProviderEmailRegisterHandler(db *gorm.DB) func(*gin.Context) {
	return func(ctx *gin.Context) {
		// parse json request body and validate in proper schema
		var req api.EmailRegistrationRequest
		if err := ctx.ShouldBindJSON(&req); err != nil {
			ctx.JSON(http.StatusBadRequest, api.ErrorResponse{
				Error:            "invalid_request",
				ErrorDescription: "Invalid request format: " + err.Error(),
			})
			return
		}

		email := string(req.Email)
		_, identity, err := auth.CreateUserWithEmail(db, req.ClientId, email, req.Password, req.Metadata)

		// handle errors in creating user
		if err != nil {
			switch err.Error() {
			case string(auth.CreateUserWithEmailErrorMissingRequiredFields):
				ctx.JSON(http.StatusBadRequest, api.ErrorResponse{
					Error:            "invalid_request",
					ErrorDescription: "Missing required fields",
				})
				return
			case string(auth.CreateUserWithEmailErrorInvalidEmail):
				ctx.JSON(http.StatusBadRequest, api.ErrorResponse{
					Error:            "invalid_request",
					ErrorDescription: "Invalid email",
				})
				return
			case string(auth.CreateUserWithEmailErrorWeakPassword):
				ctx.JSON(http.StatusBadRequest, api.ErrorResponse{
					Error:            "invalid_request",
					ErrorDescription: "Weak email",
				})
				return
			case string(auth.CreateUserWithEmailErrorEmailTaken):
				ctx.JSON(http.StatusConflict, api.ErrorResponse{
					Error:            "email_exists",
					ErrorDescription: "Email is already registered",
				})
				return
			case string(auth.CreateUserWithEmailErrorInvalidClient):
				ctx.JSON(http.StatusBadRequest, api.ErrorResponse{
					Error:            "invalid_client",
					ErrorDescription: "Client does not exist",
				})
				return
			default:
				ctx.JSON(http.StatusInternalServerError, "Something went wrong :(")
				return
			}
		}

		codeResp, err := auth.GenerateAuthCode(db, identity)

		if err != nil {
			ctx.JSON(http.StatusInternalServerError, "Something went wrong :(")
			return
		}

		ctx.JSON(http.StatusOK, api.AuthCodeResponse{
			Code:      codeResp.Code,
			ExpiresIn: &codeResp.ExpiresIn,
		})
	}
}

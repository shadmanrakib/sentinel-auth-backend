package handlers

import (
	"net/http"
	"sentinel-auth-backend/internal/api"
	"sentinel-auth-backend/internal/auth"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func MakePostProviderEmailLoginHandler(db *gorm.DB) func(*gin.Context) {
	return func(ctx *gin.Context) {
		// parse json request body and validate in proper schema
		var req api.EmailLoginRequest
		if err := ctx.ShouldBindJSON(&req); err != nil {
			ctx.JSON(http.StatusBadRequest, api.ErrorResponse{
				Error:            "invalid_request",
				ErrorDescription: "Invalid request format: " + err.Error(),
			})
			return
		}

		email := string(req.Email)
		identity, err := auth.SignInWithEmail(db, req.ClientId, email, req.Password)

		// handle errors in creating user
		if err != nil {
			switch err.Error() {
			case string(auth.SignInWithEmailErrorUnknownUser):
				// we are not specific to prevent some attacks
				// that try to find valid emails
				ctx.JSON(http.StatusUnauthorized, api.ErrorResponse{
					Error:            "invalid_credentials",
					ErrorDescription: "Invalid credentials",
				})
				return
			case string(auth.SignInWithEmailErrorPasswordCheckFailed):
				ctx.JSON(http.StatusUnauthorized, api.ErrorResponse{
					Error:            "invalid_credentials",
					ErrorDescription: "Invalid credentials",
				})
				return
			case string(auth.SignInWithEmailErrorBadIdentityData):
				ctx.JSON(http.StatusInternalServerError, api.ErrorResponse{
					Error:            "server_error",
					ErrorDescription: "Something is wrong with the server data",
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
			ExpiresIn: codeResp.ExpiresIn,
		})
	}
}

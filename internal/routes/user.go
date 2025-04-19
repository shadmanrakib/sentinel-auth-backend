package routes

import (
	"sentinel-auth-backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

// make sure all these handlers check access token
func RegisterUserRoutes(g *gin.RouterGroup) {
	// return all claims/attributes you would find on the id token
	g.GET("/info", handlers.Stub)

	// provided an id token, revoke it
	g.POST("/revoke/id", handlers.Stub)

	// provided an access token, revoke it
	g.POST("/revoke/access", handlers.Stub)

	// provided a refresh token, revoke it
	g.POST("/revoke/refresh", handlers.Stub)
}

package routes

import (
	"sentinel-auth-backend/internal/api"
	"sentinel-auth-backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

// make sure all these handlers check access token
func RegisterUserRoutes(g *gin.RouterGroup, wrapper *api.ServerInterfaceWrapper) {
	// return all claims/attributes you would find on the id token
	g.GET("/info", handlers.StubHandler)

	// provided an id token, revoke it
	g.POST("/revoke/id", handlers.StubHandler)

	// provided an access token, revoke it
	g.POST("/revoke/access", handlers.StubHandler)

	// provided a refresh token, revoke it
	g.POST("/revoke/refresh", handlers.StubHandler)
}

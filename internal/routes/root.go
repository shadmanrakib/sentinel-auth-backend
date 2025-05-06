package routes

import (
	"sentinel-auth-backend/internal/api"
	"sentinel-auth-backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterRootRoutes(g *gin.RouterGroup, wrapper *api.ServerInterfaceWrapper) {
	g.GET("/.well-known/jwks.json", handlers.StubHandler)
}

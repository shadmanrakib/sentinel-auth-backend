package routes

import (
	"sentinel-auth-backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterRootRoutes(g *gin.RouterGroup) {
	g.GET("/.well-known/jwks.json", handlers.Stub)
}

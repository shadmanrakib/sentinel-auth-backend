package routes
import (
	"sentinel-auth-backend/internal/api"
	"sentinel-auth-backend/internal/handlers"
	"github.com/gin-gonic/gin"
)

// make sure all these handlers check if admin
func RegisterAdminRoutes(g *gin.RouterGroup, wrapper *api.ServerInterfaceWrapper) {
	g.POST("/provider/enable", handlers.EnableProviderHandler)	
	g.POST("/provider/disable", handlers.DisableProviderHandler)
	g.GET("/providers", handlers.GetClientProvidersHandler)
	g.PUT("/provider/keys", handlers.UpdateProviderKeysHandler)

}

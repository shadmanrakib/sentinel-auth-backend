package routes

import (
	"sentinel-auth-backend/internal/api"
	"sentinel-auth-backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterAuthRoutes(g *gin.RouterGroup, wrapper *api.ServerInterfaceWrapper) {
	// return all available providers that a user can sign in with for given application
	g.GET("/providers", wrapper.GetAuthProviders)

	// register user via email (do not issue tokens)
	g.POST("/providers/email/register", wrapper.PostAuthProvidersEmailRegister)
	// sign in user and return a one time code that can be used to fetch tokens later
	g.POST("/providers/email/login", wrapper.PostAuthProvidersEmailLogin)

	// use code to fetch sentinel auth tokens (id, access, refresh). has code verification step
	g.POST("/token", wrapper.PostAuthToken)

	// exchange provider tokens for a one time code which can be used to later sentinel auth tokens (id, access, refresh)
	g.POST("/exchange", handlers.StubHandler)

	// take a refresh token and return refreshed access token and id token
	g.POST("/refresh", wrapper.PostAuthRefresh)
}

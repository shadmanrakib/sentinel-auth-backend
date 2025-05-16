package server

import (
	"sentinel-auth-backend/internal/api"
	"sentinel-auth-backend/internal/config"
	"sentinel-auth-backend/internal/handlers"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Server struct {
	DB     *gorm.DB
	Config *config.Config
}

func Create(db *gorm.DB, config *config.Config) *Server {
	return &Server{
		DB:     db,
		Config: config,
	}
}

func (s *Server) GetAuthProviders(c *gin.Context, params api.GetAuthProvidersParams) {
	handlers.MakeGetProvidersHandler(s.DB)(c, params)
}

func (s *Server) PostAuthProvidersEmailRegister(c *gin.Context) {
	handlers.MakePostProviderEmailRegisterHandler(s.DB)(c)
}

func (s *Server) PostAuthProvidersEmailLogin(c *gin.Context) {
	handlers.MakePostProviderEmailLoginHandler(s.DB)(c)
}

func (s *Server) PostAuthToken(c *gin.Context) {
	handlers.MakePostAuthTokenHandler(s.DB)(c)
}

func (s *Server) PostAuthRefresh(c *gin.Context) {
	handlers.MakePostAuthRefreshHandler(s.DB)(c)
}

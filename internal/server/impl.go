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

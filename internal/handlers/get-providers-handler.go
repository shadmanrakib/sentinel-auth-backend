package handlers

import (
	"net/http"
	"sentinel-auth-backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func MakeGetProvidersHandler(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var providers []models.ClientProvider
		db.Where("client_id = ?").Find(&providers)
		ctx.JSON(http.StatusNotImplemented, gin.H{"message": "Need to implement!"})
	}
}

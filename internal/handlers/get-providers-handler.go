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

		clientID := ctx.Query("client_id")
		if clientID == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "client_id is required"})
			return
		}

		db.Where("client_id = ?", clientID).Find(&providers)

		ctx.JSON(http.StatusOK, gin.H{"providers": providers})
	}
}

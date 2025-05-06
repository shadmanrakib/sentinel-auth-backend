package handlers

import (
	"net/http"
	"sentinel-auth-backend/internal/api"
	"sentinel-auth-backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func MakeGetProvidersHandler(db *gorm.DB) func(*gin.Context, api.GetAuthProvidersParams) {
	return func(ctx *gin.Context, params api.GetAuthProvidersParams) {
		if params.ClientId == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "client_id is required"})
			return
		}

		var providers []models.ClientProvider
		db.Where("client_id = ?", params.ClientId).Find(&providers)

		var enrichedProviders []api.StrippedClientProvider
		for _, provider := range providers {
			var providerOption models.ProviderOption
			db.Where("id = ?", provider.ID).Find(&providerOption)

			enrichedProviders = append(enrichedProviders, api.StrippedClientProvider{
				ClientId: &params.ClientId,
				Data:     (*map[string]interface{})(&provider.Data),
				Id:       &provider.ID,
				ProviderOption: &struct {
					Description *string `json:"description,omitempty"`
					Id          *string `json:"id,omitempty"`
					LogoUrl     *string `json:"logo_url,omitempty"`
					Name        *string `json:"name,omitempty"`
				}{
					Description: &providerOption.Description,
					Id:          &providerOption.ID,
					LogoUrl:     providerOption.LogoUrl,
					Name:        &providerOption.Name,
				},
			})
		}

		ctx.JSON(http.StatusOK, enrichedProviders)
	}
}

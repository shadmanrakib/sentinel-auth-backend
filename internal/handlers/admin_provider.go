package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"sentinel-auth-backend/internal/models"
	"sentinel-auth-backend/internal/database" 
)

type ProviderToggleRequest struct {
	ClientId         string `json:"client_id" binding:"required"`
	ProviderOptionId string `json:"provider_option_id" binding:"required"`
}

func EnableProviderHandler(c *gin.Context) {
	var req ProviderToggleRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing or invalid request fields"})
		return
	}

	db := database.GetDb()

	var cp models.ClientProvider
	err := db.First(&cp, "client_id = ? AND provider_option_id = ?", req.ClientId, req.ProviderOptionId).Error
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ClientProvider entry not found"})
		return
	}

	cp.Enabled = true
	if err := db.Save(&cp).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to enable provider"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Provider enabled"})
}

func DisableProviderHandler(c *gin.Context) {
	var req ProviderToggleRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing or invalid request fields"})
		return
	}

	db := database.GetDb()

	var cp models.ClientProvider
	err := db.First(&cp, "client_id = ? AND provider_option_id = ?", req.ClientId, req.ProviderOptionId).Error
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ClientProvider entry not found"})
		return
	}

	cp.Enabled = false
	if err := db.Save(&cp).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to disable provider"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Provider disabled"})
}

func GetClientProvidersHandler(c *gin.Context) {
	clientId := c.Query("client_id")
	if clientId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "client_id is required"})
		return
	}

	db := database.GetDb()

	var clientProviders []models.ClientProvider
	if err := db.Where("client_id = ?", clientId).Find(&clientProviders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch providers"})
		return
	}

	c.JSON(http.StatusOK, clientProviders)
}

func UpdateProviderKeysHandler(c *gin.Context) {
	var req struct {
		ProviderOptionId string `json:"provider_option_id" binding:"required"`
		Name             string `json:"name"`
		ClientId         string `json:"client_id"`
		ClientSecret     string `json:"client_secret"`
		RedirectUri      string `json:"redirect_uri"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing or invalid fields"})
		return
	}

	db := database.GetDb()

	var provider models.ProviderOption
	if err := db.First(&provider, "id = ?", req.ProviderOptionId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Provider not found"})
		return
	}

	if req.Name != "" {
		provider.Name = req.Name
	}
	if req.ClientId != "" {
		provider.ClientID = req.ClientId
	}
	if req.ClientSecret != "" {
		provider.ClientSecret = req.ClientSecret
	}
	if req.RedirectUri != "" {
		provider.RedirectURI = req.RedirectUri
	}

	if err := db.Save(&provider).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update provider keys"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Provider keys updated successfully"})
}

package models

import (
	"time"

	"gorm.io/gorm"
)

type ProviderOption struct {
	ID          string         `gorm:"type:varchar;primaryKey"`
	Name        string         `gorm:"not null"`
	ClientID      string         `gorm:"type:varchar"` // authentication with provider
	ClientSecret  string         `gorm:"type:varchar"` // verification of app
	RedirectURI   string         `gorm:"type:varchar"` // direct after login
	Mappings    JsonDictionary `gorm:"type:jsonb"`
	LogoUrl     *string
	Description string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   gorm.DeletedAt `gorm:"index"`
}

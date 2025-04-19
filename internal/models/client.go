package models

import (
	"time"

	"gorm.io/gorm"
)

type Client struct {
	ID             string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Name           string `gorm:"not null"`
	Secret         string `gorm:"not null"`
	LogoUrl        *string
	RedirectUris   []string
	AllowedOrigins []string
	CreatedAt      time.Time
	UpdatedAt      time.Time
	DeletedAt      gorm.DeletedAt `gorm:"index"`
}

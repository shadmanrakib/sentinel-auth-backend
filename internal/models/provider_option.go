package models

import (
	"time"

	"gorm.io/gorm"
)

type ProviderOption struct {
	ID          string         `gorm:"type:varchar;primaryKey"`
	Name        string         `gorm:"not null"`
	Mappings    JsonDictionary `gorm:"type:jsonb"`
	LogoUrl     *string
	Description string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   gorm.DeletedAt `gorm:"index"`
}

package models

import (
	"time"

	"gorm.io/gorm"
)

type ClientProvider struct {
	ID               string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	ClientId         string         `gorm:"not null"`
	ProviderOptionId string         `gorm:"type:varchar"`
	Data             JsonDictionary `gorm:"type:jsonb"`
	Enabled          bool
	CreatedAt        time.Time
	UpdatedAt        time.Time
	DeletedAt        gorm.DeletedAt `gorm:"index"`

	Client         `gorm:"references:ID;foreignKey:ClientId"`
	ProviderOption `gorm:"references:ID;foreignKey:ProviderOptionId"`
}

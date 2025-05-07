package models

import (
	"time"

	"gorm.io/gorm"
)

type Identity struct {
	ID               string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	ClientId         string `gorm:"not null"`
	ProviderSub      string
	ProviderOptionId string         `gorm:"type:varchar"`
	ClientProviderId string         `gorm:"type:varchar"`
	UserId           string         `gorm:"type:uuid"`
	Data             JsonDictionary `gorm:"type:jsonb"`
	CreatedAt        time.Time
	UpdatedAt        time.Time
	DeletedAt        gorm.DeletedAt `gorm:"index"`

	User           User           `gorm:"references:ID;foreignKey:UserId" json:"-"`
	Client         Client         `gorm:"references:ID;foreignKey:ClientId" json:"-"`
	ProviderOption ProviderOption `gorm:"references:ID;foreignKey:ProviderOptionId" json:"-"`
	ClientProvider ClientProvider `gorm:"references:ID;foreignKey:ClientProviderId" json:"-"`
}

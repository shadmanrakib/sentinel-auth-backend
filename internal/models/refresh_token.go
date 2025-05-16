package models

import (
	"time"

	"gorm.io/gorm"
)

type RefreshToken struct {
	ID               string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	ClientId         string `gorm:"not null"`
	ProviderSub      string
	ProviderOptionId string `gorm:"type:varchar"`
	ClientProviderId string `gorm:"type:varchar"`
	IdentityId       string `gorm:"type:uuid"`
	UserId           string `gorm:"type:uuid"`
	Token            string `gorm:"not null"`
	Revoked          bool   `gorm:"default:FALSE"`
	ExpiresAt        time.Time
	CreatedAt        time.Time
	UpdatedAt        time.Time
	DeletedAt        gorm.DeletedAt `gorm:"index"`

	User           User           `gorm:"references:ID;foreignKey:UserId" json:"-"`
	Client         Client         `gorm:"references:ID;foreignKey:ClientId" json:"-"`
	ProviderOption ProviderOption `gorm:"references:ID;foreignKey:ProviderOptionId" json:"-"`
	ClientProvider ClientProvider `gorm:"references:ID;foreignKey:ClientProviderId" json:"-"`
	Identity       Identity       `gorm:"references:ID;foreignKey:IdentityId" json:"-"`
}

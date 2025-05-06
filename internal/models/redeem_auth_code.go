package models

import (
	"time"

	"gorm.io/gorm"
)

type RedeemAuthCode struct {
	ID         string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	ClientId   string `gorm:"type:uuid;not null"`
	IdentityId string `gorm:"type:uuid;not null"`
	UserId     string `gorm:"type:uuid;not null"`
	Code       string
	Redeemed   bool
	Revoked    bool
	ExpiresAt  time.Time
	CreatedAt  time.Time
	UpdatedAt  time.Time
	DeletedAt  gorm.DeletedAt `gorm:"index"`

	Client   `gorm:"references:ID;foreignKey:ClientId"`
	Identity `gorm:"references:ID;foreignKey:IdentityId"`
	User     `gorm:"references:ID;foreignKey:UserId"`
}

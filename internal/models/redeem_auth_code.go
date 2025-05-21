package models

import (
	"time"

	"gorm.io/gorm"
)

type RedeemAuthCode struct {
	ID                  string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	ClientId            string `gorm:"type:uuid;not null"`
	IdentityId          string `gorm:"type:uuid;not null"`
	UserId              string `gorm:"type:uuid;not null"`
	Code                string
	CodeChallenge       string
	CodeChallengeMethod string
	Redeemed            bool
	Revoked             bool
	ExpiresAt           time.Time
	CreatedAt           time.Time
	UpdatedAt           time.Time
	DeletedAt           gorm.DeletedAt `gorm:"index"`

	Client   Client   `gorm:"foreignKey:ClientId" json:"-"`
	Identity Identity `gorm:"foreignKey:IdentityId" json:"-"`
	User     User     `gorm:"foreignKey:UserId" json:"-"`
}

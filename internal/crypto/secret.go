package crypto

import (
	"crypto/rand"
	"fmt"
)

func GenerateSecureSecret() string {
	b := make([]byte, 32)
	rand.Read(b)
	return fmt.Sprintf("%x", b)
}

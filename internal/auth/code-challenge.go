package auth

import (
	"crypto/sha256"
	"encoding/base64"
)

func passesS256CodeChallenge(codeChallenge string, codeVerifier string) bool {
	hasher := sha256.New()
	hasher.Write([]byte(codeVerifier))
	codeVerifierHash := hasher.Sum(nil)

	codeChallengeVerification := base64.RawURLEncoding.EncodeToString(codeVerifierHash)

	return codeChallengeVerification == codeChallenge
}

func passesCodeChallenge(codeChallenge string, codeChallengeMethod string, codeVerifier string) bool {
	if codeChallengeMethod == "S256" {
		return passesS256CodeChallenge(codeChallenge, codeVerifier)
	}

	return true
}

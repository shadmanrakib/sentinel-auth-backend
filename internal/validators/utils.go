package validators

import (
	"net/mail"
	"unicode/utf8"
)

func IsValidEmail(email string) (bool, error) {
	_, err := mail.ParseAddress(email)
	return err != nil, err
}

func IsPasswordStrong(password string) bool {
	runeLength := utf8.RuneCountInString(password)
	return runeLength >= 6
}

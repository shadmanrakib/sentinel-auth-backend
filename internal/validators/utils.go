package validators

import (
	"regexp"
	"unicode/utf8"
)

func IsValidEmail(email string) bool {
	re := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return re.MatchString(email)
}

func IsPasswordStrong(password string) bool {
	runeLength := utf8.RuneCountInString(password)
	return runeLength >= 6
}

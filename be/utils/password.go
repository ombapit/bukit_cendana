package utils

import (
	"crypto/rand"
	"encoding/hex"

	"golang.org/x/crypto/bcrypt"
)

// GenerateSalt menghasilkan random salt 32 karakter hex (16 bytes)
func GenerateSalt() (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// HashPassword menghasilkan bcrypt hash dari salt + password
func HashPassword(password, salt string) (string, error) {
	salted := salt + password
	bytes, err := bcrypt.GenerateFromPassword([]byte(salted), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPassword memverifikasi password terhadap hash dengan salt
func CheckPassword(password, salt, hash string) bool {
	salted := salt + password
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(salted))
	return err == nil
}

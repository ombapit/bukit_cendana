package utils

import (
	"fmt"
	"os"
	"path/filepath"

	qrcode "github.com/skip2/go-qrcode"
)

// GenerateWargaQR creates a QR code PNG for a warga and returns the web-accessible path.
func GenerateWargaQR(id, nama, blok string) (string, error) {
	dir := filepath.Join("uploads", "qrcodes")
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", fmt.Errorf("failed to create qrcodes dir: %w", err)
	}

	content := fmt.Sprintf(`{"app":"bukitcendana","id":%q,"nama":%q,"blok":%q}`, id, nama, blok)
	filePath := filepath.Join(dir, id+".png")

	if err := qrcode.WriteFile(content, qrcode.Medium, 256, filePath); err != nil {
		return "", fmt.Errorf("failed to generate QR code: %w", err)
	}

	return "/uploads/qrcodes/" + id + ".png", nil
}

// DeleteWargaQR removes the QR code file for a warga (ignores missing file).
func DeleteWargaQR(id string) {
	filePath := filepath.Join("uploads", "qrcodes", id+".png")
	_ = os.Remove(filePath)
}

package models

import (
	"time"

	"github.com/google/uuid"
)

type Warga struct {
	ID            uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Nama          string    `gorm:"type:varchar(255);not null" json:"nama"`
	Blok          string    `gorm:"type:varchar(50);not null" json:"blok"`
	NoTelp        string    `gorm:"type:varchar(20)" json:"no_telp"`
	Iuran         float64   `gorm:"type:decimal(12,2);default:0" json:"iuran"`
	KondisiRumah  string    `gorm:"type:varchar(50);default:''" json:"kondisi_rumah"`
	QRCode        string    `gorm:"type:varchar(500);default:''" json:"qr_code"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (Warga) TableName() string {
	return "warga"
}

type WargaResponse struct {
	ID           uuid.UUID `json:"id"`
	Nama         string    `json:"nama"`
	Blok         string    `json:"blok"`
	Iuran        float64   `json:"iuran"`
	KondisiRumah string    `json:"kondisi_rumah,omitempty"`
	QRCode       string    `json:"qr_code,omitempty"`
}

func (w *Warga) ToResponse() WargaResponse {
	return WargaResponse{
		ID:           w.ID,
		Nama:         w.Nama,
		Blok:         w.Blok,
		Iuran:        w.Iuran,
		KondisiRumah: w.KondisiRumah,
		QRCode:       w.QRCode,
	}
}

type WargaWithLastPayment struct {
	ID           uuid.UUID `json:"id" gorm:"type:uuid;column:id"`
	Nama         string    `json:"nama" gorm:"column:nama"`
	Blok         string    `json:"blok" gorm:"column:blok"`
	Iuran        float64   `json:"iuran" gorm:"column:iuran"`
	KondisiRumah string    `json:"kondisi_rumah" gorm:"column:kondisi_rumah"`
	QRCode       string    `json:"qr_code" gorm:"column:qr_code"`
	LastPayment  string    `json:"last_payment" gorm:"column:last_payment"`
}

type CreateWargaRequest struct {
	Nama         string  `json:"nama" binding:"required"`
	Blok         string  `json:"blok" binding:"required"`
	NoTelp       string  `json:"no_telp"`
	Iuran        float64 `json:"iuran"`
	KondisiRumah string  `json:"kondisi_rumah"`
}

type UpdateWargaRequest struct {
	Nama         string  `json:"nama"`
	Blok         string  `json:"blok"`
	NoTelp       string  `json:"no_telp"`
	Iuran        float64 `json:"iuran"`
	KondisiRumah string  `json:"kondisi_rumah"`
}
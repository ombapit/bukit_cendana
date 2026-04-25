package models

import (
	"time"

	"github.com/google/uuid"
)

type Warga struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Nama      string    `gorm:"type:varchar(255);not null" json:"nama"`
	Blok      string    `gorm:"type:varchar(50);not null" json:"blok"`
	NoTelp    string    `gorm:"type:varchar(20)" json:"no_telp"`
	Iuran     float64   `gorm:"type:decimal(12,2);default:0" json:"iuran"`
	QRCode    string    `gorm:"type:varchar(500);default:''" json:"qr_code"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (Warga) TableName() string {
	return "warga"
}

type WargaResponse struct {
	ID     uuid.UUID `json:"id"`
	Nama   string    `json:"nama"`
	Blok   string    `json:"blok"`
	NoTelp string    `json:"no_telp,omitempty"`
	Iuran  float64   `json:"iuran"`
	QRCode string    `json:"qr_code,omitempty"`
}

func (w *Warga) ToResponse() WargaResponse {
	return WargaResponse{
		ID:     w.ID,
		Nama:   w.Nama,
		Blok:   w.Blok,
		NoTelp: w.NoTelp,
		Iuran:  w.Iuran,
		QRCode: w.QRCode,
	}
}

type WargaWithLastPayment struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;column:id"`
	Nama        string    `json:"nama" gorm:"column:nama"`
	Blok        string    `json:"blok" gorm:"column:blok"`
	NoTelp      string    `json:"no_telp,omitempty" gorm:"column:no_telp"`
	Iuran       float64   `json:"iuran" gorm:"column:iuran"`
	QRCode      string    `json:"qr_code" gorm:"column:qr_code"`
	LastPayment string    `json:"last_payment" gorm:"column:last_payment"`
}

type CreateWargaRequest struct {
	Nama   string  `json:"nama" binding:"required"`
	Blok   string  `json:"blok" binding:"required"`
	NoTelp string  `json:"no_telp"`
	Iuran  float64 `json:"iuran"`
}

type UpdateWargaRequest struct {
	Nama   string  `json:"nama"`
	Blok   string  `json:"blok"`
	NoTelp string  `json:"no_telp"`
	Iuran  float64 `json:"iuran"`
}
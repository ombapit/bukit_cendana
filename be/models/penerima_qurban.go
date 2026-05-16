package models

import (
	"time"

	"github.com/google/uuid"
)

type PenerimaQurban struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Nama         string    `gorm:"type:varchar(255);not null" json:"nama"`
	Blok         string    `gorm:"type:varchar(50);not null" json:"blok"`
	NoTelp       string    `gorm:"type:varchar(20);default:''" json:"no_telp"`
	KondisiRumah string    `gorm:"type:varchar(50);default:''" json:"kondisi_rumah"`
	QRCode       string    `gorm:"type:varchar(500);default:''" json:"qr_code"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (PenerimaQurban) TableName() string { return "penerima_qurban" }

type CreatePenerimaQurbanRequest struct {
	Nama         string `json:"nama" binding:"required"`
	Blok         string `json:"blok" binding:"required"`
	NoTelp       string `json:"no_telp"`
	KondisiRumah string `json:"kondisi_rumah"`
}

type UpdatePenerimaQurbanRequest struct {
	Nama         string `json:"nama"`
	Blok         string `json:"blok"`
	NoTelp       string `json:"no_telp"`
	KondisiRumah string `json:"kondisi_rumah"`
}

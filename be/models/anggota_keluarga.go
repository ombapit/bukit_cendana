package models

import (
	"time"

	"github.com/google/uuid"
)

type AnggotaKeluarga struct {
	ID              uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	WargaID         uuid.UUID `gorm:"type:uuid;not null;index"                        json:"warga_id"`
	Nama            string    `gorm:"type:varchar(255);not null"                      json:"nama"`
	StatusHubungan  string    `gorm:"type:varchar(100);not null;default:''"           json:"status_hubungan"`
	NoTelp          string    `gorm:"type:varchar(20);not null;default:''"            json:"no_telp"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

func (AnggotaKeluarga) TableName() string { return "anggota_keluarga" }

type CreateAnggotaKeluargaRequest struct {
	Nama           string `json:"nama" binding:"required"`
	StatusHubungan string `json:"status_hubungan"`
	NoTelp         string `json:"no_telp"`
}

type UpdateAnggotaKeluargaRequest struct {
	Nama           string `json:"nama"`
	StatusHubungan string `json:"status_hubungan"`
	NoTelp         string `json:"no_telp"`
}

package models

import (
	"time"

	"github.com/google/uuid"
)

type PengumumanKategori struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Nama      string    `gorm:"type:varchar(100);not null;uniqueIndex;column:nama" json:"nama"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (PengumumanKategori) TableName() string { return "pengumuman_kategori" }

type CreatePengumumanKategoriRequest struct {
	Nama string `json:"nama"`
}

type UpdatePengumumanKategoriRequest struct {
	Nama string `json:"nama"`
}

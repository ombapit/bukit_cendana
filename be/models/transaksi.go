package models

import (
	"time"

	"github.com/google/uuid"
)

type Transaksi struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	WargaID    uuid.UUID `gorm:"type:uuid;not null" json:"warga_id"`
	TanggalIPL string    `gorm:"type:varchar(6);not null;column:tanggal_ipl" json:"tanggal_ipl"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	Warga      *Warga    `gorm:"foreignKey:WargaID" json:"warga,omitempty"`
}

func (Transaksi) TableName() string {
	return "transaksi"
}

type TransaksiResponse struct {
	ID         uuid.UUID `json:"id"`
	WargaID    uuid.UUID `json:"warga_id"`
	WargaNama  string    `json:"warga_nama"`
	WargaBlok  string    `json:"warga_blok"`
	TanggalIPL string    `json:"tanggal_ipl"`
	CreatedAt  time.Time `json:"created_at"`
}

func (t *Transaksi) ToResponse() TransaksiResponse {
	nama := ""
	blok := ""
	if t.Warga != nil {
		nama = t.Warga.Nama
		blok = t.Warga.Blok
	}
	return TransaksiResponse{
		ID:         t.ID,
		WargaID:    t.WargaID,
		WargaNama:  nama,
		WargaBlok:  blok,
		TanggalIPL: t.TanggalIPL,
		CreatedAt:  t.CreatedAt,
	}
}

type CreateTransaksiRequest struct {
	WargaID    uuid.UUID `json:"warga_id" binding:"required"`
	TanggalIPL string    `json:"tanggal_ipl" binding:"required"`
}
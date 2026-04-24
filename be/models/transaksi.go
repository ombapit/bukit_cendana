package models

import (
	"time"

	"github.com/google/uuid"
)

type IPL struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	WargaID    uuid.UUID `gorm:"type:uuid;not null" json:"warga_id"`
	TanggalIPL string    `gorm:"type:varchar(6);not null;column:tanggal_ipl" json:"tanggal_ipl"`
	Gambar     string    `gorm:"type:varchar(500)" json:"gambar"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	Warga      *Warga    `gorm:"foreignKey:WargaID" json:"warga,omitempty"`
}

func (IPL) TableName() string {
	return "ipls"
}

type IPLResponse struct {
	ID         uuid.UUID `gorm:"column:id"          json:"id"`
	WargaID    uuid.UUID `gorm:"column:warga_id"    json:"warga_id"`
	WargaNama  string    `gorm:"column:warga_nama"  json:"warga_nama"`
	WargaBlok  string    `gorm:"column:warga_blok"  json:"warga_blok"`
	TanggalIPL string    `gorm:"column:tanggal_ipl" json:"tanggal_ipl"`
	Gambar     string    `gorm:"column:gambar"      json:"gambar"`
	CreatedAt  time.Time `gorm:"column:created_at"  json:"created_at"`
}

func (t *IPL) ToResponse() IPLResponse {
	nama := ""
	blok := ""
	if t.Warga != nil {
		nama = t.Warga.Nama
		blok = t.Warga.Blok
	}
	return IPLResponse{
		ID:         t.ID,
		WargaID:    t.WargaID,
		WargaNama:  nama,
		WargaBlok:  blok,
		TanggalIPL: t.TanggalIPL,
		Gambar:     t.Gambar,
		CreatedAt:  t.CreatedAt,
	}
}

type CreateIPLRequest struct {
	WargaID    uuid.UUID `json:"warga_id"`
	TanggalIPL string    `json:"tanggal_ipl"`
	Gambar     string    `json:"gambar"`
	CreatedAt  time.Time `json:"created_at"`
}

type UpdateIPLRequest struct {
	TanggalIPL string    `json:"tanggal_ipl"`
	Gambar     string    `json:"gambar"`
	CreatedAt  time.Time `json:"created_at"`
}

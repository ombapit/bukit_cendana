package models

import (
	"time"

	"github.com/google/uuid"
)

type PengambilanQurban struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	WargaID   uuid.UUID `gorm:"type:uuid;not null;uniqueIndex" json:"warga_id"`
	Status    string    `gorm:"type:varchar(50);not null;default:'Sudah Diambil'" json:"status"`
	CreatedBy string    `gorm:"type:varchar(255);not null" json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (PengambilanQurban) TableName() string { return "pengambilan_qurban" }

type PengambilanQurbanResponse struct {
	ID        uuid.UUID `json:"id"`
	WargaID   uuid.UUID `json:"warga_id"`
	NamaWarga string    `json:"nama_warga"`
	BlokWarga string    `json:"blok_warga"`
	Status    string    `json:"status"`
	CreatedBy string    `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
}

type CreateQurbanRequest struct {
	WargaID string `json:"warga_id" binding:"required"`
	Status  string `json:"status"`
}

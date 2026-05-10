package models

import (
	"time"

	"github.com/google/uuid"
)

const (
	IPLPaymentStatusPending   = "pending"
	IPLPaymentStatusPaid      = "paid"
	IPLPaymentStatusFailed    = "failed"
	IPLPaymentStatusCancelled = "cancelled"
)

type IPLPaymentReq struct {
	ID              uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	WargaID         uuid.UUID `gorm:"type:uuid;not null;column:warga_id" json:"warga_id"`
	TanggalIPLStart string    `gorm:"type:varchar(6);not null;column:tanggal_ipl_start" json:"tanggal_ipl_start"`
	TanggalIPLEnd   string    `gorm:"type:varchar(6);not null;column:tanggal_ipl_end" json:"tanggal_ipl_end"`
	JumlahBulan     int       `gorm:"not null;default:1;column:jumlah_bulan" json:"jumlah_bulan"`
	TotalAmount     int64     `gorm:"not null;column:total_amount" json:"total_amount"`
	ReferenceID     string    `gorm:"type:varchar(100);uniqueIndex;not null;column:reference_id" json:"reference_id"`
	IPaymuTrxID     string    `gorm:"type:varchar(100);column:ipaymu_trx_id" json:"ipaymu_trx_id"`
	PaymentURL      string    `gorm:"type:text;column:payment_url" json:"payment_url"`
	Status          string    `gorm:"type:varchar(20);not null;default:'pending';column:status" json:"status"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	Warga           *Warga    `gorm:"foreignKey:WargaID" json:"warga,omitempty"`
}

func (IPLPaymentReq) TableName() string {
	return "ipl_payment_requests"
}

type InitiateIPLPaymentRequest struct {
	WargaID       string `json:"warga_id"`
	TanggalIPL    string `json:"tanggal_ipl"`
	TanggalIPLEnd string `json:"tanggal_ipl_end"`
}

type InitiateIPLPaymentResponse struct {
	ReferenceID     string `json:"reference_id"`
	PaymentURL      string `json:"payment_url"`
	JumlahBulan     int    `json:"jumlah_bulan"`
	TotalAmount     int64  `json:"total_amount"`
	WargaNama       string `json:"warga_nama"`
	WargaBlok       string `json:"warga_blok"`
	TanggalIPLStart string `json:"tanggal_ipl_start"`
	TanggalIPLEnd   string `json:"tanggal_ipl_end"`
}

type IPLPaymentStatusResponse struct {
	ReferenceID     string `json:"reference_id"`
	Status          string `json:"status"`
	JumlahBulan     int    `json:"jumlah_bulan"`
	TotalAmount     int64  `json:"total_amount"`
	WargaNama       string `json:"warga_nama"`
	WargaBlok       string `json:"warga_blok"`
	TanggalIPLStart string `json:"tanggal_ipl_start"`
	TanggalIPLEnd   string `json:"tanggal_ipl_end"`
}

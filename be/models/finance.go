package models

import (
	"time"

	"github.com/google/uuid"
)

type Finance struct {
	ID            uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	NamaTransaksi string     `gorm:"type:varchar(255);not null;column:nama_transaksi" json:"nama_transaksi"`
	Deskripsi     string     `gorm:"type:text;column:deskripsi" json:"deskripsi"`
	Kategori      string     `gorm:"type:varchar(100);column:kategori" json:"kategori"`
	Debit         float64    `gorm:"type:decimal(15,2);default:0;column:debit" json:"debit"`
	Kredit        float64    `gorm:"type:decimal(15,2);default:0;column:kredit" json:"kredit"`
	ReferensiID   *uuid.UUID `gorm:"type:uuid;column:referensi_id" json:"referensi_id"`
	ReferensiTipe string     `gorm:"type:varchar(50);column:referensi_tipe" json:"referensi_tipe"`
	Tanggal       time.Time  `gorm:"not null;default:now();column:tanggal" json:"timestamp"`
	CreatedAt     time.Time  `gorm:"column:created_at" json:"created_at"`
	UpdatedAt     time.Time  `gorm:"column:updated_at" json:"updated_at"`
}

func (Finance) TableName() string { return "finance" }

type FinanceSummary struct {
	TotalKredit float64 `gorm:"column:total_kredit" json:"total_kredit"`
	TotalDebit  float64 `gorm:"column:total_debit" json:"total_debit"`
	Saldo       float64 `gorm:"column:saldo" json:"saldo"`
}

type CreateFinanceRequest struct {
	NamaTransaksi string  `json:"nama_transaksi" binding:"required"`
	Deskripsi     string  `json:"deskripsi"`
	Kategori      string  `json:"kategori"`
	Debit         float64 `json:"debit"`
	Kredit        float64 `json:"kredit"`
	Tanggal       string  `json:"timestamp"` // YYYY-MM-DD from client
}

type UpdateFinanceRequest struct {
	NamaTransaksi string  `json:"nama_transaksi"`
	Deskripsi     string  `json:"deskripsi"`
	Kategori      string  `json:"kategori"`
	Debit         float64 `json:"debit"`
	Kredit        float64 `json:"kredit"`
	Tanggal       string  `json:"timestamp"` // YYYY-MM-DD from client
}

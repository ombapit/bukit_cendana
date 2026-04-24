package repositories

import (
	"247-golang-api/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TransaksiRepository struct {
	db *gorm.DB
}

func NewTransaksiRepository(db *gorm.DB) *TransaksiRepository {
	return &TransaksiRepository{db: db}
}

func (r *TransaksiRepository) Create(transaksi *models.Transaksi) error {
	return r.db.Create(transaksi).Error
}

func (r *TransaksiRepository) FindByID(id uuid.UUID) (*models.Transaksi, error) {
	var transaksi models.Transaksi
	err := r.db.Preload("Warga").First(&transaksi, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &transaksi, nil
}

func (r *TransaksiRepository) FindAll(page, limit int) ([]models.TransaksiResponse, int64, error) {
	var results []models.TransaksiResponse
	var total int64

	r.db.Model(&models.Transaksi{}).Count(&total)

	offset := (page - 1) * limit
	err := r.db.Table("transaksi").
		Select(`
			transaksi.id,
			transaksi.warga_id,
			warga.nama as warga_nama,
			warga.blok as warga_blok,
			transaksi.tanggal_ipl,
			transaksi.created_at
		`).
		Joins("LEFT JOIN warga ON warga.id = transaksi.warga_id").
		Order("transaksi.created_at DESC").
		Offset(offset).
		Limit(limit).
		Scan(&results).Error

	return results, total, err
}

func (r *TransaksiRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Transaksi{}, "id = ?", id).Error
}
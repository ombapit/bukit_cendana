package repositories

import (
	"time"

	"247-golang-api/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type IPLRepository struct {
	db *gorm.DB
}

func NewIPLRepository(db *gorm.DB) *IPLRepository {
	return &IPLRepository{db: db}
}

func (r *IPLRepository) Create(ipl *models.IPL) error {
	return r.db.Create(ipl).Error
}

func (r *IPLRepository) FindByID(id uuid.UUID) (*models.IPL, error) {
	var ipl models.IPL
	err := r.db.Preload("Warga").First(&ipl, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &ipl, nil
}

func (r *IPLRepository) FindAll(page, limit int, search string) ([]models.IPLResponse, int64, error) {
	var results []models.IPLResponse
	var total int64

	countQ := r.db.Table("ipls").Joins("LEFT JOIN warga ON warga.id = ipls.warga_id")
	dataQ := r.db.Table("ipls").
		Select(`ipls.id, ipls.warga_id, warga.nama as warga_nama, warga.blok as warga_blok, ipls.tanggal_ipl, ipls.gambar, ipls.created_at`).
		Joins("LEFT JOIN warga ON warga.id = ipls.warga_id")

	if search != "" {
		like := "%" + search + "%"
		countQ = countQ.Where("warga.nama ILIKE ? OR warga.blok ILIKE ? OR ipls.tanggal_ipl LIKE ?", like, like, like)
		dataQ = dataQ.Where("warga.nama ILIKE ? OR warga.blok ILIKE ? OR ipls.tanggal_ipl LIKE ?", like, like, like)
	}

	countQ.Count(&total)

	offset := (page - 1) * limit
	err := dataQ.Order("ipls.created_at DESC").Offset(offset).Limit(limit).Scan(&results).Error

	return results, total, err
}

func (r *IPLRepository) Update(ipl *models.IPL) error {
	return r.db.Model(ipl).Updates(map[string]interface{}{
		"tanggal_ipl": ipl.TanggalIPL,
		"gambar":      ipl.Gambar,
		"created_at":  ipl.CreatedAt,
		"updated_at":  time.Now(),
	}).Error
}

func (r *IPLRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.IPL{}, "id = ?", id).Error
}

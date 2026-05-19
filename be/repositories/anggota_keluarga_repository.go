package repositories

import (
	"247-golang-api/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AnggotaKeluargaRepository struct {
	db *gorm.DB
}

func NewAnggotaKeluargaRepository(db *gorm.DB) *AnggotaKeluargaRepository {
	return &AnggotaKeluargaRepository{db: db}
}

func (r *AnggotaKeluargaRepository) FindByWargaID(wargaID uuid.UUID) ([]models.AnggotaKeluarga, error) {
	var results []models.AnggotaKeluarga
	err := r.db.Where("warga_id = ?", wargaID).Order("status_hubungan ASC, nama ASC").Find(&results).Error
	return results, err
}

func (r *AnggotaKeluargaRepository) FindByID(id uuid.UUID) (*models.AnggotaKeluarga, error) {
	var a models.AnggotaKeluarga
	err := r.db.Where("id = ?", id).First(&a).Error
	return &a, err
}

func (r *AnggotaKeluargaRepository) Create(a *models.AnggotaKeluarga) error {
	return r.db.Create(a).Error
}

func (r *AnggotaKeluargaRepository) Update(id uuid.UUID, req models.UpdateAnggotaKeluargaRequest) (*models.AnggotaKeluarga, error) {
	var a models.AnggotaKeluarga
	if err := r.db.Where("id = ?", id).First(&a).Error; err != nil {
		return nil, err
	}
	if req.Nama != "" {
		a.Nama = req.Nama
	}
	a.StatusHubungan = req.StatusHubungan
	a.NoTelp = req.NoTelp
	err := r.db.Save(&a).Error
	return &a, err
}

func (r *AnggotaKeluargaRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.AnggotaKeluarga{}, "id = ?", id).Error
}

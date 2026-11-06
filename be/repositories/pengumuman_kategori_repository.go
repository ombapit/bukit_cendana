package repositories

import (
	"247-golang-api/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PengumumanKategoriRepository struct{ db *gorm.DB }

func NewPengumumanKategoriRepository(db *gorm.DB) *PengumumanKategoriRepository {
	return &PengumumanKategoriRepository{db: db}
}

func (r *PengumumanKategoriRepository) FindAll() ([]models.PengumumanKategori, error) {
	var records []models.PengumumanKategori
	err := r.db.Order("nama ASC").Find(&records).Error
	return records, err
}

func (r *PengumumanKategoriRepository) FindByID(id uuid.UUID) (*models.PengumumanKategori, error) {
	var record models.PengumumanKategori
	err := r.db.First(&record, "id = ?", id).Error
	return &record, err
}

func (r *PengumumanKategoriRepository) FindByNama(nama string, excludeID *uuid.UUID) (*models.PengumumanKategori, error) {
	var record models.PengumumanKategori
	q := r.db.Where("LOWER(nama) = LOWER(?)", nama)
	if excludeID != nil {
		q = q.Where("id <> ?", *excludeID)
	}
	err := q.First(&record).Error
	return &record, err
}

func (r *PengumumanKategoriRepository) Create(record *models.PengumumanKategori) error {
	return r.db.Create(record).Error
}

func (r *PengumumanKategoriRepository) Update(record *models.PengumumanKategori) error {
	return r.db.Model(record).Updates(map[string]interface{}{"nama": record.Nama, "updated_at": gorm.Expr("NOW()")}).Error
}

func (r *PengumumanKategoriRepository) RenameAnnouncements(oldName, newName string) error {
	return r.db.Model(&models.Pengumuman{}).Where("kategori = ?", oldName).Update("kategori", newName).Error
}

func (r *PengumumanKategoriRepository) ClearAnnouncements(name string) error {
	return r.db.Model(&models.Pengumuman{}).Where("kategori = ?", name).Update("kategori", "").Error
}

func (r *PengumumanKategoriRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.PengumumanKategori{}, "id = ?", id).Error
}

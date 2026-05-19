package repositories

import (
	"247-golang-api/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PenerimaQurbanRepository struct {
	db *gorm.DB
}

func NewPenerimaQurbanRepository(db *gorm.DB) *PenerimaQurbanRepository {
	return &PenerimaQurbanRepository{db: db}
}

func (r *PenerimaQurbanRepository) FindAll(page, limit int, search string) ([]models.PenerimaQurban, int64, error) {
	var results []models.PenerimaQurban
	var total int64

	countQ := r.db.Model(&models.PenerimaQurban{})
	findQ := r.db.Model(&models.PenerimaQurban{})
	if search != "" {
		where := "LOWER(nama) LIKE '%' || LOWER(?) || '%' OR LOWER(blok) LIKE '%' || LOWER(?) || '%'"
		countQ = countQ.Where(where, search, search)
		findQ = findQ.Where(where, search, search)
	}
	countQ.Count(&total)

	offset := (page - 1) * limit
	err := findQ.Order("blok ASC, nama ASC").Limit(limit).Offset(offset).Find(&results).Error
	return results, total, err
}

func (r *PenerimaQurbanRepository) UpdateQRCode(id, qrPath string) error {
	return r.db.Model(&models.PenerimaQurban{}).
		Where("id = ?", id).
		Update("qr_code", qrPath).Error
}

func (r *PenerimaQurbanRepository) FindByID(id uuid.UUID) (*models.PenerimaQurban, error) {
	var p models.PenerimaQurban
	err := r.db.Where("id = ?", id).First(&p).Error
	return &p, err
}

func (r *PenerimaQurbanRepository) Create(p *models.PenerimaQurban) error {
	return r.db.Create(p).Error
}

func (r *PenerimaQurbanRepository) Update(id uuid.UUID, req models.UpdatePenerimaQurbanRequest) (*models.PenerimaQurban, error) {
	var p models.PenerimaQurban
	if err := r.db.Where("id = ?", id).First(&p).Error; err != nil {
		return nil, err
	}
	if req.Nama != "" {
		p.Nama = req.Nama
	}
	if req.Blok != "" {
		p.Blok = req.Blok
	}
	p.NoTelp = req.NoTelp
	p.KondisiRumah = req.KondisiRumah
	err := r.db.Save(&p).Error
	return &p, err
}

func (r *PenerimaQurbanRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.PenerimaQurban{}, "id = ?", id).Error
}

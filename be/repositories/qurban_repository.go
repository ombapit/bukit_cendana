package repositories

import (
	"247-golang-api/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type QurbanRepository struct {
	db *gorm.DB
}

func NewQurbanRepository(db *gorm.DB) *QurbanRepository {
	return &QurbanRepository{db: db}
}

func (r *QurbanRepository) FindAll(page, limit int, search string) ([]models.PengambilanQurbanResponse, int64, error) {
	var results []models.PengambilanQurbanResponse
	var total int64

	r.db.Raw(`
		SELECT COUNT(*) FROM pengambilan_qurban q
		JOIN penerima_qurban p ON p.id = q.penerima_qurban_id
		WHERE ($1 = '' OR LOWER(p.nama) LIKE '%' || LOWER($1) || '%' OR LOWER(p.blok) LIKE '%' || LOWER($1) || '%')
	`, search).Scan(&total)

	offset := (page - 1) * limit
	err := r.db.Raw(`
		SELECT
			q.id,
			q.penerima_qurban_id,
			p.nama AS nama_warga,
			p.blok AS blok_warga,
			q.status,
			q.created_by,
			q.created_at
		FROM pengambilan_qurban q
		JOIN penerima_qurban p ON p.id = q.penerima_qurban_id
		WHERE ($1 = '' OR LOWER(p.nama) LIKE '%' || LOWER($1) || '%' OR LOWER(p.blok) LIKE '%' || LOWER($1) || '%')
		ORDER BY
			split_part(p.blok, '/', 1) ASC,
			CAST(NULLIF(split_part(p.blok, '/', 2), '') AS INTEGER) ASC,
			p.nama ASC
		LIMIT $2 OFFSET $3
	`, search, limit, offset).Scan(&results).Error

	return results, total, err
}

func (r *QurbanRepository) ExistsForPenerima(penerimaID uuid.UUID) (bool, error) {
	var count int64
	err := r.db.Model(&models.PengambilanQurban{}).
		Where("penerima_qurban_id = ?", penerimaID).Count(&count).Error
	return count > 0, err
}

func (r *QurbanRepository) Create(q *models.PengambilanQurban) error {
	return r.db.Create(q).Error
}

func (r *QurbanRepository) FindByID(id uuid.UUID) (*models.PengambilanQurbanResponse, error) {
	var result models.PengambilanQurbanResponse
	err := r.db.Raw(`
		SELECT q.id, q.penerima_qurban_id, p.nama AS nama_warga, p.blok AS blok_warga,
		       q.status, q.created_by, q.created_at
		FROM pengambilan_qurban q
		JOIN penerima_qurban p ON p.id = q.penerima_qurban_id
		WHERE q.id = $1
	`, id).Scan(&result).Error
	if result.ID == uuid.Nil {
		return nil, gorm.ErrRecordNotFound
	}
	return &result, err
}

func (r *QurbanRepository) UpdateStatus(id uuid.UUID, status string) error {
	result := r.db.Model(&models.PengambilanQurban{}).Where("id = ?", id).Update("status", status)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *QurbanRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.PengambilanQurban{}, "id = ?", id).Error
}

func (r *QurbanRepository) CountTotal() int64 {
	var total int64
	r.db.Model(&models.PengambilanQurban{}).Count(&total)
	return total
}

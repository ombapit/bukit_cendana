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

	base := r.db.Raw(`
		SELECT
			q.id,
			q.warga_id,
			w.nama AS nama_warga,
			w.blok AS blok_warga,
			q.status,
			q.created_by,
			q.created_at
		FROM pengambilan_qurban q
		JOIN warga w ON w.id = q.warga_id
		WHERE ($1 = '' OR LOWER(w.nama) LIKE '%' || LOWER($1) || '%' OR LOWER(w.blok) LIKE '%' || LOWER($1) || '%')
	`, search)

	r.db.Raw(`
		SELECT COUNT(*) FROM pengambilan_qurban q
		JOIN warga w ON w.id = q.warga_id
		WHERE ($1 = '' OR LOWER(w.nama) LIKE '%' || LOWER($1) || '%' OR LOWER(w.blok) LIKE '%' || LOWER($1) || '%')
	`, search).Scan(&total)

	offset := (page - 1) * limit
	err := base.Order("w.blok ASC, w.nama ASC").
		Limit(limit).Offset(offset).
		Scan(&results).Error

	return results, total, err
}

func (r *QurbanRepository) ExistsForWarga(wargaID uuid.UUID) (bool, error) {
	var count int64
	err := r.db.Model(&models.PengambilanQurban{}).
		Where("warga_id = ?", wargaID).Count(&count).Error
	return count > 0, err
}

func (r *QurbanRepository) Create(q *models.PengambilanQurban) error {
	return r.db.Create(q).Error
}

func (r *QurbanRepository) FindByID(id uuid.UUID) (*models.PengambilanQurbanResponse, error) {
	var result models.PengambilanQurbanResponse
	err := r.db.Raw(`
		SELECT q.id, q.warga_id, w.nama AS nama_warga, w.blok AS blok_warga,
		       q.status, q.created_by, q.created_at
		FROM pengambilan_qurban q
		JOIN warga w ON w.id = q.warga_id
		WHERE q.id = $1
	`, id).Scan(&result).Error
	if result.ID == uuid.Nil {
		return nil, gorm.ErrRecordNotFound
	}
	return &result, err
}

func (r *QurbanRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.PengambilanQurban{}, "id = ?", id).Error
}

func (r *QurbanRepository) CountTotal() int64 {
	var total int64
	r.db.Model(&models.PengambilanQurban{}).Count(&total)
	return total
}

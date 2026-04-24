package repositories

import (
	"fmt"
	"time"

	"247-golang-api/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type WargaRepository struct {
	db *gorm.DB
}

func NewWargaRepository(db *gorm.DB) *WargaRepository {
	return &WargaRepository{db: db}
}

func (r *WargaRepository) Create(warga *models.Warga) error {
	return r.db.Create(warga).Error
}

func (r *WargaRepository) FindByID(id uuid.UUID) (*models.Warga, error) {
	var warga models.Warga
	err := r.db.First(&warga, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &warga, nil
}

func (r *WargaRepository) FindAll(page, limit int) ([]models.Warga, int64, error) {
	var warga []models.Warga
	var total int64

	r.db.Model(&models.Warga{}).Count(&total)

	offset := (page - 1) * limit
	err := r.db.Offset(offset).Limit(limit).Order("nama ASC").Find(&warga).Error
	return warga, total, err
}

func (r *WargaRepository) FindAllWithLastPayment(page, limit int) ([]models.WargaWithLastPayment, int64, error) {
	var results []models.WargaWithLastPayment
	var total int64

	r.db.Raw(`SELECT COUNT(*) FROM warga`).Scan(&total)

	offset := (page - 1) * limit

	err := r.db.Raw(`
		SELECT 
			w.id::text as id,
			w.nama,
			w.blok,
			w.no_telp,
			w.iuran,
			COALESCE((
				SELECT MAX(t.tanggal_ipl) 
				FROM transaksi t 
				WHERE t.warga_id = w.id
			), '') as last_payment
		FROM warga w
		ORDER BY w.nama ASC
		LIMIT ? OFFSET ?
	`, limit, offset).Scan(&results).Error

	return results, total, err
}

func (r *WargaRepository) FindByTunggakan(page, limit, bulan int) ([]models.WargaWithLastPayment, int64, error) {
	var results []models.WargaWithLastPayment
	var total int64

	now := time.Now()
	currentPeriode := now.Year()*100 + int(now.Month())
	bulanThreshold := fmt.Sprintf("%d", currentPeriode-bulan)

	offset := (page - 1) * limit

	err := r.db.Raw(fmt.Sprintf(`
		WITH warga_with_payment AS (
			SELECT 
				w.id,
				w.nama,
				w.blok,
				w.no_telp,
				w.iuran,
				COALESCE((
					SELECT MAX(t.tanggal_ipl) 
					FROM transaksi t 
					WHERE t.warga_id = w.id
				), '') as last_payment
			FROM warga w
		)
		SELECT * FROM warga_with_payment
		WHERE last_payment < '%s' OR last_payment = ''
		ORDER BY nama ASC
		LIMIT %d OFFSET %d
	`, bulanThreshold, limit, offset)).Scan(&results).Error

	if err != nil {
		return results, 0, err
	}

	r.db.Raw(fmt.Sprintf(`
		WITH warga_with_payment AS (
			SELECT 
				w.id,
				COALESCE((
					SELECT MAX(t.tanggal_ipl) 
					FROM transaksi t 
					WHERE t.warga_id = w.id
				), '') as last_payment
			FROM warga w
		)
		SELECT COUNT(*) FROM warga_with_payment
		WHERE last_payment < '%s' OR last_payment = ''
	`, bulanThreshold)).Scan(&total)

	return results, total, err
}

func (r *WargaRepository) Update(warga *models.Warga) error {
	return r.db.Save(warga).Error
}

func (r *WargaRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Warga{}, "id = ?", id).Error
}
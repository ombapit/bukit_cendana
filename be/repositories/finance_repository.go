package repositories

import (
	"time"

	"247-golang-api/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FinanceRepository struct {
	db *gorm.DB
}

func NewFinanceRepository(db *gorm.DB) *FinanceRepository {
	return &FinanceRepository{db: db}
}

func (r *FinanceRepository) Create(f *models.Finance) error {
	return r.db.Create(f).Error
}

func (r *FinanceRepository) FindByID(id uuid.UUID) (*models.Finance, error) {
	var f models.Finance
	err := r.db.First(&f, "id = ?", id).Error
	return &f, err
}

func (r *FinanceRepository) FindAll(page, limit int, search, dateFrom, dateTo string) ([]models.Finance, int64, error) {
	var results []models.Finance
	var total int64

	countQ := r.db.Model(&models.Finance{})
	dataQ := r.db.Model(&models.Finance{})

	if search != "" {
		like := "%" + search + "%"
		countQ = countQ.Where("nama_transaksi ILIKE ? OR deskripsi ILIKE ? OR kategori ILIKE ?", like, like, like)
		dataQ = dataQ.Where("nama_transaksi ILIKE ? OR deskripsi ILIKE ? OR kategori ILIKE ?", like, like, like)
	}
	if dateFrom != "" {
		if t, err := time.Parse("2006-01-02", dateFrom); err == nil {
			countQ = countQ.Where("tanggal >= ?", t)
			dataQ = dataQ.Where("tanggal >= ?", t)
		}
	}
	if dateTo != "" {
		if t, err := time.Parse("2006-01-02", dateTo); err == nil {
			countQ = countQ.Where("tanggal < ?", t.AddDate(0, 0, 1))
			dataQ = dataQ.Where("tanggal < ?", t.AddDate(0, 0, 1))
		}
	}

	countQ.Count(&total)

	offset := (page - 1) * limit
	err := dataQ.Order("created_at DESC").Offset(offset).Limit(limit).Find(&results).Error
	return results, total, err
}

func (r *FinanceRepository) GetSummary(dateFrom, dateTo string) (*models.FinanceSummary, error) {
	var summary models.FinanceSummary
	q := r.db.Model(&models.Finance{})
	if dateFrom != "" {
		if t, err := time.Parse("2006-01-02", dateFrom); err == nil {
			q = q.Where("tanggal >= ?", t)
		}
	}
	if dateTo != "" {
		if t, err := time.Parse("2006-01-02", dateTo); err == nil {
			q = q.Where("tanggal < ?", t.AddDate(0, 0, 1))
		}
	}
	err := q.Select("COALESCE(SUM(kredit),0) as total_kredit, COALESCE(SUM(debit),0) as total_debit, COALESCE(SUM(kredit)-SUM(debit),0) as saldo").
		Scan(&summary).Error
	return &summary, err
}

func (r *FinanceRepository) Update(f *models.Finance) error {
	return r.db.Model(f).Updates(map[string]interface{}{
		"nama_transaksi": f.NamaTransaksi,
		"deskripsi":      f.Deskripsi,
		"kategori":       f.Kategori,
		"debit":          f.Debit,
		"kredit":         f.Kredit,
		"tanggal":        f.Tanggal,
		"updated_at":     time.Now(),
	}).Error
}

func (r *FinanceRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Finance{}, "id = ?", id).Error
}

func (r *FinanceRepository) DeleteByReferensiID(referensiID uuid.UUID) error {
	return r.db.Delete(&models.Finance{}, "referensi_id = ?", referensiID).Error
}

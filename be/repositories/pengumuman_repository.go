package repositories

import (
	"time"

	"247-golang-api/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PengumumanRepository struct {
	db *gorm.DB
}

func NewPengumumanRepository(db *gorm.DB) *PengumumanRepository {
	return &PengumumanRepository{db: db}
}

func (r *PengumumanRepository) Create(p *models.Pengumuman) error {
	return r.db.Create(p).Error
}

func (r *PengumumanRepository) FindByID(id uuid.UUID) (*models.Pengumuman, error) {
	var p models.Pengumuman
	err := r.db.First(&p, "id = ?", id).Error
	return &p, err
}

func (r *PengumumanRepository) FindBySlug(slug string, publishedOnly bool) (*models.Pengumuman, error) {
	var p models.Pengumuman
	q := r.db.Where("slug = ?", slug)
	if publishedOnly {
		q = q.Where("is_published = true")
	}
	err := q.First(&p).Error
	return &p, err
}

func (r *PengumumanRepository) SlugExists(slug string, excludeID *uuid.UUID) bool {
	q := r.db.Model(&models.Pengumuman{}).Where("slug = ?", slug)
	if excludeID != nil {
		q = q.Where("id <> ?", *excludeID)
	}
	var count int64
	q.Count(&count)
	return count > 0
}

func (r *PengumumanRepository) FindAll(page, limit int, search, kategori string, publishedOnly bool) ([]models.Pengumuman, int64, error) {
	var results []models.Pengumuman
	var total int64

	cq := r.db.Model(&models.Pengumuman{})
	dq := r.db.Model(&models.Pengumuman{})

	if publishedOnly {
		cq = cq.Where("is_published = true")
		dq = dq.Where("is_published = true")
	}
	if search != "" {
		like := "%" + search + "%"
		cq = cq.Where("judul ILIKE ? OR konten ILIKE ? OR tags ILIKE ?", like, like, like)
		dq = dq.Where("judul ILIKE ? OR konten ILIKE ? OR tags ILIKE ?", like, like, like)
	}
	if kategori != "" {
		cq = cq.Where("kategori = ?", kategori)
		dq = dq.Where("kategori = ?", kategori)
	}

	cq.Count(&total)
	offset := (page - 1) * limit
	err := dq.Order("created_at DESC").Offset(offset).Limit(limit).Find(&results).Error
	return results, total, err
}

func (r *PengumumanRepository) Update(p *models.Pengumuman) error {
	return r.db.Model(p).Updates(map[string]interface{}{
		"judul":           p.Judul,
		"slug":            p.Slug,
		"konten":          p.Konten,
		"gambar":          p.Gambar,
		"kategori":        p.Kategori,
		"tags":            p.Tags,
		"is_published":    p.IsPublished,
		"created_by_name": p.CreatedByName,
		"updated_at":      time.Now(),
	}).Error
}

func (r *PengumumanRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Pengumuman{}, "id = ?", id).Error
}

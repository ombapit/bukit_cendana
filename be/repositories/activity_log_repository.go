package repositories

import (
	"247-golang-api/models"

	"gorm.io/gorm"
)

type ActivityLogRepository struct {
	db *gorm.DB
}

func NewActivityLogRepository(db *gorm.DB) *ActivityLogRepository {
	return &ActivityLogRepository{db: db}
}

func (r *ActivityLogRepository) Create(log *models.ActivityLog) error {
	return r.db.Create(log).Error
}

func (r *ActivityLogRepository) FindAll(page, limit int, search string) ([]models.ActivityLog, int64, error) {
	var results []models.ActivityLog
	var total int64

	q := r.db.Model(&models.ActivityLog{})
	if search != "" {
		like := "%" + search + "%"
		q = q.Where("path ILIKE ? OR ip LIKE ?", like, like)
	}

	q.Count(&total)

	offset := (page - 1) * limit
	err := q.Order("created_at DESC").Offset(offset).Limit(limit).Find(&results).Error
	return results, total, err
}

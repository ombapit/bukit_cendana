package repositories

import (
	"247-golang-api/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MenuRepository struct {
	db *gorm.DB
}

func NewMenuRepository(db *gorm.DB) *MenuRepository {
	return &MenuRepository{db: db}
}

func (r *MenuRepository) Create(menu *models.Menu) error {
	return r.db.Create(menu).Error
}

func (r *MenuRepository) FindByID(id uuid.UUID) (*models.Menu, error) {
	var menu models.Menu
	err := r.db.Preload("Permission").Preload("Children", func(db *gorm.DB) *gorm.DB {
		return db.Order("sort_order ASC")
	}).Preload("Children.Permission").First(&menu, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &menu, nil
}

func (r *MenuRepository) FindAll() ([]models.Menu, error) {
	var menus []models.Menu
	err := r.db.Preload("Permission").Order("sort_order ASC").Find(&menus).Error
	return menus, err
}

func (r *MenuRepository) FindRootMenus() ([]models.Menu, error) {
	var menus []models.Menu
	err := r.db.Preload("Permission").
		Preload("Children", func(db *gorm.DB) *gorm.DB {
			return db.Where("is_active = ?", true).Order("sort_order ASC")
		}).
		Preload("Children.Permission").
		Preload("Children.Children", func(db *gorm.DB) *gorm.DB {
			return db.Where("is_active = ?", true).Order("sort_order ASC")
		}).
		Preload("Children.Children.Permission").
		Where("parent_id IS NULL AND is_active = ?", true).
		Order("sort_order ASC").
		Find(&menus).Error
	return menus, err
}

func (r *MenuRepository) FindMenusByPermissionCodes(codes []string) ([]models.Menu, error) {
	var menus []models.Menu
	err := r.db.Preload("Permission").
		Preload("Children", func(db *gorm.DB) *gorm.DB {
			return db.Joins("LEFT JOIN permissions ON permissions.id = menus.permission_id").
				Where("menus.is_active = ? AND (menus.permission_id IS NULL OR permissions.code IN ?)", true, codes).
				Order("sort_order ASC")
		}).
		Preload("Children.Permission").
		Preload("Children.Children", func(db *gorm.DB) *gorm.DB {
			return db.Joins("LEFT JOIN permissions ON permissions.id = menus.permission_id").
				Where("menus.is_active = ? AND (menus.permission_id IS NULL OR permissions.code IN ?)", true, codes).
				Order("sort_order ASC")
		}).
		Preload("Children.Children.Permission").
		Where("parent_id IS NULL AND is_active = ? AND (permission_id IS NULL OR permission_id IN (SELECT id FROM permissions WHERE code IN ?))", true, codes).
		Order("sort_order ASC").
		Find(&menus).Error
	return menus, err
}

func (r *MenuRepository) Update(menu *models.Menu) error {
	return r.db.Save(menu).Error
}

func (r *MenuRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Menu{}, "id = ?", id).Error
}

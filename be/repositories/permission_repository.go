package repositories

import (
	"247-golang-api/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PermissionRepository struct {
	db *gorm.DB
}

func NewPermissionRepository(db *gorm.DB) *PermissionRepository {
	return &PermissionRepository{db: db}
}

func (r *PermissionRepository) Create(perm *models.Permission) error {
	return r.db.Create(perm).Error
}

func (r *PermissionRepository) FindByID(id uuid.UUID) (*models.Permission, error) {
	var perm models.Permission
	err := r.db.First(&perm, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &perm, nil
}

func (r *PermissionRepository) FindByCode(code string) (*models.Permission, error) {
	var perm models.Permission
	err := r.db.First(&perm, "code = ?", code).Error
	if err != nil {
		return nil, err
	}
	return &perm, nil
}

func (r *PermissionRepository) FindAll() ([]models.Permission, error) {
	var perms []models.Permission
	err := r.db.Order("module ASC, name ASC").Find(&perms).Error
	return perms, err
}

func (r *PermissionRepository) FindByModule(module string) ([]models.Permission, error) {
	var perms []models.Permission
	err := r.db.Where("module = ?", module).Order("name ASC").Find(&perms).Error
	return perms, err
}

func (r *PermissionRepository) Update(perm *models.Permission) error {
	return r.db.Save(perm).Error
}

func (r *PermissionRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Permission{}, "id = ?", id).Error
}

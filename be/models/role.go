package models

import (
	"time"

	"github.com/google/uuid"
)

type Role struct {
	ID          uuid.UUID    `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()" example:"10000000-0000-0000-0000-000000000002"`
	Name        string       `json:"name" gorm:"type:varchar(100);uniqueIndex;not null" example:"admin"`
	Description string       `json:"description" gorm:"type:text" example:"Administrator with management access"`
	IsActive    bool         `json:"is_active" gorm:"default:true" example:"true"`
	Permissions []Permission `json:"permissions,omitempty" gorm:"many2many:role_permissions;"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
}

type CreateRoleRequest struct {
	Name          string      `json:"name" binding:"required,min=2,max=100" example:"editor"`
	Description   string      `json:"description" example:"Editor role with content permissions"`
	PermissionIDs []uuid.UUID `json:"permission_ids" example:"a0000000-0000-0000-0000-000000000001"`
}

type UpdateRoleRequest struct {
	Name          string      `json:"name" binding:"omitempty,min=2,max=100" example:"editor"`
	Description   string      `json:"description" example:"Updated description"`
	IsActive      *bool       `json:"is_active" example:"true"`
	PermissionIDs []uuid.UUID `json:"permission_ids"`
}

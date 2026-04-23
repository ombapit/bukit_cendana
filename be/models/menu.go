package models

import (
	"time"

	"github.com/google/uuid"
)

type Menu struct {
	ID           uuid.UUID   `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()" example:"30000000-0000-0000-0000-000000000001"`
	Name         string      `json:"name" gorm:"type:varchar(100);not null" example:"Dashboard"`
	Path         string      `json:"path" gorm:"type:varchar(255)" example:"/dashboard"`
	Icon         string      `json:"icon" gorm:"type:varchar(100)" example:"dashboard"`
	ParentID     *uuid.UUID  `json:"parent_id" gorm:"type:uuid"`
	Parent       *Menu       `json:"parent,omitempty" gorm:"foreignKey:ParentID"`
	Children     []Menu      `json:"children,omitempty" gorm:"foreignKey:ParentID"`
	SortOrder    int         `json:"sort_order" gorm:"default:0" example:"1"`
	IsActive     bool        `json:"is_active" gorm:"default:true" example:"true"`
	PermissionID *uuid.UUID  `json:"permission_id" gorm:"type:uuid"`
	Permission   *Permission `json:"permission,omitempty" gorm:"foreignKey:PermissionID"`
	CreatedAt    time.Time   `json:"created_at"`
	UpdatedAt    time.Time   `json:"updated_at"`
}

type CreateMenuRequest struct {
	Name         string     `json:"name" binding:"required" example:"Laporan"`
	Path         string     `json:"path" example:"/reports"`
	Icon         string     `json:"icon" example:"bar-chart"`
	ParentID     *uuid.UUID `json:"parent_id"`
	SortOrder    int        `json:"sort_order" example:"5"`
	PermissionID *uuid.UUID `json:"permission_id"`
}

type UpdateMenuRequest struct {
	Name         string     `json:"name" example:"Laporan Updated"`
	Path         string     `json:"path" example:"/reports"`
	Icon         string     `json:"icon" example:"bar-chart"`
	ParentID     *uuid.UUID `json:"parent_id"`
	SortOrder    *int       `json:"sort_order" example:"5"`
	IsActive     *bool      `json:"is_active" example:"true"`
	PermissionID *uuid.UUID `json:"permission_id"`
}

type MenuTreeResponse struct {
	ID        uuid.UUID          `json:"id" example:"30000000-0000-0000-0000-000000000001"`
	Name      string             `json:"name" example:"Dashboard"`
	Path      string             `json:"path" example:"/dashboard"`
	Icon      string             `json:"icon" example:"dashboard"`
	SortOrder int                `json:"sort_order" example:"1"`
	Children  []MenuTreeResponse `json:"children,omitempty"`
}

package models

import (
	"time"

	"github.com/google/uuid"
)

type Permission struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()" example:"a0000000-0000-0000-0000-000000000001"`
	Name        string    `json:"name" gorm:"type:varchar(100);uniqueIndex;not null" example:"View Users"`
	Code        string    `json:"code" gorm:"type:varchar(100);uniqueIndex;not null" example:"user.view"`
	Module      string    `json:"module" gorm:"type:varchar(100);not null" example:"user"`
	Description string    `json:"description" gorm:"type:text" example:"Can view user list and detail"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreatePermissionRequest struct {
	Name        string `json:"name" binding:"required" example:"Export Data"`
	Code        string `json:"code" binding:"required" example:"data.export"`
	Module      string `json:"module" binding:"required" example:"data"`
	Description string `json:"description" example:"Can export data to CSV/Excel"`
}

type UpdatePermissionRequest struct {
	Name        string `json:"name" example:"Export Data Updated"`
	Code        string `json:"code" example:"data.export"`
	Module      string `json:"module" example:"data"`
	Description string `json:"description" example:"Updated description"`
}

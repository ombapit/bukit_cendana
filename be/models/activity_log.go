package models

import (
	"time"

	"github.com/google/uuid"
)

type ActivityLog struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Path      string    `gorm:"type:varchar(500);not null" json:"path"`
	IP        string    `gorm:"type:varchar(100)" json:"ip"`
	UserAgent string    `gorm:"type:text" json:"user_agent"`
	Referer   string    `gorm:"type:varchar(500)" json:"referer"`
	CreatedAt time.Time `json:"created_at"`
}

func (ActivityLog) TableName() string { return "activity_logs" }

type ActivityLogResponse struct {
	ID        uuid.UUID `json:"id"`
	Path      string    `json:"path"`
	IP        string    `json:"ip"`
	UserAgent string    `json:"user_agent"`
	Referer   string    `json:"referer"`
	CreatedAt time.Time `json:"created_at"`
}

func (a ActivityLog) ToResponse() ActivityLogResponse {
	return ActivityLogResponse{
		ID:        a.ID,
		Path:      a.Path,
		IP:        a.IP,
		UserAgent: a.UserAgent,
		Referer:   a.Referer,
		CreatedAt: a.CreatedAt,
	}
}

type CreateActivityLogRequest struct {
	Path      string `json:"path" binding:"required"`
	UserAgent string `json:"user_agent"`
	Referer   string `json:"referer"`
}

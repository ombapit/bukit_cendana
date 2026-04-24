package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Username  string     `json:"username" gorm:"type:varchar(100);uniqueIndex;not null"`
	Email     string     `json:"email" gorm:"type:varchar(255);uniqueIndex;not null"`
	Password  string     `json:"-" gorm:"type:varchar(255);not null"`
	Salt      string     `json:"-" gorm:"type:varchar(64);not null"`
	FullName  string     `json:"full_name" gorm:"type:varchar(255)"`
	IsActive  bool       `json:"is_active" gorm:"default:true"`
	RoleID    uuid.UUID  `json:"role_id" gorm:"type:uuid;not null"`
	Role      *Role      `json:"role,omitempty" gorm:"foreignKey:RoleID"`
	LastLogin *time.Time `json:"last_login"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required" example:"admin"`
	Password string `json:"password" binding:"required" example:"password123"`
}

type LoginResponse struct {
	AccessToken  string       `json:"access_token" example:"eyJhbGciOiJIUzI1NiIs..."`
	RefreshToken string       `json:"refresh_token" example:"eyJhbGciOiJIUzI1NiIs..."`
	ExpiresIn    int          `json:"expires_in" example:"86400"`
	TokenType    string       `json:"token_type" example:"Bearer"`
	User         UserResponse `json:"user"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required" example:"eyJhbGciOiJIUzI1NiIs..."`
}

type UserResponse struct {
	ID       uuid.UUID `json:"id" example:"20000000-0000-0000-0000-000000000002"`
	Username string    `json:"username" example:"admin"`
	Email    string    `json:"email" example:"admin@example.com"`
	FullName string    `json:"full_name" example:"Administrator"`
	IsActive bool      `json:"is_active" example:"true"`
	Role     *Role     `json:"role,omitempty"`
}

type CreateUserRequest struct {
	Username string    `json:"username" binding:"required,min=3,max=100" example:"userbaru"`
	Email    string    `json:"email" binding:"required,email" example:"userbaru@example.com"`
	Password string    `json:"password" binding:"required,min=6" example:"rahasia123"`
	FullName string    `json:"full_name" binding:"required" example:"User Baru"`
	RoleID   uuid.UUID `json:"role_id" binding:"required" example:"10000000-0000-0000-0000-000000000004"`
}

type UpdateUserRequest struct {
	Email    string    `json:"email" binding:"omitempty,email" example:"updated@example.com"`
	FullName string    `json:"full_name" example:"Nama Baru"`
	IsActive *bool     `json:"is_active" example:"true"`
	RoleID   uuid.UUID `json:"role_id" example:"10000000-0000-0000-0000-000000000004"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required" example:"password123"`
	NewPassword string `json:"new_password" binding:"required,min=6" example:"newpassword456"`
}

type AdminResetPasswordRequest struct {
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:       u.ID,
		Username: u.Username,
		Email:    u.Email,
		FullName: u.FullName,
		IsActive: u.IsActive,
		Role:     u.Role,
	}
}

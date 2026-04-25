package models

import (
	"time"

	"github.com/google/uuid"
)

type Pengumuman struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Judul       string    `gorm:"type:varchar(255);not null;column:judul" json:"judul"`
	Konten      string    `gorm:"type:text;column:konten" json:"konten"`
	Gambar      string    `gorm:"type:varchar(500);column:gambar" json:"gambar"`
	Kategori    string    `gorm:"type:varchar(100);column:kategori" json:"kategori"`
	Tags        string    `gorm:"type:varchar(500);column:tags" json:"tags"`
	IsPublished   bool      `gorm:"default:true;column:is_published" json:"is_published"`
	CreatedByName string    `gorm:"type:varchar(255);column:created_by_name" json:"created_by_name"`
	CreatedAt     time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt     time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (Pengumuman) TableName() string { return "pengumuman" }

type CreatePengumumanRequest struct {
	Judul         string `form:"judul"`
	Konten        string `form:"konten"`
	Kategori      string `form:"kategori"`
	Tags          string `form:"tags"`
	IsPublished   bool   `form:"-"`
	Gambar        string `form:"-"`
	CreatedByName string `form:"-"`
}

type UpdatePengumumanRequest struct {
	Judul         string `form:"judul"`
	Konten        string `form:"konten"`
	Kategori      string `form:"kategori"`
	Tags          string `form:"tags"`
	IsPublished   bool   `form:"-"`
	Gambar        string `form:"-"`
	CreatedByName string `form:"-"`
}

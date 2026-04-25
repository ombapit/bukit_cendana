package services

import (
	"fmt"

	"247-golang-api/models"
	"247-golang-api/repositories"

	"github.com/google/uuid"
)

type PengumumanService struct {
	repo *repositories.PengumumanRepository
}

func NewPengumumanService(repo *repositories.PengumumanRepository) *PengumumanService {
	return &PengumumanService{repo: repo}
}

func (s *PengumumanService) Create(req models.CreatePengumumanRequest) (*models.Pengumuman, error) {
	p := &models.Pengumuman{
		Judul:         req.Judul,
		Konten:        req.Konten,
		Gambar:        req.Gambar,
		Kategori:      req.Kategori,
		Tags:          req.Tags,
		IsPublished:   req.IsPublished,
		CreatedByName: req.CreatedByName,
	}
	return p, s.repo.Create(p)
}

func (s *PengumumanService) FindAll(page, limit int, search, kategori string, publishedOnly bool) ([]models.Pengumuman, int64, error) {
	return s.repo.FindAll(page, limit, search, kategori, publishedOnly)
}

func (s *PengumumanService) FindByID(id uuid.UUID) (*models.Pengumuman, error) {
	return s.repo.FindByID(id)
}

func (s *PengumumanService) Update(id uuid.UUID, req models.UpdatePengumumanRequest) (*models.Pengumuman, error) {
	p, err := s.repo.FindByID(id)
	if err != nil {
		return nil, fmt.Errorf("pengumuman not found")
	}
	if req.Judul != "" {
		p.Judul = req.Judul
	}
	p.Konten = req.Konten
	p.Kategori = req.Kategori
	p.Tags = req.Tags
	p.IsPublished = req.IsPublished
	p.CreatedByName = req.CreatedByName
	if req.Gambar != "" {
		p.Gambar = req.Gambar
	}
	return p, s.repo.Update(p)
}

func (s *PengumumanService) Delete(id uuid.UUID) error {
	if _, err := s.repo.FindByID(id); err != nil {
		return fmt.Errorf("pengumuman not found")
	}
	return s.repo.Delete(id)
}

package services

import (
	"fmt"
	"strings"

	"247-golang-api/models"
	"247-golang-api/repositories"
	"github.com/google/uuid"
)

type PengumumanKategoriService struct {
	repo *repositories.PengumumanKategoriRepository
}

func NewPengumumanKategoriService(repo *repositories.PengumumanKategoriRepository) *PengumumanKategoriService {
	return &PengumumanKategoriService{repo: repo}
}

func cleanKategoriNama(nama string) (string, error) {
	nama = strings.TrimSpace(nama)
	if nama == "" {
		return "", fmt.Errorf("nama kategori wajib diisi")
	}
	if len([]rune(nama)) > 100 {
		return "", fmt.Errorf("nama kategori maksimal 100 karakter")
	}
	return nama, nil
}

func (s *PengumumanKategoriService) FindAll() ([]models.PengumumanKategori, error) {
	return s.repo.FindAll()
}

func (s *PengumumanKategoriService) Create(req models.CreatePengumumanKategoriRequest) (*models.PengumumanKategori, error) {
	nama, err := cleanKategoriNama(req.Nama)
	if err != nil {
		return nil, err
	}
	if _, err := s.repo.FindByNama(nama, nil); err == nil {
		return nil, fmt.Errorf("kategori sudah ada")
	}
	record := &models.PengumumanKategori{Nama: nama}
	return record, s.repo.Create(record)
}

func (s *PengumumanKategoriService) Update(id uuid.UUID, req models.UpdatePengumumanKategoriRequest) (*models.PengumumanKategori, error) {
	record, err := s.repo.FindByID(id)
	if err != nil {
		return nil, fmt.Errorf("kategori tidak ditemukan")
	}
	nama, err := cleanKategoriNama(req.Nama)
	if err != nil {
		return nil, err
	}
	if existing, err := s.repo.FindByNama(nama, &id); err == nil && existing.ID != id {
		return nil, fmt.Errorf("kategori sudah ada")
	}
	oldName := record.Nama
	record.Nama = nama
	if err := s.repo.Update(record); err != nil {
		return nil, err
	}
	if err := s.repo.RenameAnnouncements(oldName, nama); err != nil {
		return nil, err
	}
	return record, nil
}

func (s *PengumumanKategoriService) Delete(id uuid.UUID) error {
	record, err := s.repo.FindByID(id)
	if err != nil {
		return fmt.Errorf("kategori tidak ditemukan")
	}
	name := record.Nama
	if err := s.repo.ClearAnnouncements(name); err != nil {
		return err
	}
	return s.repo.Delete(id)
}

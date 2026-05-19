package services

import (
	"errors"

	"247-golang-api/models"
	"247-golang-api/repositories"

	"github.com/google/uuid"
)

type AnggotaKeluargaService struct {
	repo *repositories.AnggotaKeluargaRepository
}

func NewAnggotaKeluargaService(repo *repositories.AnggotaKeluargaRepository) *AnggotaKeluargaService {
	return &AnggotaKeluargaService{repo: repo}
}

func (s *AnggotaKeluargaService) FindByWargaID(wargaID uuid.UUID) ([]models.AnggotaKeluarga, error) {
	return s.repo.FindByWargaID(wargaID)
}

func (s *AnggotaKeluargaService) Create(wargaID uuid.UUID, req models.CreateAnggotaKeluargaRequest) (*models.AnggotaKeluarga, error) {
	a := &models.AnggotaKeluarga{
		WargaID:        wargaID,
		Nama:           req.Nama,
		StatusHubungan: req.StatusHubungan,
		NoTelp:         req.NoTelp,
	}
	if err := s.repo.Create(a); err != nil {
		return nil, errors.New("gagal menyimpan data")
	}
	return a, nil
}

func (s *AnggotaKeluargaService) Update(id uuid.UUID, req models.UpdateAnggotaKeluargaRequest) (*models.AnggotaKeluarga, error) {
	a, err := s.repo.Update(id, req)
	if err != nil {
		return nil, errors.New("gagal memperbarui data")
	}
	return a, nil
}

func (s *AnggotaKeluargaService) Delete(id uuid.UUID) error {
	if _, err := s.repo.FindByID(id); err != nil {
		return errors.New("data tidak ditemukan")
	}
	return s.repo.Delete(id)
}

package services

import (
	"errors"

	"247-golang-api/models"
	"247-golang-api/repositories"

	"github.com/google/uuid"
)

type PenerimaQurbanService struct {
	repo *repositories.PenerimaQurbanRepository
}

func NewPenerimaQurbanService(repo *repositories.PenerimaQurbanRepository) *PenerimaQurbanService {
	return &PenerimaQurbanService{repo: repo}
}

func (s *PenerimaQurbanService) FindAll(page, limit int, search string) ([]models.PenerimaQurban, int64, error) {
	return s.repo.FindAll(page, limit, search)
}

func (s *PenerimaQurbanService) FindByID(id uuid.UUID) (*models.PenerimaQurban, error) {
	return s.repo.FindByID(id)
}

func (s *PenerimaQurbanService) Create(req models.CreatePenerimaQurbanRequest) (*models.PenerimaQurban, error) {
	p := &models.PenerimaQurban{
		Nama:         req.Nama,
		Blok:         req.Blok,
		NoTelp:       req.NoTelp,
		KondisiRumah: req.KondisiRumah,
	}
	if err := s.repo.Create(p); err != nil {
		return nil, errors.New("gagal menyimpan data")
	}
	return p, nil
}

func (s *PenerimaQurbanService) Update(id uuid.UUID, req models.UpdatePenerimaQurbanRequest) (*models.PenerimaQurban, error) {
	p, err := s.repo.Update(id, req)
	if err != nil {
		return nil, errors.New("gagal memperbarui data")
	}
	return p, nil
}

func (s *PenerimaQurbanService) Delete(id uuid.UUID) error {
	if _, err := s.repo.FindByID(id); err != nil {
		return errors.New("data tidak ditemukan")
	}
	return s.repo.Delete(id)
}

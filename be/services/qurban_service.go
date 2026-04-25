package services

import (
	"errors"

	"247-golang-api/models"
	"247-golang-api/repositories"

	"github.com/google/uuid"
)

type QurbanService struct {
	repo *repositories.QurbanRepository
}

func NewQurbanService(repo *repositories.QurbanRepository) *QurbanService {
	return &QurbanService{repo: repo}
}

func (s *QurbanService) FindAll(page, limit int, search string) ([]models.PengambilanQurbanResponse, int64, error) {
	return s.repo.FindAll(page, limit, search)
}

func (s *QurbanService) Create(req models.CreateQurbanRequest, createdBy string) (*models.PengambilanQurbanResponse, error) {
	wargaID, err := uuid.Parse(req.WargaID)
	if err != nil {
		return nil, errors.New("warga_id tidak valid")
	}

	exists, err := s.repo.ExistsForWarga(wargaID)
	if err != nil {
		return nil, errors.New("gagal mengecek data")
	}
	if exists {
		return nil, errors.New("warga ini sudah tercatat pengambilan qurbannya")
	}

	status := req.Status
	if status == "" {
		status = "Sudah Diambil"
	}

	q := &models.PengambilanQurban{
		WargaID:   wargaID,
		Status:    status,
		CreatedBy: createdBy,
	}
	if err := s.repo.Create(q); err != nil {
		return nil, errors.New("gagal menyimpan data")
	}

	return s.repo.FindByID(q.ID)
}

func (s *QurbanService) Delete(id uuid.UUID) error {
	if _, err := s.repo.FindByID(id); err != nil {
		return errors.New("data tidak ditemukan")
	}
	return s.repo.Delete(id)
}

package services

import (
	"errors"

	"247-golang-api/models"
	"247-golang-api/repositories"

	"github.com/google/uuid"
)

type WargaService struct {
	wargaRepo *repositories.WargaRepository
}

func NewWargaService(wargaRepo *repositories.WargaRepository) *WargaService {
	return &WargaService{wargaRepo: wargaRepo}
}

func (s *WargaService) Create(req models.CreateWargaRequest) (*models.WargaResponse, error) {
	warga := &models.Warga{
		Nama:   req.Nama,
		Blok:   req.Blok,
		NoTelp: req.NoTelp,
		Iuran:  req.Iuran,
	}

	if err := s.wargaRepo.Create(warga); err != nil {
		return nil, errors.New("failed to create warga")
	}

	created, err := s.wargaRepo.FindByID(warga.ID)
	if err != nil {
		return nil, err
	}

	resp := created.ToResponse()
	return &resp, nil
}

func (s *WargaService) FindByID(id uuid.UUID) (*models.WargaResponse, error) {
	warga, err := s.wargaRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("warga not found")
	}
	resp := warga.ToResponse()
	return &resp, nil
}

func (s *WargaService) FindAll(page, limit int) ([]models.WargaResponse, int64, error) {
	warga, total, err := s.wargaRepo.FindAll(page, limit)
	if err != nil {
		return nil, 0, err
	}

	var responses []models.WargaResponse
	for _, w := range warga {
		responses = append(responses, w.ToResponse())
	}

	return responses, total, nil
}

func (s *WargaService) FindAllWithLastPayment(page, limit int) ([]models.WargaWithLastPayment, int64, error) {
	return s.wargaRepo.FindAllWithLastPayment(page, limit)
}

func (s *WargaService) FindByTunggakan(page, limit, bulan int) ([]models.WargaWithLastPayment, int64, error) {
	return s.wargaRepo.FindByTunggakan(page, limit, bulan)
}

func (s *WargaService) Update(id uuid.UUID, req models.UpdateWargaRequest) (*models.WargaResponse, error) {
	warga, err := s.wargaRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("warga not found")
	}

	if req.Nama != "" {
		warga.Nama = req.Nama
	}
	if req.Blok != "" {
		warga.Blok = req.Blok
	}
	if req.NoTelp != "" {
		warga.NoTelp = req.NoTelp
	}
	if req.Iuran > 0 {
		warga.Iuran = req.Iuran
	}

	if err := s.wargaRepo.Update(warga); err != nil {
		return nil, errors.New("failed to update warga")
	}

	updated, _ := s.wargaRepo.FindByID(id)
	resp := updated.ToResponse()
	return &resp, nil
}

func (s *WargaService) Delete(id uuid.UUID) error {
	_, err := s.wargaRepo.FindByID(id)
	if err != nil {
		return errors.New("warga not found")
	}
	return s.wargaRepo.Delete(id)
}
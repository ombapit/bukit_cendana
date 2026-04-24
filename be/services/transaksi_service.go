package services

import (
	"errors"

	"247-golang-api/models"
	"247-golang-api/repositories"

	"github.com/google/uuid"
)

type TransaksiService struct {
	transaksiRepo *repositories.TransaksiRepository
}

func NewTransaksiService(transaksiRepo *repositories.TransaksiRepository) *TransaksiService {
	return &TransaksiService{transaksiRepo: transaksiRepo}
}

func (s *TransaksiService) Create(req models.CreateTransaksiRequest) (*models.TransaksiResponse, error) {
	transaksi := &models.Transaksi{
		WargaID:    req.WargaID,
		TanggalIPL: req.TanggalIPL,
	}

	if err := s.transaksiRepo.Create(transaksi); err != nil {
		return nil, errors.New("failed to create transaksi")
	}

	created, err := s.transaksiRepo.FindByID(transaksi.ID)
	if err != nil {
		return nil, err
	}

	resp := created.ToResponse()
	return &resp, nil
}

func (s *TransaksiService) FindAll(page, limit int) ([]models.TransaksiResponse, int64, error) {
	return s.transaksiRepo.FindAll(page, limit)
}

func (s *TransaksiService) Delete(id uuid.UUID) error {
	_, err := s.transaksiRepo.FindByID(id)
	if err != nil {
		return errors.New("transaksi not found")
	}
	return s.transaksiRepo.Delete(id)
}
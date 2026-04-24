package services

import (
	"errors"
	"os"
	"strings"

	"247-golang-api/models"
	"247-golang-api/repositories"

	"github.com/google/uuid"
)

type IPLService struct {
	iplRepo        *repositories.IPLRepository
	financeService *FinanceService
}

func NewIPLService(iplRepo *repositories.IPLRepository, financeService *FinanceService) *IPLService {
	return &IPLService{iplRepo: iplRepo, financeService: financeService}
}

func (s *IPLService) Create(req models.CreateIPLRequest) (*models.IPLResponse, error) {
	ipl := &models.IPL{
		WargaID:    req.WargaID,
		TanggalIPL: req.TanggalIPL,
		Gambar:     req.Gambar,
	}
	if !req.CreatedAt.IsZero() {
		ipl.CreatedAt = req.CreatedAt
	}

	if err := s.iplRepo.Create(ipl); err != nil {
		return nil, errors.New("failed to create IPL")
	}

	created, err := s.iplRepo.FindByID(ipl.ID)
	if err != nil {
		return nil, err
	}

	// Buat entri finance otomatis (kredit) untuk IPL baru
	if s.financeService != nil && created.Warga != nil {
		_ = s.financeService.CreateFromIPL(
			created.ID,
			created.Warga.Nama,
			created.Warga.Blok,
			created.TanggalIPL,
			created.Warga.Iuran,
			created.CreatedAt,
		)
	}

	resp := created.ToResponse()
	return &resp, nil
}

func (s *IPLService) FindByID(id uuid.UUID) (*models.IPLResponse, error) {
	ipl, err := s.iplRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("IPL not found")
	}
	resp := ipl.ToResponse()
	return &resp, nil
}

func (s *IPLService) FindAll(page, limit int, search string) ([]models.IPLResponse, int64, error) {
	return s.iplRepo.FindAll(page, limit, search)
}

func (s *IPLService) Update(id uuid.UUID, req models.UpdateIPLRequest) (*models.IPLResponse, error) {
	ipl, err := s.iplRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("IPL not found")
	}

	if req.TanggalIPL != "" {
		ipl.TanggalIPL = req.TanggalIPL
	}
	ipl.Gambar = req.Gambar
	if !req.CreatedAt.IsZero() {
		ipl.CreatedAt = req.CreatedAt
	}

	if err := s.iplRepo.Update(ipl); err != nil {
		return nil, errors.New("failed to update IPL")
	}

	updated, err := s.iplRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	resp := updated.ToResponse()
	return &resp, nil
}

func (s *IPLService) Delete(id uuid.UUID) error {
	ipl, err := s.iplRepo.FindByID(id)
	if err != nil {
		return errors.New("IPL not found")
	}

	if err := s.iplRepo.Delete(id); err != nil {
		return err
	}

	// Hapus entri finance terkait (referensi_id = ipl.ID)
	if s.financeService != nil {
		_ = s.financeService.DeleteByReferensiID(id)
	}

	// Hapus file gambar dari disk
	if ipl.Gambar != "" {
		filePath := strings.TrimPrefix(ipl.Gambar, "/")
		_ = os.Remove(filePath)
	}

	return nil
}

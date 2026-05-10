package services

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"

	"247-golang-api/models"
	"247-golang-api/repositories"

	"github.com/google/uuid"
)

func monthsInRange(start, end string) ([]string, error) {
	if len(start) != 6 || len(end) != 6 {
		return nil, errors.New("format tanggal tidak valid (YYYYMM)")
	}
	sy, _ := strconv.Atoi(start[:4])
	sm, _ := strconv.Atoi(start[4:])
	ey, _ := strconv.Atoi(end[:4])
	em, _ := strconv.Atoi(end[4:])
	if sy > ey || (sy == ey && sm > em) {
		return nil, errors.New("tanggal_ipl_end harus >= tanggal_ipl")
	}
	count := (ey-sy)*12 + (em - sm) + 1
	if count > 24 {
		return nil, errors.New("rentang maksimal 24 bulan")
	}
	months := make([]string, 0, count)
	y, m := sy, sm
	for {
		months = append(months, fmt.Sprintf("%04d%02d", y, m))
		if y == ey && m == em {
			break
		}
		m++
		if m > 12 {
			m = 1
			y++
		}
	}
	return months, nil
}

type IPLService struct {
	iplRepo        *repositories.IPLRepository
	financeService *FinanceService
}

func NewIPLService(iplRepo *repositories.IPLRepository, financeService *FinanceService) *IPLService {
	return &IPLService{iplRepo: iplRepo, financeService: financeService}
}

func (s *IPLService) Create(req models.CreateIPLRequest) ([]models.IPLResponse, error) {
	endPeriod := req.TanggalIPLEnd
	if endPeriod == "" {
		endPeriod = req.TanggalIPL
	}

	months, err := monthsInRange(req.TanggalIPL, endPeriod)
	if err != nil {
		return nil, err
	}

	results := make([]models.IPLResponse, 0, len(months))
	for _, month := range months {
		ipl := &models.IPL{
			WargaID:    req.WargaID,
			TanggalIPL: month,
			Gambar:     req.Gambar,
		}
		if !req.CreatedAt.IsZero() {
			ipl.CreatedAt = req.CreatedAt
		}

		if err := s.iplRepo.Create(ipl); err != nil {
			return nil, fmt.Errorf("gagal membuat IPL %s", month)
		}

		created, err := s.iplRepo.FindByID(ipl.ID)
		if err != nil {
			return nil, err
		}

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

		results = append(results, created.ToResponse())
	}

	return results, nil
}

func (s *IPLService) FindByID(id uuid.UUID) (*models.IPLResponse, error) {
	ipl, err := s.iplRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("IPL not found")
	}
	resp := ipl.ToResponse()
	return &resp, nil
}

func (s *IPLService) FindAll(page, limit int, search, blok string) ([]models.IPLResponse, int64, error) {
	return s.iplRepo.FindAll(page, limit, search, blok)
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

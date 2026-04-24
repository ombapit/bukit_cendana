package services

import (
	"fmt"
	"time"

	"247-golang-api/models"
	"247-golang-api/repositories"

	"github.com/google/uuid"
)

var bulanIndo = map[string]string{
	"01": "Januari", "02": "Februari", "03": "Maret", "04": "April",
	"05": "Mei", "06": "Juni", "07": "Juli", "08": "Agustus",
	"09": "September", "10": "Oktober", "11": "November", "12": "Desember",
}

type FinanceService struct {
	financeRepo *repositories.FinanceRepository
}

func NewFinanceService(financeRepo *repositories.FinanceRepository) *FinanceService {
	return &FinanceService{financeRepo: financeRepo}
}

func (s *FinanceService) Create(req models.CreateFinanceRequest) (*models.Finance, error) {
	f := &models.Finance{
		NamaTransaksi: req.NamaTransaksi,
		Deskripsi:     req.Deskripsi,
		Kategori:      req.Kategori,
		Debit:         req.Debit,
		Kredit:        req.Kredit,
		Gambar:        req.Gambar,
		Tanggal:       time.Now(),
	}
	if req.Tanggal != "" {
		if t, err := time.Parse("2006-01-02", req.Tanggal); err == nil {
			f.Tanggal = t
		}
	}
	return f, s.financeRepo.Create(f)
}

func (s *FinanceService) FindAll(page, limit int, search, dateFrom, dateTo string) ([]models.Finance, int64, error) {
	return s.financeRepo.FindAll(page, limit, search, dateFrom, dateTo)
}

func (s *FinanceService) FindByID(id uuid.UUID) (*models.Finance, error) {
	return s.financeRepo.FindByID(id)
}

func (s *FinanceService) GetSummary(dateFrom, dateTo string) (*models.FinanceSummary, error) {
	return s.financeRepo.GetSummary(dateFrom, dateTo)
}

func (s *FinanceService) Update(id uuid.UUID, req models.UpdateFinanceRequest) (*models.Finance, error) {
	f, err := s.financeRepo.FindByID(id)
	if err != nil {
		return nil, fmt.Errorf("finance record not found")
	}
	if req.NamaTransaksi != "" {
		f.NamaTransaksi = req.NamaTransaksi
	}
	f.Deskripsi = req.Deskripsi
	f.Kategori = req.Kategori
	f.Debit = req.Debit
	f.Kredit = req.Kredit
	if req.Gambar != "" {
		f.Gambar = req.Gambar
	}
	if req.Tanggal != "" {
		if t, err := time.Parse("2006-01-02", req.Tanggal); err == nil {
			f.Tanggal = t
		}
	}
	return f, s.financeRepo.Update(f)
}

func (s *FinanceService) Delete(id uuid.UUID) error {
	if _, err := s.financeRepo.FindByID(id); err != nil {
		return fmt.Errorf("finance record not found")
	}
	return s.financeRepo.Delete(id)
}

func (s *FinanceService) DeleteByReferensiID(referensiID uuid.UUID) error {
	return s.financeRepo.DeleteByReferensiID(referensiID)
}

// CreateFromIPL dipanggil otomatis saat IPL baru dibuat.
func (s *FinanceService) CreateFromIPL(iplID uuid.UUID, wargaNama, wargaBlok, tanggalIPL string, iuran float64, tanggal time.Time) error {
	periodeStr := tanggalIPL
	if len(tanggalIPL) == 6 {
		bulan := tanggalIPL[4:6]
		tahun := tanggalIPL[0:4]
		if nama, ok := bulanIndo[bulan]; ok {
			periodeStr = nama + " " + tahun
		}
	}

	f := &models.Finance{
		NamaTransaksi: fmt.Sprintf("IPL %s - %s", periodeStr, wargaNama),
		Deskripsi:     fmt.Sprintf("Pembayaran IPL periode %s atas nama %s blok %s", periodeStr, wargaNama, wargaBlok),
		Kategori:      "IPL",
		Kredit:        iuran,
		Debit:         0,
		ReferensiID:   &iplID,
		ReferensiTipe: "ipl",
		Tanggal:       tanggal,
	}
	return s.financeRepo.Create(f)
}

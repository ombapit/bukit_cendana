package services

import (
	"errors"
	"fmt"

	"247-golang-api/models"
	"247-golang-api/repositories"

	"github.com/google/uuid"
)

type IPLPaymentService struct {
	repo       *repositories.IPLPaymentRepository
	wargaRepo  *repositories.WargaRepository
	ipaymu     *IPaymuService
	iplService *IPLService
}

func NewIPLPaymentService(
	repo *repositories.IPLPaymentRepository,
	wargaRepo *repositories.WargaRepository,
	ipaymu *IPaymuService,
	iplService *IPLService,
) *IPLPaymentService {
	return &IPLPaymentService{repo: repo, wargaRepo: wargaRepo, ipaymu: ipaymu, iplService: iplService}
}

func (s *IPLPaymentService) Initiate(req models.InitiateIPLPaymentRequest) (*models.InitiateIPLPaymentResponse, error) {
	if req.WargaID == "" || req.TanggalIPL == "" {
		return nil, errors.New("warga_id dan tanggal_ipl wajib diisi")
	}

	wargaID, err := uuid.Parse(req.WargaID)
	if err != nil {
		return nil, errors.New("warga_id tidak valid")
	}

	warga, err := s.wargaRepo.FindByID(wargaID)
	if err != nil {
		return nil, errors.New("warga tidak ditemukan")
	}

	endPeriod := req.TanggalIPLEnd
	if endPeriod == "" {
		endPeriod = req.TanggalIPL
	}

	months, err := monthsInRange(req.TanggalIPL, endPeriod)
	if err != nil {
		return nil, err
	}

	totalAmount := int64(warga.Iuran) * int64(len(months))
	referenceID := "ipl-" + uuid.New().String()[:8]

	productName := fmt.Sprintf("IPL Bukit Cendana - %s", warga.Nama)
	if len(months) > 1 {
		productName = fmt.Sprintf("IPL Bukit Cendana - %s (%d bulan)", warga.Nama, len(months))
	}

	paymentResult, err := s.ipaymu.CreatePayment(referenceID, warga.Nama, productName, totalAmount)
	if err != nil {
		return nil, fmt.Errorf("gagal membuat pembayaran: %s", err.Error())
	}

	pending := &models.IPLPaymentReq{
		WargaID:         wargaID,
		TanggalIPLStart: req.TanggalIPL,
		TanggalIPLEnd:   endPeriod,
		JumlahBulan:     len(months),
		TotalAmount:     totalAmount,
		ReferenceID:     referenceID,
		IPaymuTrxID:     paymentResult.TrxID,
		PaymentURL:      paymentResult.PaymentURL,
		Status:          models.IPLPaymentStatusPending,
	}
	if err := s.repo.Create(pending); err != nil {
		return nil, errors.New("gagal menyimpan permintaan pembayaran")
	}

	return &models.InitiateIPLPaymentResponse{
		ReferenceID:     referenceID,
		PaymentURL:      paymentResult.PaymentURL,
		JumlahBulan:     len(months),
		TotalAmount:     totalAmount,
		WargaNama:       warga.Nama,
		WargaBlok:       warga.Blok,
		TanggalIPLStart: req.TanggalIPL,
		TanggalIPLEnd:   endPeriod,
	}, nil
}

func (s *IPLPaymentService) HandleWebhook(trxID, referenceID, status string) error {
	if referenceID == "" {
		return errors.New("reference_id kosong")
	}

	existing, err := s.repo.FindByReferenceID(referenceID)
	if err != nil {
		return errors.New("referensi pembayaran tidak ditemukan")
	}
	if existing.Status != models.IPLPaymentStatusPending {
		return nil // already processed — idempotent
	}

	if status != "berhasil" {
		return s.repo.UpdateStatus(referenceID, models.IPLPaymentStatusFailed, trxID)
	}

	iplReq := models.CreateIPLRequest{
		WargaID:       existing.WargaID,
		TanggalIPL:    existing.TanggalIPLStart,
		TanggalIPLEnd: existing.TanggalIPLEnd,
	}
	if _, err := s.iplService.Create(iplReq); err != nil {
		return fmt.Errorf("gagal mencatat pembayaran IPL: %s", err.Error())
	}

	return s.repo.UpdateStatus(referenceID, models.IPLPaymentStatusPaid, trxID)
}

func (s *IPLPaymentService) GetStatus(referenceID string) (*models.IPLPaymentStatusResponse, error) {
	req, err := s.repo.FindByReferenceID(referenceID)
	if err != nil {
		return nil, errors.New("referensi pembayaran tidak ditemukan")
	}

	nama, blok := "", ""
	if req.Warga != nil {
		nama = req.Warga.Nama
		blok = req.Warga.Blok
	}

	return &models.IPLPaymentStatusResponse{
		ReferenceID:     req.ReferenceID,
		Status:          req.Status,
		JumlahBulan:     req.JumlahBulan,
		TotalAmount:     req.TotalAmount,
		WargaNama:       nama,
		WargaBlok:       blok,
		TanggalIPLStart: req.TanggalIPLStart,
		TanggalIPLEnd:   req.TanggalIPLEnd,
	}, nil
}

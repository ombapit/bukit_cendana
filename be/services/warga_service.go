package services

import (
	"errors"
	"log"

	"247-golang-api/models"
	"247-golang-api/repositories"
	"247-golang-api/utils"

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

	// Generate QR code immediately after creation
	id := warga.ID.String()
	qrPath, err := utils.GenerateWargaQR(id, warga.Nama, warga.Blok)
	if err != nil {
		log.Printf("[WARN] Failed to generate QR for warga %s: %v", id, err)
	} else {
		_ = s.wargaRepo.UpdateQRCode(id, qrPath)
		warga.QRCode = qrPath
	}

	created, err := s.wargaRepo.FindByID(warga.ID)
	if err != nil {
		return nil, err
	}

	resp := created.ToResponse()
	return &resp, nil
}

// SeedQRCodes generates QR codes for all existing warga that don't have one yet.
func (s *WargaService) SeedQRCodes() {
	wargas, err := s.wargaRepo.FindAllWithoutQR()
	if err != nil {
		log.Printf("[WARN] SeedQRCodes: failed to fetch warga: %v", err)
		return
	}
	if len(wargas) == 0 {
		return
	}
	log.Printf("[QR] Generating QR codes for %d warga...", len(wargas))
	for _, w := range wargas {
		id := w.ID.String()
		qrPath, err := utils.GenerateWargaQR(id, w.Nama, w.Blok)
		if err != nil {
			log.Printf("[WARN] QR failed for %s: %v", id, err)
			continue
		}
		if err := s.wargaRepo.UpdateQRCode(id, qrPath); err != nil {
			log.Printf("[WARN] QR DB update failed for %s: %v", id, err)
		}
	}
	log.Printf("[QR] Done generating QR codes")
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

	// Hapus QR lama dan generate ulang
	idStr := id.String()
	utils.DeleteWargaQR(idStr)
	qrPath, err := utils.GenerateWargaQR(idStr, warga.Nama, warga.Blok)
	if err != nil {
		log.Printf("[WARN] Failed to regenerate QR for warga %s: %v", idStr, err)
	} else {
		_ = s.wargaRepo.UpdateQRCode(idStr, qrPath)
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
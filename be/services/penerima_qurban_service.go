package services

import (
	"errors"
	"log"

	"247-golang-api/models"
	"247-golang-api/repositories"
	"247-golang-api/utils"

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

	id := p.ID.String()
	qrPath, err := utils.GenerateWargaQR(id, p.Nama, p.Blok)
	if err != nil {
		log.Printf("[WARN] Failed to generate QR for penerima_qurban %s: %v", id, err)
	} else {
		_ = s.repo.UpdateQRCode(id, qrPath)
		p.QRCode = qrPath
	}

	return s.repo.FindByID(p.ID)
}

func (s *PenerimaQurbanService) Update(id uuid.UUID, req models.UpdatePenerimaQurbanRequest) (*models.PenerimaQurban, error) {
	p, err := s.repo.Update(id, req)
	if err != nil {
		return nil, errors.New("gagal memperbarui data")
	}

	idStr := id.String()
	utils.DeleteWargaQR(idStr)
	qrPath, err := utils.GenerateWargaQR(idStr, p.Nama, p.Blok)
	if err != nil {
		log.Printf("[WARN] Failed to regenerate QR for penerima_qurban %s: %v", idStr, err)
	} else {
		_ = s.repo.UpdateQRCode(idStr, qrPath)
	}

	return s.repo.FindByID(id)
}

func (s *PenerimaQurbanService) Delete(id uuid.UUID) error {
	p, err := s.repo.FindByID(id)
	if err != nil {
		return errors.New("data tidak ditemukan")
	}
	utils.DeleteWargaQR(p.ID.String())
	return s.repo.Delete(id)
}

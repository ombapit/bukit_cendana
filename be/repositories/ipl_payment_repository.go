package repositories

import (
	"247-golang-api/models"

	"gorm.io/gorm"
)

type IPLPaymentRepository struct {
	db *gorm.DB
}

func NewIPLPaymentRepository(db *gorm.DB) *IPLPaymentRepository {
	return &IPLPaymentRepository{db: db}
}

func (r *IPLPaymentRepository) Create(req *models.IPLPaymentReq) error {
	return r.db.Create(req).Error
}

func (r *IPLPaymentRepository) FindByReferenceID(referenceID string) (*models.IPLPaymentReq, error) {
	var req models.IPLPaymentReq
	err := r.db.Preload("Warga").Where("reference_id = ?", referenceID).First(&req).Error
	return &req, err
}

func (r *IPLPaymentRepository) UpdateStatus(referenceID, status, trxID string) error {
	updates := map[string]interface{}{"status": status}
	if trxID != "" {
		updates["ipaymu_trx_id"] = trxID
	}
	return r.db.Model(&models.IPLPaymentReq{}).Where("reference_id = ?", referenceID).Updates(updates).Error
}

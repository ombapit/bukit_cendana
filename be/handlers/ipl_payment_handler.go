package handlers

import (
	"net/http"

	"247-golang-api/models"
	"247-golang-api/services"
	"247-golang-api/utils"

	"github.com/gin-gonic/gin"
)

type IPLPaymentHandler struct {
	svc *services.IPLPaymentService
}

func NewIPLPaymentHandler(svc *services.IPLPaymentService) *IPLPaymentHandler {
	return &IPLPaymentHandler{svc: svc}
}

// Initiate godoc
// @Summary  Inisiasi pembayaran IPL via iPaymu
// @Tags     IPL Payment
// @Accept   json
// @Produce  json
// @Param    body body models.InitiateIPLPaymentRequest true "Data pembayaran"
// @Success  201 {object} utils.APIResponse{data=models.InitiateIPLPaymentResponse}
// @Router   /ipl-payments [post]
func (h *IPLPaymentHandler) Initiate(c *gin.Context) {
	var req models.InitiateIPLPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	result, err := h.svc.Initiate(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.CreatedResponse(c, "Pembayaran berhasil diinisiasi", result)
}

// Webhook godoc
// @Summary  Callback notifikasi dari iPaymu
// @Tags     IPL Payment
// @Accept   json
// @Produce  json
// @Router   /webhooks/ipaymu [post]
func (h *IPLPaymentHandler) Webhook(c *gin.Context) {
	var body struct {
		TrxID       string `json:"trx_id"`
		ReferenceID string `json:"reference_id"`
		Status      string `json:"status"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		// iPaymu may send form data
		body.TrxID = c.PostForm("trx_id")
		body.ReferenceID = c.PostForm("reference_id")
		body.Status = c.PostForm("status")
	}

	if err := h.svc.HandleWebhook(body.TrxID, body.ReferenceID, body.Status); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// GetStatus godoc
// @Summary  Cek status pembayaran IPL
// @Tags     IPL Payment
// @Produce  json
// @Param    reference_id path string true "Reference ID"
// @Success  200 {object} utils.APIResponse{data=models.IPLPaymentStatusResponse}
// @Router   /ipl-payments/{reference_id}/status [get]
func (h *IPLPaymentHandler) GetStatus(c *gin.Context) {
	referenceID := c.Param("reference_id")

	result, err := h.svc.GetStatus(referenceID)
	if err != nil {
		utils.NotFoundResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, "OK", result)
}

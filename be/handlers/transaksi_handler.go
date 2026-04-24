package handlers

import (
	"net/http"
	"strconv"

	"247-golang-api/models"
	"247-golang-api/services"
	"247-golang-api/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type TransaksiHandler struct {
	transaksiService *services.TransaksiService
}

func NewTransaksiHandler(transaksiService *services.TransaksiService) *TransaksiHandler {
	return &TransaksiHandler{transaksiService: transaksiService}
}

// FindAll godoc
// @Summary     Daftar semua transaksi
// @Description Mendapatkan daftar transaksi dengan pagination
// @Tags        Transaksi
// @Produce     json
// @Security    BearerAuth
// @Param       page  query    int false "Nomor halaman" default(1)
// @Param       limit query    int false "Jumlah per halaman (max 100)" default(50)
// @Success     200   {object} utils.APIResponse{data=[]models.TransaksiResponse,meta=utils.Meta}
// @Failure     401   {object} utils.APIResponse
// @Failure     500   {object} utils.APIResponse
// @Router      /transaksi [get]
func (h *TransaksiHandler) FindAll(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 50
	}

	transaksi, total, err := h.transaksiService.FindAll(page, limit)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.PaginatedResponse(c, "Transaksi retrieved", transaksi, page, limit, total)
}

// Create godoc
// @Summary     Buat transaksi baru
// @Description Membuat transaksi pembayaran IPL
// @Tags        Transaksi
// @Accept      json
// @Produce     json
// @Security    BearerAuth
// @Param       request body     models.CreateTransaksiRequest true "Data transaksi"
// @Success     201     {object} utils.APIResponse{data=models.TransaksiResponse}
// @Failure     400     {object} utils.APIResponse
// @Failure     401     {object} utils.APIResponse
// @Router      /transaksi [post]
func (h *TransaksiHandler) Create(c *gin.Context) {
	var req models.CreateTransaksiRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	transaksi, err := h.transaksiService.Create(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.CreatedResponse(c, "Transaksi created successfully", transaksi)
}

// Delete godoc
// @Summary     Hapus transaksi
// @Description Menghapus transaksi berdasarkan ID
// @Tags        Transaksi
// @Produce     json
// @Security    BearerAuth
// @Param       id  path     string true "Transaksi ID (UUID)"
// @Success     200 {object} utils.APIResponse
// @Failure     400 {object} utils.APIResponse
// @Failure     401 {object} utils.APIResponse
// @Router      /transaksi/{id} [delete]
func (h *TransaksiHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid transaksi ID")
		return
	}

	if err := h.transaksiService.Delete(id); err != nil {
		if err.Error() == "transaksi not found" {
			utils.NotFoundResponse(c, err.Error())
		} else {
			utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		}
		return
	}

	utils.SuccessResponse(c, "Transaksi deleted successfully", nil)
}
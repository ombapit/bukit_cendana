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

type WargaHandler struct {
	wargaService *services.WargaService
}

func NewWargaHandler(wargaService *services.WargaService) *WargaHandler {
	return &WargaHandler{wargaService: wargaService}
}

// FindAll godoc
// @Summary     Daftar semua warga
// @Description Mendapatkan daftar warga dengan pagination dan pembayaran terakhir
// @Tags        Warga
// @Produce     json
// @Security    BearerAuth
// @Param       page  query    int false "Nomor halaman" default(1)
// @Param       limit query    int false "Jumlah per halaman (max 1000)" default(100)
// @Param       tunggakan query int false "Filter tunggakan (2=tunggakan 2 bulan, 3=tunggakan 3 bulan, 4=tunggakan 4+ bulan)"
// @Success     200   {object} utils.APIResponse{data=[]models.WargaWithLastPayment,meta=utils.Meta}
// @Failure     401   {object} utils.APIResponse
// @Failure     500   {object} utils.APIResponse
// @Router      /warga [get]
func (h *WargaHandler) FindAll(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "1000"))
	tunggakan, _ := strconv.Atoi(c.DefaultQuery("tunggakan", "0"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 1000 {
		limit = 1000
	}

	var warga []models.WargaWithLastPayment
	var total int64
	var err error

	if tunggakan > 0 {
		warga, total, err = h.wargaService.FindByTunggakan(page, limit, tunggakan)
	} else {
		warga, total, err = h.wargaService.FindAllWithLastPayment(page, limit)
	}

	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.PaginatedResponse(c, "Warga retrieved", warga, page, limit, total)
}

// FindByID godoc
// @Summary     Detail warga
// @Description Mendapatkan detail warga berdasarkan ID
// @Tags        Warga
// @Produce     json
// @Security    BearerAuth
// @Param       id  path     string true "Warga ID (UUID)"
// @Success     200 {object} utils.APIResponse{data=models.WargaResponse}
// @Failure     400 {object} utils.APIResponse
// @Failure     404 {object} utils.APIResponse
// @Router      /warga/{id} [get]
func (h *WargaHandler) FindByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid warga ID")
		return
	}

	warga, err := h.wargaService.FindByID(id)
	if err != nil {
		utils.NotFoundResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, "Warga found", warga)
}

// Create godoc
// @Summary     Buat warga baru
// @Description Membuat warga baru
// @Tags        Warga
// @Accept      json
// @Produce     json
// @Security    BearerAuth
// @Param       request body     models.CreateWargaRequest true "Data warga baru"
// @Success     201     {object} utils.APIResponse{data=models.WargaResponse}
// @Failure     400     {object} utils.APIResponse
// @Failure     401     {object} utils.APIResponse
// @Router      /warga [post]
func (h *WargaHandler) Create(c *gin.Context) {
	var req struct {
		Nama   string  `json:"nama" binding:"required"`
		Blok   string  `json:"blok" binding:"required"`
		NoTelp string  `json:"no_telp"`
		Iuran  float64 `json:"iuran"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	warga, err := h.wargaService.Create(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.CreatedResponse(c, "Warga created successfully", warga)
}

// Update godoc
// @Summary     Update warga
// @Description Mengupdate data warga berdasarkan ID
// @Tags        Warga
// @Accept      json
// @Produce     json
// @Security    BearerAuth
// @Param       id      path     string true "Warga ID (UUID)"
// @Param       request body     models.UpdateWargaRequest true "Data update warga"
// @Success     200     {object} utils.APIResponse{data=models.WargaResponse}
// @Failure     400     {object} utils.APIResponse
// @Failure     401     {object} utils.APIResponse
// @Router      /warga/{id} [put]
func (h *WargaHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid warga ID")
		return
	}

	var req struct {
		Nama   string  `json:"nama"`
		Blok   string  `json:"blok"`
		NoTelp string  `json:"no_telp"`
		Iuran  float64 `json:"iuran"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	warga, err := h.wargaService.Update(id, req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, "Warga updated successfully", warga)
}

// Delete godoc
// @Summary     Hapus warga
// @Description Menghapus warga berdasarkan ID
// @Tags        Warga
// @Produce     json
// @Security    BearerAuth
// @Param       id  path     string true "Warga ID (UUID)"
// @Success     200 {object} utils.APIResponse
// @Failure     400 {object} utils.APIResponse
// @Failure     401 {object} utils.APIResponse
// @Router      /warga/{id} [delete]
func (h *WargaHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid warga ID")
		return
	}

	if err := h.wargaService.Delete(id); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, "Warga deleted successfully", nil)
}
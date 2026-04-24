package handlers

import (
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"247-golang-api/models"
	"247-golang-api/services"
	"247-golang-api/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type IPLHandler struct {
	iplService *services.IPLService
}

func NewIPLHandler(iplService *services.IPLService) *IPLHandler {
	return &IPLHandler{iplService: iplService}
}

func saveUploadedFile(c *gin.Context, field string) string {
	file, header, err := c.Request.FormFile(field)
	if err != nil {
		return ""
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	filename := uuid.New().String() + ext
	dirPath := filepath.Join("uploads", "ipls")
	if err := os.MkdirAll(dirPath, os.ModePerm); err != nil {
		return ""
	}
	dstPath := filepath.Join(dirPath, filename)
	out, err := os.Create(dstPath)
	if err != nil {
		return ""
	}
	defer out.Close()
	if _, err := io.Copy(out, file); err != nil {
		return ""
	}
	return "/" + strings.ReplaceAll(dstPath, string(os.PathSeparator), "/")
}

// FindAll godoc
// @Summary     Daftar semua IPL
// @Tags        IPL
// @Produce     json
// @Security    BearerAuth
// @Param       page  query int false "Nomor halaman" default(1)
// @Param       limit query int false "Jumlah per halaman" default(20)
// @Success     200 {object} utils.APIResponse{data=[]models.IPLResponse,meta=utils.Meta}
// @Router      /ipls [get]
func (h *IPLHandler) FindAll(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	search := c.DefaultQuery("search", "")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	ipls, total, err := h.iplService.FindAll(page, limit, search)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.PaginatedResponse(c, "IPL retrieved", ipls, page, limit, total)
}

// Create godoc
// @Summary     Buat pembayaran IPL baru
// @Tags        IPL
// @Accept      multipart/form-data
// @Produce     json
// @Security    BearerAuth
// @Param       warga_id    formData string true  "Warga ID"
// @Param       tanggal_ipl formData string true  "Periode YYYYMM"
// @Param       gambar      formData file   false "Bukti pembayaran"
// @Success     201 {object} utils.APIResponse{data=models.IPLResponse}
// @Router      /ipls [post]
func (h *IPLHandler) Create(c *gin.Context) {
	wargaIDStr := c.PostForm("warga_id")
	tanggalIPL := c.PostForm("tanggal_ipl")

	if wargaIDStr == "" || tanggalIPL == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "warga_id and tanggal_ipl are required")
		return
	}

	wargaID, err := uuid.Parse(wargaIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid warga_id")
		return
	}

	gambarPath := saveUploadedFile(c, "gambar")

	req := models.CreateIPLRequest{
		WargaID:    wargaID,
		TanggalIPL: tanggalIPL,
		Gambar:     gambarPath,
	}
	if createdAtStr := c.PostForm("created_at"); createdAtStr != "" {
		if t, err := time.Parse("2006-01-02", createdAtStr); err == nil {
			req.CreatedAt = t
		}
	}

	ipl, err := h.iplService.Create(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.CreatedResponse(c, "IPL created successfully", ipl)
}

// Update godoc
// @Summary     Update pembayaran IPL
// @Tags        IPL
// @Accept      multipart/form-data
// @Produce     json
// @Security    BearerAuth
// @Param       id          path     string true  "IPL ID"
// @Param       tanggal_ipl formData string false "Periode YYYYMM"
// @Param       gambar      formData file   false "Bukti pembayaran"
// @Success     200 {object} utils.APIResponse{data=models.IPLResponse}
// @Router      /ipls/{id} [put]
func (h *IPLHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid IPL ID")
		return
	}

	existing, err := h.iplService.FindByID(id)
	if err != nil {
		utils.NotFoundResponse(c, "IPL not found")
		return
	}

	tanggalIPL := c.PostForm("tanggal_ipl")
	if tanggalIPL == "" {
		tanggalIPL = existing.TanggalIPL
	}

	gambarPath := saveUploadedFile(c, "gambar")
	if gambarPath == "" {
		gambarPath = existing.Gambar
	} else if existing.Gambar != "" {
		// Hapus gambar lama saat ada upload baru
		_ = os.Remove(strings.TrimPrefix(existing.Gambar, "/"))
	}

	req := models.UpdateIPLRequest{
		TanggalIPL: tanggalIPL,
		Gambar:     gambarPath,
		CreatedAt:  existing.CreatedAt,
	}
	if createdAtStr := c.PostForm("created_at"); createdAtStr != "" {
		if t, err := time.Parse("2006-01-02", createdAtStr); err == nil {
			req.CreatedAt = t
		}
	}

	ipl, err := h.iplService.Update(id, req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, "IPL updated successfully", ipl)
}

// Delete godoc
// @Summary     Hapus pembayaran IPL
// @Tags        IPL
// @Produce     json
// @Security    BearerAuth
// @Param       id path string true "IPL ID"
// @Success     200 {object} utils.APIResponse
// @Router      /ipls/{id} [delete]
func (h *IPLHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid IPL ID")
		return
	}

	if err := h.iplService.Delete(id); err != nil {
		if err.Error() == "IPL not found" {
			utils.NotFoundResponse(c, err.Error())
		} else {
			utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		}
		return
	}

	utils.SuccessResponse(c, "IPL deleted successfully", nil)
}

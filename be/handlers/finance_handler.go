package handlers

import (
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"247-golang-api/models"
	"247-golang-api/services"
	"247-golang-api/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type FinanceHandler struct {
	financeService *services.FinanceService
}

func NewFinanceHandler(financeService *services.FinanceService) *FinanceHandler {
	return &FinanceHandler{financeService: financeService}
}

func saveFinanceFile(c *gin.Context, field string) string {
	file, header, err := c.Request.FormFile(field)
	if err != nil {
		return ""
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	filename := uuid.New().String() + ext
	dirPath := filepath.Join("uploads", "finance")
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

func (h *FinanceHandler) FindAll(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	search := c.DefaultQuery("search", "")
	dateFrom := c.DefaultQuery("date_from", "")
	dateTo := c.DefaultQuery("date_to", "")
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	records, total, err := h.financeService.FindAll(page, limit, search, dateFrom, dateTo)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	utils.PaginatedResponse(c, "Finance records retrieved", records, page, limit, total)
}

func (h *FinanceHandler) GetSummary(c *gin.Context) {
	dateFrom := c.DefaultQuery("date_from", "")
	dateTo := c.DefaultQuery("date_to", "")
	summary, err := h.financeService.GetSummary(dateFrom, dateTo)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(c, "Summary retrieved", summary)
}

func (h *FinanceHandler) FindByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID")
		return
	}
	f, err := h.financeService.FindByID(id)
	if err != nil {
		utils.NotFoundResponse(c, "Finance record not found")
		return
	}
	utils.SuccessResponse(c, "Finance record found", f)
}

func (h *FinanceHandler) Create(c *gin.Context) {
	namaTransaksi := c.PostForm("nama_transaksi")
	if namaTransaksi == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "nama_transaksi is required")
		return
	}
	debit, _ := strconv.ParseFloat(c.PostForm("debit"), 64)
	kredit, _ := strconv.ParseFloat(c.PostForm("kredit"), 64)

	req := models.CreateFinanceRequest{
		NamaTransaksi: namaTransaksi,
		Deskripsi:     c.PostForm("deskripsi"),
		Kategori:      c.PostForm("kategori"),
		Debit:         debit,
		Kredit:        kredit,
		Tanggal:       c.PostForm("timestamp"),
		Gambar:        saveFinanceFile(c, "gambar"),
	}
	f, err := h.financeService.Create(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.CreatedResponse(c, "Finance record created", f)
}

func (h *FinanceHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID")
		return
	}
	debit, _ := strconv.ParseFloat(c.PostForm("debit"), 64)
	kredit, _ := strconv.ParseFloat(c.PostForm("kredit"), 64)

	req := models.UpdateFinanceRequest{
		NamaTransaksi: c.PostForm("nama_transaksi"),
		Deskripsi:     c.PostForm("deskripsi"),
		Kategori:      c.PostForm("kategori"),
		Debit:         debit,
		Kredit:        kredit,
		Tanggal:       c.PostForm("timestamp"),
		Gambar:        saveFinanceFile(c, "gambar"),
	}
	f, err := h.financeService.Update(id, req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.SuccessResponse(c, "Finance record updated", f)
}

func (h *FinanceHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID")
		return
	}
	if err := h.financeService.Delete(id); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.SuccessResponse(c, "Finance record deleted", nil)
}

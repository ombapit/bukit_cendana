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

type PengumumanHandler struct {
	service *services.PengumumanService
}

func NewPengumumanHandler(service *services.PengumumanService) *PengumumanHandler {
	return &PengumumanHandler{service: service}
}

func savePengumumanFile(c *gin.Context, field string) string {
	file, header, err := c.Request.FormFile(field)
	if err != nil {
		return ""
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	filename := uuid.New().String() + ext
	dirPath := filepath.Join("uploads", "pengumuman")
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

func (h *PengumumanHandler) FindAll(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "12"))
	search := c.DefaultQuery("search", "")
	kategori := c.DefaultQuery("kategori", "")
	publishedOnly := c.DefaultQuery("published_only", "false") == "true"
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 12
	}
	records, total, err := h.service.FindAll(page, limit, search, kategori, publishedOnly)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	utils.PaginatedResponse(c, "Pengumuman retrieved", records, page, limit, total)
}

func (h *PengumumanHandler) FindByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID")
		return
	}
	p, err := h.service.FindByID(id)
	if err != nil {
		utils.NotFoundResponse(c, "Pengumuman not found")
		return
	}
	utils.SuccessResponse(c, "Pengumuman found", p)
}

func (h *PengumumanHandler) Create(c *gin.Context) {
	judul := c.PostForm("judul")
	if judul == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "judul is required")
		return
	}
	creatorName, _ := c.Get("username")
	creator, _ := creatorName.(string)
	req := models.CreatePengumumanRequest{
		Judul:         judul,
		Konten:        c.PostForm("konten"),
		Kategori:      c.PostForm("kategori"),
		Tags:          c.PostForm("tags"),
		IsPublished:   c.PostForm("is_published") != "false",
		Gambar:        savePengumumanFile(c, "gambar"),
		CreatedByName: creator,
	}
	p, err := h.service.Create(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.CreatedResponse(c, "Pengumuman created", p)
}

func (h *PengumumanHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID")
		return
	}
	creatorName, _ := c.Get("username")
	creator, _ := creatorName.(string)
	req := models.UpdatePengumumanRequest{
		Judul:         c.PostForm("judul"),
		Konten:        c.PostForm("konten"),
		Kategori:      c.PostForm("kategori"),
		Tags:          c.PostForm("tags"),
		IsPublished:   c.PostForm("is_published") != "false",
		Gambar:        savePengumumanFile(c, "gambar"),
		CreatedByName: creator,
	}
	p, err := h.service.Update(id, req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.SuccessResponse(c, "Pengumuman updated", p)
}

func (h *PengumumanHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID")
		return
	}
	if err := h.service.Delete(id); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.SuccessResponse(c, "Pengumuman deleted", nil)
}

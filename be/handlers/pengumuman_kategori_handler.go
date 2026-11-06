package handlers

import (
	"net/http"
	"strings"

	"247-golang-api/models"
	"247-golang-api/services"
	"247-golang-api/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PengumumanKategoriHandler struct {
	service *services.PengumumanKategoriService
}

func NewPengumumanKategoriHandler(service *services.PengumumanKategoriService) *PengumumanKategoriHandler {
	return &PengumumanKategoriHandler{service: service}
}

func (h *PengumumanKategoriHandler) FindAll(c *gin.Context) {
	records, err := h.service.FindAll()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(c, "Pengumuman categories retrieved", records)
}

func (h *PengumumanKategoriHandler) Create(c *gin.Context) {
	var req models.CreatePengumumanKategoriRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "format request tidak valid")
		return
	}
	record, err := h.service.Create(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.CreatedResponse(c, "Pengumuman category created", record)
}

func (h *PengumumanKategoriHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid category ID")
		return
	}
	var req models.UpdatePengumumanKategoriRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "format request tidak valid")
		return
	}
	record, err := h.service.Update(id, req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.SuccessResponse(c, "Pengumuman category updated", record)
}

func (h *PengumumanKategoriHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(strings.TrimSpace(c.Param("id")))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid category ID")
		return
	}
	if err := h.service.Delete(id); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.SuccessResponse(c, "Pengumuman category deleted", nil)
}

package handlers

import (
	"net/http"

	"247-golang-api/models"
	"247-golang-api/services"
	"247-golang-api/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AnggotaKeluargaHandler struct {
	svc *services.AnggotaKeluargaService
}

func NewAnggotaKeluargaHandler(svc *services.AnggotaKeluargaService) *AnggotaKeluargaHandler {
	return &AnggotaKeluargaHandler{svc: svc}
}

func (h *AnggotaKeluargaHandler) FindByWargaID(c *gin.Context) {
	wargaID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid warga ID")
		return
	}
	list, err := h.svc.FindByWargaID(wargaID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(c, "Anggota keluarga retrieved", list)
}

func (h *AnggotaKeluargaHandler) Create(c *gin.Context) {
	wargaID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid warga ID")
		return
	}
	var req models.CreateAnggotaKeluargaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	a, err := h.svc.Create(wargaID, req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.CreatedResponse(c, "Anggota keluarga created", a)
}

func (h *AnggotaKeluargaHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID")
		return
	}
	var req models.UpdateAnggotaKeluargaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	a, err := h.svc.Update(id, req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.SuccessResponse(c, "Anggota keluarga updated", a)
}

func (h *AnggotaKeluargaHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID")
		return
	}
	if err := h.svc.Delete(id); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.SuccessResponse(c, "Anggota keluarga deleted", nil)
}

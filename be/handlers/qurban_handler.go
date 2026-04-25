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

type QurbanHandler struct {
	service *services.QurbanService
}

func NewQurbanHandler(service *services.QurbanService) *QurbanHandler {
	return &QurbanHandler{service: service}
}

func (h *QurbanHandler) FindAll(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))
	search := c.DefaultQuery("search", "")
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 1000 {
		limit = 100
	}

	data, total, err := h.service.FindAll(page, limit, search)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	utils.PaginatedResponse(c, "OK", data, page, limit, total)
}

func (h *QurbanHandler) Create(c *gin.Context) {
	var req models.CreateQurbanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	creatorName, _ := c.Get("username")
	creator, _ := creatorName.(string)

	result, err := h.service.Create(req, creator)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.CreatedResponse(c, "Data pengambilan qurban berhasil disimpan", result)
}

func (h *QurbanHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "ID tidak valid")
		return
	}
	if err := h.service.Delete(id); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.SuccessResponse(c, "Data berhasil dihapus", nil)
}

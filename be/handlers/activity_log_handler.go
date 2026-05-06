package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"247-golang-api/models"
	"247-golang-api/services"
	"247-golang-api/utils"

	"github.com/gin-gonic/gin"
)

type ActivityLogHandler struct {
	service *services.ActivityLogService
}

func NewActivityLogHandler(service *services.ActivityLogService) *ActivityLogHandler {
	return &ActivityLogHandler{service: service}
}

func (h *ActivityLogHandler) Create(c *gin.Context) {
	var req models.CreateActivityLogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	ip := c.ClientIP()
	if forwarded := c.GetHeader("X-Forwarded-For"); forwarded != "" {
		ip = strings.Split(forwarded, ",")[0]
	}

	if err := h.service.Create(req, ip); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.CreatedResponse(c, "logged", nil)
}

func (h *ActivityLogHandler) FindAll(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	search := c.DefaultQuery("search", "")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 200 {
		limit = 50
	}

	logs, total, err := h.service.FindAll(page, limit, search)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.PaginatedResponse(c, "Activity logs retrieved", logs, page, limit, total)
}

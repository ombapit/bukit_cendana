package handlers

import (
	"net/http"

	"247-golang-api/models"
	"247-golang-api/services"
	"247-golang-api/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PermissionHandler struct {
	permService *services.PermissionService
}

func NewPermissionHandler(permService *services.PermissionService) *PermissionHandler {
	return &PermissionHandler{permService: permService}
}

// Create godoc
// @Summary     Buat permission baru
// @Description Membuat permission baru. Memerlukan permission permission.create
// @Tags        Permissions
// @Accept      json
// @Produce     json
// @Security    BearerAuth
// @Param       request body     models.CreatePermissionRequest true "Data permission baru"
// @Success     201     {object} utils.APIResponse{data=models.Permission}
// @Failure     400     {object} utils.APIResponse
// @Failure     401     {object} utils.APIResponse
// @Failure     403     {object} utils.APIResponse
// @Failure     422     {object} utils.APIResponse
// @Router      /permissions [post]
func (h *PermissionHandler) Create(c *gin.Context) {
	var req models.CreatePermissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorDetailResponse(c, err)
		return
	}

	perm, err := h.permService.Create(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.CreatedResponse(c, "Permission created successfully", perm)
}

// FindByID godoc
// @Summary     Detail permission
// @Description Mendapatkan detail permission berdasarkan ID. Memerlukan permission permission.view
// @Tags        Permissions
// @Produce     json
// @Security    BearerAuth
// @Param       id  path     string true "Permission ID (UUID)"
// @Success     200 {object} utils.APIResponse{data=models.Permission}
// @Failure     400 {object} utils.APIResponse
// @Failure     401 {object} utils.APIResponse
// @Failure     403 {object} utils.APIResponse
// @Failure     404 {object} utils.APIResponse
// @Router      /permissions/{id} [get]
func (h *PermissionHandler) FindByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid permission ID")
		return
	}

	perm, err := h.permService.FindByID(id)
	if err != nil {
		utils.NotFoundResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, "Permission found", perm)
}

// FindAll godoc
// @Summary     Daftar semua permission
// @Description Mendapatkan daftar semua permission, bisa difilter berdasarkan module. Memerlukan permission permission.view
// @Tags        Permissions
// @Produce     json
// @Security    BearerAuth
// @Param       module query    string false "Filter berdasarkan module (contoh: user, role, menu)"
// @Success     200    {object} utils.APIResponse{data=[]models.Permission}
// @Failure     401    {object} utils.APIResponse
// @Failure     403    {object} utils.APIResponse
// @Failure     500    {object} utils.APIResponse
// @Router      /permissions [get]
func (h *PermissionHandler) FindAll(c *gin.Context) {
	module := c.Query("module")

	if module != "" {
		perms, err := h.permService.FindByModule(module)
		if err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
			return
		}
		utils.SuccessResponse(c, "Permissions retrieved", perms)
		return
	}

	perms, err := h.permService.FindAll()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, "Permissions retrieved", perms)
}

// Update godoc
// @Summary     Update permission
// @Description Mengupdate permission berdasarkan ID. Memerlukan permission permission.update
// @Tags        Permissions
// @Accept      json
// @Produce     json
// @Security    BearerAuth
// @Param       id      path     string                        true "Permission ID (UUID)"
// @Param       request body     models.UpdatePermissionRequest true "Data update permission"
// @Success     200     {object} utils.APIResponse{data=models.Permission}
// @Failure     400     {object} utils.APIResponse
// @Failure     401     {object} utils.APIResponse
// @Failure     403     {object} utils.APIResponse
// @Failure     422     {object} utils.APIResponse
// @Router      /permissions/{id} [put]
func (h *PermissionHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid permission ID")
		return
	}

	var req models.UpdatePermissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorDetailResponse(c, err)
		return
	}

	perm, err := h.permService.Update(id, req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, "Permission updated successfully", perm)
}

// Delete godoc
// @Summary     Hapus permission
// @Description Menghapus permission berdasarkan ID. Memerlukan permission permission.delete
// @Tags        Permissions
// @Produce     json
// @Security    BearerAuth
// @Param       id  path     string true "Permission ID (UUID)"
// @Success     200 {object} utils.APIResponse
// @Failure     400 {object} utils.APIResponse
// @Failure     401 {object} utils.APIResponse
// @Failure     403 {object} utils.APIResponse
// @Router      /permissions/{id} [delete]
func (h *PermissionHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid permission ID")
		return
	}

	if err := h.permService.Delete(id); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, "Permission deleted successfully", nil)
}

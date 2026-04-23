package handlers

import (
	"net/http"

	"247-golang-api/models"
	"247-golang-api/services"
	"247-golang-api/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type RoleHandler struct {
	roleService *services.RoleService
}

func NewRoleHandler(roleService *services.RoleService) *RoleHandler {
	return &RoleHandler{roleService: roleService}
}

// Create godoc
// @Summary     Buat role baru
// @Description Membuat role baru dan assign permission. Memerlukan permission role.create
// @Tags        Roles
// @Accept      json
// @Produce     json
// @Security    BearerAuth
// @Param       request body     models.CreateRoleRequest true "Data role baru"
// @Success     201     {object} utils.APIResponse{data=models.Role}
// @Failure     400     {object} utils.APIResponse
// @Failure     401     {object} utils.APIResponse
// @Failure     403     {object} utils.APIResponse
// @Failure     422     {object} utils.APIResponse
// @Router      /roles [post]
func (h *RoleHandler) Create(c *gin.Context) {
	var req models.CreateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorDetailResponse(c, err)
		return
	}

	role, err := h.roleService.Create(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.CreatedResponse(c, "Role created successfully", role)
}

// FindByID godoc
// @Summary     Detail role
// @Description Mendapatkan detail role beserta permission-nya. Memerlukan permission role.view
// @Tags        Roles
// @Produce     json
// @Security    BearerAuth
// @Param       id  path     string true "Role ID (UUID)"
// @Success     200 {object} utils.APIResponse{data=models.Role}
// @Failure     400 {object} utils.APIResponse
// @Failure     401 {object} utils.APIResponse
// @Failure     403 {object} utils.APIResponse
// @Failure     404 {object} utils.APIResponse
// @Router      /roles/{id} [get]
func (h *RoleHandler) FindByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid role ID")
		return
	}

	role, err := h.roleService.FindByID(id)
	if err != nil {
		utils.NotFoundResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, "Role found", role)
}

// FindAll godoc
// @Summary     Daftar semua role
// @Description Mendapatkan daftar semua role beserta permission-nya. Memerlukan permission role.view
// @Tags        Roles
// @Produce     json
// @Security    BearerAuth
// @Success     200 {object} utils.APIResponse{data=[]models.Role}
// @Failure     401 {object} utils.APIResponse
// @Failure     403 {object} utils.APIResponse
// @Failure     500 {object} utils.APIResponse
// @Router      /roles [get]
func (h *RoleHandler) FindAll(c *gin.Context) {
	roles, err := h.roleService.FindAll()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, "Roles retrieved", roles)
}

// Update godoc
// @Summary     Update role
// @Description Mengupdate role dan assign ulang permission. Memerlukan permission role.update
// @Tags        Roles
// @Accept      json
// @Produce     json
// @Security    BearerAuth
// @Param       id      path     string                  true "Role ID (UUID)"
// @Param       request body     models.UpdateRoleRequest true "Data update role"
// @Success     200     {object} utils.APIResponse{data=models.Role}
// @Failure     400     {object} utils.APIResponse
// @Failure     401     {object} utils.APIResponse
// @Failure     403     {object} utils.APIResponse
// @Failure     422     {object} utils.APIResponse
// @Router      /roles/{id} [put]
func (h *RoleHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid role ID")
		return
	}

	var req models.UpdateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorDetailResponse(c, err)
		return
	}

	role, err := h.roleService.Update(id, req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, "Role updated successfully", role)
}

// Delete godoc
// @Summary     Hapus role
// @Description Menghapus role berdasarkan ID. Memerlukan permission role.delete
// @Tags        Roles
// @Produce     json
// @Security    BearerAuth
// @Param       id  path     string true "Role ID (UUID)"
// @Success     200 {object} utils.APIResponse
// @Failure     400 {object} utils.APIResponse
// @Failure     401 {object} utils.APIResponse
// @Failure     403 {object} utils.APIResponse
// @Router      /roles/{id} [delete]
func (h *RoleHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid role ID")
		return
	}

	if err := h.roleService.Delete(id); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, "Role deleted successfully", nil)
}

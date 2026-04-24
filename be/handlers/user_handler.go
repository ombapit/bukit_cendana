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

type UserHandler struct {
	userService *services.UserService
}

func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// Create godoc
// @Summary     Buat user baru
// @Description Membuat user baru dengan role tertentu. Memerlukan permission user.create
// @Tags        Users
// @Accept      json
// @Produce     json
// @Security    BearerAuth
// @Param       request body     models.CreateUserRequest true "Data user baru"
// @Success     201     {object} utils.APIResponse{data=models.UserResponse}
// @Failure     400     {object} utils.APIResponse
// @Failure     401     {object} utils.APIResponse
// @Failure     403     {object} utils.APIResponse
// @Failure     422     {object} utils.APIResponse
// @Router      /users [post]
func (h *UserHandler) Create(c *gin.Context) {
	var req models.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorDetailResponse(c, err)
		return
	}

	user, err := h.userService.Create(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.CreatedResponse(c, "User created successfully", user)
}

// FindByID godoc
// @Summary     Detail user
// @Description Mendapatkan detail user berdasarkan ID. Memerlukan permission user.view
// @Tags        Users
// @Produce     json
// @Security    BearerAuth
// @Param       id  path     string true "User ID (UUID)"
// @Success     200 {object} utils.APIResponse{data=models.UserResponse}
// @Failure     400 {object} utils.APIResponse
// @Failure     401 {object} utils.APIResponse
// @Failure     403 {object} utils.APIResponse
// @Failure     404 {object} utils.APIResponse
// @Router      /users/{id} [get]
func (h *UserHandler) FindByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	user, err := h.userService.FindByID(id)
	if err != nil {
		utils.NotFoundResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, "User found", user)
}

// FindAll godoc
// @Summary     Daftar semua user
// @Description Mendapatkan daftar user dengan pagination. Memerlukan permission user.view
// @Tags        Users
// @Produce     json
// @Security    BearerAuth
// @Param       page  query    int false "Nomor halaman" default(1)
// @Param       limit query    int false "Jumlah per halaman (max 100)" default(10)
// @Success     200   {object} utils.APIResponse{data=[]models.UserResponse,meta=utils.Meta}
// @Failure     401   {object} utils.APIResponse
// @Failure     403   {object} utils.APIResponse
// @Failure     500   {object} utils.APIResponse
// @Router      /users [get]
func (h *UserHandler) FindAll(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	users, total, err := h.userService.FindAll(page, limit)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.PaginatedResponse(c, "Users retrieved", users, page, limit, total)
}

// Update godoc
// @Summary     Update user
// @Description Mengupdate data user berdasarkan ID. Memerlukan permission user.update
// @Tags        Users
// @Accept      json
// @Produce     json
// @Security    BearerAuth
// @Param       id      path     string                  true "User ID (UUID)"
// @Param       request body     models.UpdateUserRequest true "Data update user"
// @Success     200     {object} utils.APIResponse{data=models.UserResponse}
// @Failure     400     {object} utils.APIResponse
// @Failure     401     {object} utils.APIResponse
// @Failure     403     {object} utils.APIResponse
// @Failure     422     {object} utils.APIResponse
// @Router      /users/{id} [put]
func (h *UserHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	var req models.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorDetailResponse(c, err)
		return
	}

	user, err := h.userService.Update(id, req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, "User updated successfully", user)
}

// Delete godoc
// @Summary     Hapus user
// @Description Menghapus user berdasarkan ID. Memerlukan permission user.delete
// @Tags        Users
// @Produce     json
// @Security    BearerAuth
// @Param       id  path     string true "User ID (UUID)"
// @Success     200 {object} utils.APIResponse
// @Failure     400 {object} utils.APIResponse
// @Failure     401 {object} utils.APIResponse
// @Failure     403 {object} utils.APIResponse
// @Router      /users/{id} [delete]
func (h *UserHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	if err := h.userService.Delete(id); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, "User deleted successfully", nil)
}

// ResetPassword godoc
// @Summary     Reset password user (admin)
// @Tags        Users
// @Accept      json
// @Produce     json
// @Security    BearerAuth
// @Param       id      path     string                          true "User ID"
// @Param       request body     models.AdminResetPasswordRequest true "Password baru"
// @Success     200     {object} utils.APIResponse
// @Router      /users/{id}/password [put]
func (h *UserHandler) ResetPassword(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid user ID")
		return
	}
	var req models.AdminResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorDetailResponse(c, err)
		return
	}
	if err := h.userService.ResetPassword(id, req.NewPassword); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.SuccessResponse(c, "Password reset successfully", nil)
}

// ChangePassword godoc
// @Summary     Ganti password
// @Description Mengganti password user yang sedang login
// @Tags        Auth
// @Accept      json
// @Produce     json
// @Security    BearerAuth
// @Param       request body     models.ChangePasswordRequest true "Password lama dan baru"
// @Success     200     {object} utils.APIResponse
// @Failure     400     {object} utils.APIResponse
// @Failure     401     {object} utils.APIResponse
// @Failure     422     {object} utils.APIResponse
// @Router      /auth/change-password [put]
func (h *UserHandler) ChangePassword(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorDetailResponse(c, err)
		return
	}

	if err := h.userService.ChangePassword(userID, req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, "Password changed successfully", nil)
}

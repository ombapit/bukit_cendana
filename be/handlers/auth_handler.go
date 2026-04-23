package handlers

import (
	"net/http"

	"247-golang-api/models"
	"247-golang-api/services"
	"247-golang-api/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// Login godoc
// @Summary     Login user
// @Description Autentikasi user dengan username dan password, mengembalikan access token dan refresh token
// @Tags        Auth
// @Accept      json
// @Produce     json
// @Param       request body     models.LoginRequest true "Login credentials"
// @Success     200     {object} utils.APIResponse{data=models.LoginResponse}
// @Failure     401     {object} utils.APIResponse
// @Failure     422     {object} utils.APIResponse
// @Router      /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorDetailResponse(c, err)
		return
	}

	resp, err := h.authService.Login(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, err.Error())
		return
	}

	utils.SuccessResponse(c, "Login successful", resp)
}

// RefreshToken godoc
// @Summary     Refresh access token
// @Description Mendapatkan access token baru menggunakan refresh token
// @Tags        Auth
// @Accept      json
// @Produce     json
// @Param       request body     models.RefreshTokenRequest true "Refresh token"
// @Success     200     {object} utils.APIResponse{data=models.LoginResponse}
// @Failure     401     {object} utils.APIResponse
// @Failure     422     {object} utils.APIResponse
// @Router      /auth/refresh [post]
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req models.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorDetailResponse(c, err)
		return
	}

	resp, err := h.authService.RefreshToken(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, err.Error())
		return
	}

	utils.SuccessResponse(c, "Token refreshed successfully", resp)
}

// Logout godoc
// @Summary     Logout user
// @Description Menghapus refresh token dan cache permission dari Redis
// @Tags        Auth
// @Produce     json
// @Security    BearerAuth
// @Success     200 {object} utils.APIResponse
// @Failure     401 {object} utils.APIResponse
// @Failure     500 {object} utils.APIResponse
// @Router      /auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	if err := h.authService.Logout(userID); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to logout")
		return
	}

	utils.SuccessResponse(c, "Logged out successfully", nil)
}

// Me godoc
// @Summary     Info user saat ini
// @Description Mendapatkan informasi user yang sedang login dari JWT token
// @Tags        Auth
// @Produce     json
// @Security    BearerAuth
// @Success     200 {object} utils.APIResponse{data=handlers.MeResponse}
// @Failure     401 {object} utils.APIResponse
// @Router      /auth/me [get]
func (h *AuthHandler) Me(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	username := c.MustGet("username").(string)
	roleName := c.MustGet("role_name").(string)

	utils.SuccessResponse(c, "Current user info", gin.H{
		"user_id":   userID,
		"username":  username,
		"role_name": roleName,
	})
}

// MeResponse is the swagger model for /auth/me response
type MeResponse struct {
	UserID   string `json:"user_id" example:"20000000-0000-0000-0000-000000000001"`
	Username string `json:"username" example:"admin"`
	RoleName string `json:"role_name" example:"admin"`
}

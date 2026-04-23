package handlers

import (
	"net/http"

	"247-golang-api/models"
	"247-golang-api/services"
	"247-golang-api/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type MenuHandler struct {
	menuService *services.MenuService
	authService *services.AuthService
}

func NewMenuHandler(menuService *services.MenuService, authService *services.AuthService) *MenuHandler {
	return &MenuHandler{
		menuService: menuService,
		authService: authService,
	}
}

// Create godoc
// @Summary     Buat menu baru
// @Description Membuat menu baru (bisa sebagai root atau sub-menu). Memerlukan permission menu.create
// @Tags        Menus
// @Accept      json
// @Produce     json
// @Security    BearerAuth
// @Param       request body     models.CreateMenuRequest true "Data menu baru"
// @Success     201     {object} utils.APIResponse{data=models.Menu}
// @Failure     400     {object} utils.APIResponse
// @Failure     401     {object} utils.APIResponse
// @Failure     403     {object} utils.APIResponse
// @Failure     422     {object} utils.APIResponse
// @Router      /menus [post]
func (h *MenuHandler) Create(c *gin.Context) {
	var req models.CreateMenuRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorDetailResponse(c, err)
		return
	}

	menu, err := h.menuService.Create(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.CreatedResponse(c, "Menu created successfully", menu)
}

// FindByID godoc
// @Summary     Detail menu
// @Description Mendapatkan detail menu beserta children-nya. Memerlukan permission menu.view
// @Tags        Menus
// @Produce     json
// @Security    BearerAuth
// @Param       id  path     string true "Menu ID (UUID)"
// @Success     200 {object} utils.APIResponse{data=models.Menu}
// @Failure     400 {object} utils.APIResponse
// @Failure     401 {object} utils.APIResponse
// @Failure     403 {object} utils.APIResponse
// @Failure     404 {object} utils.APIResponse
// @Router      /menus/{id} [get]
func (h *MenuHandler) FindByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid menu ID")
		return
	}

	menu, err := h.menuService.FindByID(id)
	if err != nil {
		utils.NotFoundResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, "Menu found", menu)
}

// FindAll godoc
// @Summary     Daftar semua menu (flat)
// @Description Mendapatkan daftar semua menu tanpa hierarki (flat list). Memerlukan permission menu.view
// @Tags        Menus
// @Produce     json
// @Security    BearerAuth
// @Success     200 {object} utils.APIResponse{data=[]models.Menu}
// @Failure     401 {object} utils.APIResponse
// @Failure     403 {object} utils.APIResponse
// @Failure     500 {object} utils.APIResponse
// @Router      /menus [get]
func (h *MenuHandler) FindAll(c *gin.Context) {
	menus, err := h.menuService.FindAll()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, "Menus retrieved", menus)
}

// GetMenuTree godoc
// @Summary     Full menu tree
// @Description Mendapatkan semua menu dalam format hierarki (tree). Memerlukan permission menu.view
// @Tags        Menus
// @Produce     json
// @Security    BearerAuth
// @Success     200 {object} utils.APIResponse{data=[]models.Menu}
// @Failure     401 {object} utils.APIResponse
// @Failure     403 {object} utils.APIResponse
// @Failure     500 {object} utils.APIResponse
// @Router      /menus/tree [get]
func (h *MenuHandler) GetMenuTree(c *gin.Context) {
	menus, err := h.menuService.GetMenuTree()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, "Menu tree retrieved", menus)
}

// GetMyMenus godoc
// @Summary     Menu saya (Dynamic RBAC)
// @Description Mendapatkan menu tree yang difilter berdasarkan permission user yang sedang login. Superadmin mendapatkan semua menu.
// @Tags        Menus
// @Produce     json
// @Security    BearerAuth
// @Success     200 {object} utils.APIResponse{data=[]models.Menu}
// @Failure     401 {object} utils.APIResponse
// @Failure     500 {object} utils.APIResponse
// @Router      /menus/my [get]
func (h *MenuHandler) GetMyMenus(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	roleName, _ := c.Get("role_name")

	// Superadmin gets all menus
	if roleName == "superadmin" {
		menus, err := h.menuService.GetMenuTree()
		if err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
			return
		}
		utils.SuccessResponse(c, "Menu tree retrieved", menus)
		return
	}

	// Get user permissions then filter menus
	permCodes, err := h.authService.GetUserPermissions(userID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to get permissions")
		return
	}

	menus, err := h.menuService.GetMenuTreeByPermissions(permCodes)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, "Menu tree retrieved", menus)
}

// Update godoc
// @Summary     Update menu
// @Description Mengupdate menu berdasarkan ID. Memerlukan permission menu.update
// @Tags        Menus
// @Accept      json
// @Produce     json
// @Security    BearerAuth
// @Param       id      path     string                  true "Menu ID (UUID)"
// @Param       request body     models.UpdateMenuRequest true "Data update menu"
// @Success     200     {object} utils.APIResponse{data=models.Menu}
// @Failure     400     {object} utils.APIResponse
// @Failure     401     {object} utils.APIResponse
// @Failure     403     {object} utils.APIResponse
// @Failure     422     {object} utils.APIResponse
// @Router      /menus/{id} [put]
func (h *MenuHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid menu ID")
		return
	}

	var req models.UpdateMenuRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorDetailResponse(c, err)
		return
	}

	menu, err := h.menuService.Update(id, req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, "Menu updated successfully", menu)
}

// Delete godoc
// @Summary     Hapus menu
// @Description Menghapus menu berdasarkan ID. Memerlukan permission menu.delete
// @Tags        Menus
// @Produce     json
// @Security    BearerAuth
// @Param       id  path     string true "Menu ID (UUID)"
// @Success     200 {object} utils.APIResponse
// @Failure     400 {object} utils.APIResponse
// @Failure     401 {object} utils.APIResponse
// @Failure     403 {object} utils.APIResponse
// @Router      /menus/{id} [delete]
func (h *MenuHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid menu ID")
		return
	}

	if err := h.menuService.Delete(id); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, "Menu deleted successfully", nil)
}

package services

import (
	"errors"

	"247-golang-api/models"
	"247-golang-api/repositories"

	"github.com/google/uuid"
)

type MenuService struct {
	menuRepo *repositories.MenuRepository
}

func NewMenuService(menuRepo *repositories.MenuRepository) *MenuService {
	return &MenuService{menuRepo: menuRepo}
}

func (s *MenuService) Create(req models.CreateMenuRequest) (*models.Menu, error) {
	menu := &models.Menu{
		Name:         req.Name,
		Path:         req.Path,
		Icon:         req.Icon,
		ParentID:     req.ParentID,
		SortOrder:    req.SortOrder,
		IsActive:     true,
		PermissionID: req.PermissionID,
	}

	if err := s.menuRepo.Create(menu); err != nil {
		return nil, errors.New("failed to create menu")
	}

	return s.menuRepo.FindByID(menu.ID)
}

func (s *MenuService) FindByID(id uuid.UUID) (*models.Menu, error) {
	menu, err := s.menuRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("menu not found")
	}
	return menu, nil
}

func (s *MenuService) FindAll() ([]models.Menu, error) {
	return s.menuRepo.FindAll()
}

func (s *MenuService) GetMenuTree() ([]models.Menu, error) {
	return s.menuRepo.FindRootMenus()
}

func (s *MenuService) GetMenuTreeByPermissions(permissionCodes []string) ([]models.Menu, error) {
	if len(permissionCodes) == 0 {
		return []models.Menu{}, nil
	}
	return s.menuRepo.FindMenusByPermissionCodes(permissionCodes)
}

func (s *MenuService) Update(id uuid.UUID, req models.UpdateMenuRequest) (*models.Menu, error) {
	menu, err := s.menuRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("menu not found")
	}

	if req.Name != "" {
		menu.Name = req.Name
	}
	if req.Path != "" {
		menu.Path = req.Path
	}
	if req.Icon != "" {
		menu.Icon = req.Icon
	}
	if req.ParentID != nil {
		menu.ParentID = req.ParentID
	}
	if req.SortOrder != nil {
		menu.SortOrder = *req.SortOrder
	}
	if req.IsActive != nil {
		menu.IsActive = *req.IsActive
	}
	if req.PermissionID != nil {
		menu.PermissionID = req.PermissionID
	}

	if err := s.menuRepo.Update(menu); err != nil {
		return nil, errors.New("failed to update menu")
	}

	return s.menuRepo.FindByID(id)
}

func (s *MenuService) Delete(id uuid.UUID) error {
	_, err := s.menuRepo.FindByID(id)
	if err != nil {
		return errors.New("menu not found")
	}
	return s.menuRepo.Delete(id)
}

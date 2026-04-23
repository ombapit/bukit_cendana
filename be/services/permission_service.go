package services

import (
	"errors"

	"247-golang-api/models"
	"247-golang-api/repositories"

	"github.com/google/uuid"
)

type PermissionService struct {
	permRepo *repositories.PermissionRepository
}

func NewPermissionService(permRepo *repositories.PermissionRepository) *PermissionService {
	return &PermissionService{permRepo: permRepo}
}

func (s *PermissionService) Create(req models.CreatePermissionRequest) (*models.Permission, error) {
	perm := &models.Permission{
		Name:        req.Name,
		Code:        req.Code,
		Module:      req.Module,
		Description: req.Description,
	}

	if err := s.permRepo.Create(perm); err != nil {
		return nil, errors.New("failed to create permission, code may already exist")
	}

	return perm, nil
}

func (s *PermissionService) FindByID(id uuid.UUID) (*models.Permission, error) {
	perm, err := s.permRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("permission not found")
	}
	return perm, nil
}

func (s *PermissionService) FindAll() ([]models.Permission, error) {
	return s.permRepo.FindAll()
}

func (s *PermissionService) FindByModule(module string) ([]models.Permission, error) {
	return s.permRepo.FindByModule(module)
}

func (s *PermissionService) Update(id uuid.UUID, req models.UpdatePermissionRequest) (*models.Permission, error) {
	perm, err := s.permRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("permission not found")
	}

	if req.Name != "" {
		perm.Name = req.Name
	}
	if req.Code != "" {
		perm.Code = req.Code
	}
	if req.Module != "" {
		perm.Module = req.Module
	}
	if req.Description != "" {
		perm.Description = req.Description
	}

	if err := s.permRepo.Update(perm); err != nil {
		return nil, errors.New("failed to update permission")
	}

	return perm, nil
}

func (s *PermissionService) Delete(id uuid.UUID) error {
	_, err := s.permRepo.FindByID(id)
	if err != nil {
		return errors.New("permission not found")
	}
	return s.permRepo.Delete(id)
}

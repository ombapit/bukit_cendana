package services

import (
	"errors"

	"247-golang-api/models"
	"247-golang-api/repositories"

	"github.com/google/uuid"
)

type RoleService struct {
	roleRepo *repositories.RoleRepository
}

func NewRoleService(roleRepo *repositories.RoleRepository) *RoleService {
	return &RoleService{roleRepo: roleRepo}
}

func (s *RoleService) Create(req models.CreateRoleRequest) (*models.Role, error) {
	role := &models.Role{
		Name:        req.Name,
		Description: req.Description,
		IsActive:    true,
	}

	if err := s.roleRepo.Create(role); err != nil {
		return nil, errors.New("failed to create role, name may already exist")
	}

	if len(req.PermissionIDs) > 0 {
		if err := s.roleRepo.AssignPermissions(role.ID, req.PermissionIDs); err != nil {
			return nil, errors.New("failed to assign permissions")
		}
	}

	return s.roleRepo.FindByID(role.ID)
}

func (s *RoleService) FindByID(id uuid.UUID) (*models.Role, error) {
	role, err := s.roleRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("role not found")
	}
	return role, nil
}

func (s *RoleService) FindAll() ([]models.Role, error) {
	return s.roleRepo.FindAll()
}

func (s *RoleService) Update(id uuid.UUID, req models.UpdateRoleRequest) (*models.Role, error) {
	role, err := s.roleRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("role not found")
	}

	if req.Name != "" {
		role.Name = req.Name
	}
	if req.Description != "" {
		role.Description = req.Description
	}
	if req.IsActive != nil {
		role.IsActive = *req.IsActive
	}

	if err := s.roleRepo.Update(role); err != nil {
		return nil, errors.New("failed to update role")
	}

	if req.PermissionIDs != nil {
		if err := s.roleRepo.AssignPermissions(id, req.PermissionIDs); err != nil {
			return nil, errors.New("failed to update permissions")
		}
	}

	return s.roleRepo.FindByID(id)
}

func (s *RoleService) Delete(id uuid.UUID) error {
	_, err := s.roleRepo.FindByID(id)
	if err != nil {
		return errors.New("role not found")
	}
	return s.roleRepo.Delete(id)
}

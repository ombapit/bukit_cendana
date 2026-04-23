package services

import (
	"errors"

	"247-golang-api/models"
	"247-golang-api/repositories"
	"247-golang-api/utils"

	"github.com/google/uuid"
)

type UserService struct {
	userRepo *repositories.UserRepository
}

func NewUserService(userRepo *repositories.UserRepository) *UserService {
	return &UserService{userRepo: userRepo}
}

func (s *UserService) Create(req models.CreateUserRequest) (*models.UserResponse, error) {
	salt, err := utils.GenerateSalt()
	if err != nil {
		return nil, errors.New("failed to generate salt")
	}

	hashedPassword, err := utils.HashPassword(req.Password, salt)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	user := &models.User{
		Username: req.Username,
		Email:    req.Email,
		Password: hashedPassword,
		Salt:     salt,
		FullName: req.FullName,
		RoleID:   req.RoleID,
		IsActive: true,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, errors.New("failed to create user, username or email may already exist")
	}

	created, err := s.userRepo.FindByID(user.ID)
	if err != nil {
		return nil, err
	}

	resp := created.ToResponse()
	return &resp, nil
}

func (s *UserService) FindByID(id uuid.UUID) (*models.UserResponse, error) {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("user not found")
	}
	resp := user.ToResponse()
	return &resp, nil
}

func (s *UserService) FindAll(page, limit int) ([]models.UserResponse, int64, error) {
	users, total, err := s.userRepo.FindAll(page, limit)
	if err != nil {
		return nil, 0, err
	}

	var responses []models.UserResponse
	for _, u := range users {
		responses = append(responses, u.ToResponse())
	}

	return responses, total, nil
}

func (s *UserService) Update(id uuid.UUID, req models.UpdateUserRequest) (*models.UserResponse, error) {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("user not found")
	}

	if req.Email != "" {
		user.Email = req.Email
	}
	if req.FullName != "" {
		user.FullName = req.FullName
	}
	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}
	if req.RoleID != uuid.Nil {
		user.RoleID = req.RoleID
	}

	if err := s.userRepo.Update(user); err != nil {
		return nil, errors.New("failed to update user")
	}

	updated, _ := s.userRepo.FindByID(id)
	resp := updated.ToResponse()
	return &resp, nil
}

func (s *UserService) Delete(id uuid.UUID) error {
	_, err := s.userRepo.FindByID(id)
	if err != nil {
		return errors.New("user not found")
	}
	return s.userRepo.Delete(id)
}

func (s *UserService) ChangePassword(id uuid.UUID, req models.ChangePasswordRequest) error {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		return errors.New("user not found")
	}

	if !utils.CheckPassword(req.OldPassword, user.Salt, user.Password) {
		return errors.New("old password is incorrect")
	}

	salt, err := utils.GenerateSalt()
	if err != nil {
		return errors.New("failed to generate salt")
	}

	hashedPassword, err := utils.HashPassword(req.NewPassword, salt)
	if err != nil {
		return errors.New("failed to hash password")
	}

	user.Password = hashedPassword
	user.Salt = salt
	return s.userRepo.Update(user)
}

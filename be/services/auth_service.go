package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"247-golang-api/config"
	"247-golang-api/models"
	"247-golang-api/repositories"
	"247-golang-api/utils"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type AuthService struct {
	userRepo *repositories.UserRepository
	redis    *redis.Client
	cfg      *config.Config
}

func NewAuthService(userRepo *repositories.UserRepository, redis *redis.Client, cfg *config.Config) *AuthService {
	return &AuthService{
		userRepo: userRepo,
		redis:    redis,
		cfg:      cfg,
	}
}

func (s *AuthService) Login(req models.LoginRequest) (*models.LoginResponse, error) {
	user, err := s.userRepo.FindByUsername(req.Username)
	if err != nil {
		return nil, errors.New("invalid username or password")
	}

	if !user.IsActive {
		return nil, errors.New("account is deactivated")
	}

	if !utils.CheckPassword(req.Password, user.Salt, user.Password) {
		return nil, errors.New("invalid username or password")
	}

	roleName := ""
	if user.Role != nil {
		roleName = user.Role.Name
	}

	accessToken, err := utils.GenerateAccessToken(user.ID, user.Username, user.RoleID, roleName, s.cfg.JWT.Secret, s.cfg.JWT.ExpiryHours)
	if err != nil {
		return nil, errors.New("failed to generate access token")
	}

	refreshToken, err := utils.GenerateRefreshToken(user.ID, s.cfg.JWT.Secret, s.cfg.JWT.RefreshExpiryHours)
	if err != nil {
		return nil, errors.New("failed to generate refresh token")
	}

	// Store refresh token in Redis
	ctx := context.Background()
	refreshKey := fmt.Sprintf("refresh_token:%s", user.ID.String())
	s.redis.Set(ctx, refreshKey, refreshToken, time.Duration(s.cfg.JWT.RefreshExpiryHours)*time.Hour)

	// Cache user permissions in Redis
	s.cacheUserPermissions(user)

	// Update last login
	_ = s.userRepo.UpdateLastLogin(user.ID)

	return &models.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    s.cfg.JWT.ExpiryHours * 3600,
		TokenType:    "Bearer",
		User:         user.ToResponse(),
	}, nil
}

func (s *AuthService) RefreshToken(req models.RefreshTokenRequest) (*models.LoginResponse, error) {
	userID, err := utils.ValidateRefreshToken(req.RefreshToken, s.cfg.JWT.Secret)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	// Verify refresh token exists in Redis
	ctx := context.Background()
	refreshKey := fmt.Sprintf("refresh_token:%s", userID.String())
	storedToken, err := s.redis.Get(ctx, refreshKey).Result()
	if err != nil || storedToken != req.RefreshToken {
		return nil, errors.New("refresh token expired or revoked")
	}

	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	if !user.IsActive {
		return nil, errors.New("account is deactivated")
	}

	roleName := ""
	if user.Role != nil {
		roleName = user.Role.Name
	}

	accessToken, err := utils.GenerateAccessToken(user.ID, user.Username, user.RoleID, roleName, s.cfg.JWT.Secret, s.cfg.JWT.ExpiryHours)
	if err != nil {
		return nil, errors.New("failed to generate access token")
	}

	newRefreshToken, err := utils.GenerateRefreshToken(user.ID, s.cfg.JWT.Secret, s.cfg.JWT.RefreshExpiryHours)
	if err != nil {
		return nil, errors.New("failed to generate refresh token")
	}

	// Replace refresh token in Redis
	s.redis.Set(ctx, refreshKey, newRefreshToken, time.Duration(s.cfg.JWT.RefreshExpiryHours)*time.Hour)

	return &models.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
		ExpiresIn:    s.cfg.JWT.ExpiryHours * 3600,
		TokenType:    "Bearer",
		User:         user.ToResponse(),
	}, nil
}

func (s *AuthService) Logout(userID uuid.UUID) error {
	ctx := context.Background()
	refreshKey := fmt.Sprintf("refresh_token:%s", userID.String())
	permKey := fmt.Sprintf("user_permissions:%s", userID.String())

	s.redis.Del(ctx, refreshKey, permKey)
	return nil
}

func (s *AuthService) GetUserPermissions(userID uuid.UUID) ([]string, error) {
	ctx := context.Background()
	permKey := fmt.Sprintf("user_permissions:%s", userID.String())

	// Try cache first
	cached, err := s.redis.Get(ctx, permKey).Result()
	if err == nil {
		var perms []string
		if json.Unmarshal([]byte(cached), &perms) == nil {
			return perms, nil
		}
	}

	// Fetch from DB
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, err
	}

	s.cacheUserPermissions(user)

	var codes []string
	if user.Role != nil {
		for _, p := range user.Role.Permissions {
			codes = append(codes, p.Code)
		}
	}
	return codes, nil
}

func (s *AuthService) cacheUserPermissions(user *models.User) {
	if user.Role == nil {
		return
	}

	var codes []string
	for _, p := range user.Role.Permissions {
		codes = append(codes, p.Code)
	}

	data, _ := json.Marshal(codes)
	ctx := context.Background()
	permKey := fmt.Sprintf("user_permissions:%s", user.ID.String())
	s.redis.Set(ctx, permKey, string(data), time.Duration(s.cfg.JWT.ExpiryHours)*time.Hour)
}

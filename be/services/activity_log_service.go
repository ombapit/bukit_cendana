package services

import (
	"247-golang-api/models"
	"247-golang-api/repositories"
)

type ActivityLogService struct {
	repo *repositories.ActivityLogRepository
}

func NewActivityLogService(repo *repositories.ActivityLogRepository) *ActivityLogService {
	return &ActivityLogService{repo: repo}
}

func (s *ActivityLogService) Create(req models.CreateActivityLogRequest, ip string) error {
	log := &models.ActivityLog{
		Path:      req.Path,
		IP:        ip,
		UserAgent: req.UserAgent,
		Referer:   req.Referer,
	}
	return s.repo.Create(log)
}

func (s *ActivityLogService) FindAll(page, limit int, search string) ([]models.ActivityLogResponse, int64, error) {
	logs, total, err := s.repo.FindAll(page, limit, search)
	if err != nil {
		return nil, 0, err
	}
	results := make([]models.ActivityLogResponse, len(logs))
	for i, l := range logs {
		results[i] = l.ToResponse()
	}
	return results, total, nil
}

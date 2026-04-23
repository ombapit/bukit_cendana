package middleware

import (
	"247-golang-api/services"
	"247-golang-api/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func RBACMiddleware(authService *services.AuthService, requiredPermissions ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDVal, exists := c.Get("user_id")
		if !exists {
			utils.UnauthorizedResponse(c, "User not authenticated")
			c.Abort()
			return
		}

		userID := userIDVal.(uuid.UUID)

		// Super admin bypass
		roleName, _ := c.Get("role_name")
		if roleName == "superadmin" {
			c.Next()
			return
		}

		// Get user permissions from cache/db
		userPerms, err := authService.GetUserPermissions(userID)
		if err != nil {
			utils.ForbiddenResponse(c, "Failed to verify permissions")
			c.Abort()
			return
		}

		// Check if user has at least one of the required permissions
		permMap := make(map[string]bool)
		for _, p := range userPerms {
			permMap[p] = true
		}

		hasPermission := false
		for _, required := range requiredPermissions {
			if permMap[required] {
				hasPermission = true
				break
			}
		}

		if !hasPermission {
			utils.ForbiddenResponse(c, "You don't have permission to access this resource")
			c.Abort()
			return
		}

		c.Next()
	}
}

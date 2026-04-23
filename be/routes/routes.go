package routes

import (
	"247-golang-api/config"
	"247-golang-api/handlers"
	"247-golang-api/middleware"
	"247-golang-api/services"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func Setup(
	r *gin.Engine,
	cfg *config.Config,
	authHandler *handlers.AuthHandler,
	userHandler *handlers.UserHandler,
	roleHandler *handlers.RoleHandler,
	permHandler *handlers.PermissionHandler,
	menuHandler *handlers.MenuHandler,
	authService *services.AuthService,
) {
	// Swagger
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "247-golang-api"})
	})

	api := r.Group("/api/v1")

	// === Public routes ===
	auth := api.Group("/auth")
	{
		auth.POST("/login", authHandler.Login)
		auth.POST("/refresh", authHandler.RefreshToken)
	}

	// === Protected routes ===
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(cfg))
	{
		// Auth
		protected.POST("/auth/logout", authHandler.Logout)
		protected.GET("/auth/me", authHandler.Me)

		// Change own password
		protected.PUT("/auth/change-password", userHandler.ChangePassword)

		// My menus (dynamic RBAC filtered)
		protected.GET("/menus/my", menuHandler.GetMyMenus)

		// === Users (requires user permissions) ===
		users := protected.Group("/users")
		{
			users.GET("", middleware.RBACMiddleware(authService, "user.view"), userHandler.FindAll)
			users.GET("/:id", middleware.RBACMiddleware(authService, "user.view"), userHandler.FindByID)
			users.POST("", middleware.RBACMiddleware(authService, "user.create"), userHandler.Create)
			users.PUT("/:id", middleware.RBACMiddleware(authService, "user.update"), userHandler.Update)
			users.DELETE("/:id", middleware.RBACMiddleware(authService, "user.delete"), userHandler.Delete)
		}

		// === Roles (requires role permissions) ===
		roles := protected.Group("/roles")
		{
			roles.GET("", middleware.RBACMiddleware(authService, "role.view"), roleHandler.FindAll)
			roles.GET("/:id", middleware.RBACMiddleware(authService, "role.view"), roleHandler.FindByID)
			roles.POST("", middleware.RBACMiddleware(authService, "role.create"), roleHandler.Create)
			roles.PUT("/:id", middleware.RBACMiddleware(authService, "role.update"), roleHandler.Update)
			roles.DELETE("/:id", middleware.RBACMiddleware(authService, "role.delete"), roleHandler.Delete)
		}

		// === Permissions (requires permission permissions) ===
		permissions := protected.Group("/permissions")
		{
			permissions.GET("", middleware.RBACMiddleware(authService, "permission.view"), permHandler.FindAll)
			permissions.GET("/:id", middleware.RBACMiddleware(authService, "permission.view"), permHandler.FindByID)
			permissions.POST("", middleware.RBACMiddleware(authService, "permission.create"), permHandler.Create)
			permissions.PUT("/:id", middleware.RBACMiddleware(authService, "permission.update"), permHandler.Update)
			permissions.DELETE("/:id", middleware.RBACMiddleware(authService, "permission.delete"), permHandler.Delete)
		}

		// === Menus (requires menu permissions) ===
		menus := protected.Group("/menus")
		{
			menus.GET("", middleware.RBACMiddleware(authService, "menu.view"), menuHandler.FindAll)
			menus.GET("/tree", middleware.RBACMiddleware(authService, "menu.view"), menuHandler.GetMenuTree)
			menus.GET("/:id", middleware.RBACMiddleware(authService, "menu.view"), menuHandler.FindByID)
			menus.POST("", middleware.RBACMiddleware(authService, "menu.create"), menuHandler.Create)
			menus.PUT("/:id", middleware.RBACMiddleware(authService, "menu.update"), menuHandler.Update)
			menus.DELETE("/:id", middleware.RBACMiddleware(authService, "menu.delete"), menuHandler.Delete)
		}
	}
}

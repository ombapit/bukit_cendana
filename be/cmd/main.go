package main

import (
	"fmt"
	"log"

	"247-golang-api/config"
	"247-golang-api/database"
	_ "247-golang-api/docs"
	"247-golang-api/handlers"
	"247-golang-api/models"
	"247-golang-api/repositories"
	"247-golang-api/routes"
	"247-golang-api/services"

	"github.com/gin-gonic/gin"
)

// @title           247 Golang API
// @version         1.0
// @description     REST API dengan autentikasi lengkap, Dynamic RBAC, dan sistem menu hierarki.

// @host            localhost:8080
// @BasePath        /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Masukkan token dengan format: Bearer {access_token}

func main() {
	// Load config
	cfg := config.Load()

	// Connect databases
	db := database.ConnectPostgres(cfg.DB)
	rdb := database.ConnectRedis(cfg.Redis)

	// Auto migrate (buat/update struktur tabel)
	if err := db.AutoMigrate(
		&models.User{},
		&models.Role{},
		&models.Permission{},
		&models.Menu{},
		&models.Warga{},
		&models.Transaksi{},
	); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	log.Println("Database schema migrated successfully")

	// Jalankan file SQL migrasi (seed data, dll)
	if err := database.RunMigrations(db, "migrations"); err != nil {
		log.Fatalf("Failed to run SQL migrations: %v", err)
	}

	// Initialize repositories
	userRepo := repositories.NewUserRepository(db)
	roleRepo := repositories.NewRoleRepository(db)
	permRepo := repositories.NewPermissionRepository(db)
	menuRepo := repositories.NewMenuRepository(db)
	wargaRepo := repositories.NewWargaRepository(db)
	transaksiRepo := repositories.NewTransaksiRepository(db)

	// Initialize services
	authService := services.NewAuthService(userRepo, rdb, cfg)
	userService := services.NewUserService(userRepo)
	roleService := services.NewRoleService(roleRepo)
	permService := services.NewPermissionService(permRepo)
	menuService := services.NewMenuService(menuRepo)
	wargaService := services.NewWargaService(wargaRepo)
	transaksiService := services.NewTransaksiService(transaksiRepo)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	userHandler := handlers.NewUserHandler(userService)
	roleHandler := handlers.NewRoleHandler(roleService)
	permHandler := handlers.NewPermissionHandler(permService)
	menuHandler := handlers.NewMenuHandler(menuService, authService)
	wargaHandler := handlers.NewWargaHandler(wargaService)
	transaksiHandler := handlers.NewTransaksiHandler(transaksiService)

	// Setup Gin
	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Setup routes
	routes.Setup(r, cfg, authHandler, userHandler, roleHandler, permHandler, menuHandler, wargaHandler, transaksiHandler, authService)

	// Start server
	addr := fmt.Sprintf(":%s", cfg.AppPort)
	log.Printf("Server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

package database

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"gorm.io/gorm"
)

type SchemaMigration struct {
	ID        uint      `gorm:"primaryKey"`
	Version   string    `gorm:"type:varchar(255);uniqueIndex;not null"`
	AppliedAt time.Time `gorm:"autoCreateTime"`
}

// RunMigrations membaca semua file *.up.sql di folder migrations/,
// mengecek mana yang belum dijalankan via tabel schema_migrations,
// lalu menjalankannya secara berurutan.
func RunMigrations(db *gorm.DB, migrationsPath string) error {
	// Buat tabel tracking migrasi jika belum ada
	if err := db.AutoMigrate(&SchemaMigration{}); err != nil {
		return fmt.Errorf("gagal membuat tabel schema_migrations: %w", err)
	}

	// Ambil daftar migrasi yang sudah dijalankan
	var applied []SchemaMigration
	db.Find(&applied)
	appliedMap := make(map[string]bool)
	for _, m := range applied {
		appliedMap[m.Version] = true
	}

	// Cari semua file *.up.sql
	files, err := filepath.Glob(filepath.Join(migrationsPath, "*.up.sql"))
	if err != nil {
		return fmt.Errorf("gagal membaca folder migrations: %w", err)
	}

	sort.Strings(files)

	newMigrations := 0
	for _, file := range files {
		version := strings.TrimSuffix(filepath.Base(file), ".up.sql")

		if appliedMap[version] {
			continue
		}

		sqlBytes, err := os.ReadFile(file)
		if err != nil {
			return fmt.Errorf("gagal membaca file %s: %w", file, err)
		}

		sql := string(sqlBytes)
		if strings.TrimSpace(sql) == "" {
			continue
		}

		log.Printf("[MIGRATE] Menjalankan: %s", version)

		if err := db.Exec(sql).Error; err != nil {
			return fmt.Errorf("gagal menjalankan migrasi %s: %w", version, err)
		}

		// Catat migrasi yang berhasil
		db.Create(&SchemaMigration{Version: version})
		newMigrations++
		log.Printf("[MIGRATE] Berhasil: %s", version)
	}

	if newMigrations == 0 {
		log.Println("[MIGRATE] Tidak ada migrasi baru")
	} else {
		log.Printf("[MIGRATE] %d migrasi berhasil dijalankan", newMigrations)
	}

	return nil
}

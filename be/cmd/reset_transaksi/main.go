package main

import (
	"fmt"
	"log"

	"247-golang-api/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func main() {
	cfg := config.Load()

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=%s",
		cfg.DB.Host, cfg.DB.User, cfg.DB.Password, cfg.DB.Name, cfg.DB.Port, cfg.DB.SSLMode, cfg.DB.Timezone,
	)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		log.Fatalf("Gagal connect DB: %v", err)
	}

	// Cek isi schema_migrations untuk transaksi
	var rows []string
	db.Raw(`SELECT version FROM schema_migrations WHERE version LIKE '%transaksi%' OR version LIKE '%007%' OR version LIKE '%009%' OR version LIKE '%011%' ORDER BY version`).Scan(&rows)
	log.Printf("schema_migrations saat ini: %v", rows)

	log.Println("Dropping tabel transaksi...")
	if err := db.Exec("DROP TABLE IF EXISTS transaksi CASCADE").Error; err != nil {
		log.Fatalf("Gagal drop transaksi: %v", err)
	}
	log.Println("Tabel transaksi berhasil di-drop.")

	log.Println("Menghapus semua entry transaksi dari schema_migrations...")
	result := db.Exec(`DELETE FROM schema_migrations WHERE version LIKE '%transaksi%'`)
	if result.Error != nil {
		log.Fatalf("Gagal hapus schema_migrations: %v", result.Error)
	}
	log.Printf("Dihapus %d baris dari schema_migrations.", result.RowsAffected)

	log.Println("Menandai 000011_drop_transaksi sebagai sudah-applied...")
	if err := db.Exec(`INSERT INTO schema_migrations (version) VALUES ('000011_drop_transaksi') ON CONFLICT (version) DO NOTHING`).Error; err != nil {
		log.Fatalf("Gagal insert schema_migrations: %v", err)
	}
	log.Println("000011_drop_transaksi ditandai applied — migration runner akan skip.")

	// Verifikasi akhir
	var afterRows []string
	db.Raw(`SELECT version FROM schema_migrations WHERE version LIKE '%transaksi%' ORDER BY version`).Scan(&afterRows)
	log.Printf("schema_migrations setelah reset: %v", afterRows)
	log.Println("Reset selesai. Silakan jalankan app utama untuk re-run migration.")
}

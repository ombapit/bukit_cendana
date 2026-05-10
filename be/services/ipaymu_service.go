package services

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"247-golang-api/config"
)

type IPaymuService struct {
	cfg config.IPaymuConfig
}

func NewIPaymuService(cfg config.IPaymuConfig) *IPaymuService {
	return &IPaymuService{cfg: cfg}
}

type IPaymuPaymentResult struct {
	TrxID      string
	PaymentURL string
}

func (s *IPaymuService) CreatePayment(referenceID, buyerName, productName string, amount int64) (*IPaymuPaymentResult, error) {
	if s.cfg.VA == "" || s.cfg.APIKey == "" {
		return nil, errors.New("konfigurasi iPaymu belum lengkap (IPAYMU_VA dan IPAYMU_API_KEY wajib diisi di .env)")
	}
	if s.cfg.NotifyURL == "" || s.cfg.ReturnURL == "" || s.cfg.CancelURL == "" {
		return nil, errors.New("konfigurasi iPaymu belum lengkap (IPAYMU_NOTIFY_URL, IPAYMU_RETURN_URL, IPAYMU_CANCEL_URL wajib diisi di .env)")
	}

	type reqBody struct {
		Product     []string `json:"product"`
		Qty         []int    `json:"qty"`
		Price       []int64  `json:"price"`
		ReturnURL   string   `json:"returnUrl"`
		NotifyURL   string   `json:"notifyUrl"`
		CancelURL   string   `json:"cancelUrl"`
		ReferenceID string   `json:"referenceId"`
		BuyerName   string   `json:"buyerName"`
	}

	body := reqBody{
		Product:     []string{productName},
		Qty:         []int{1},
		Price:       []int64{amount},
		ReturnURL:   s.cfg.ReturnURL,
		NotifyURL:   s.cfg.NotifyURL,
		CancelURL:   s.cfg.CancelURL,
		ReferenceID: referenceID,
		BuyerName:   buyerName,
	}

	bodyBytes, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}

	bodySHA := ipaymuHash(string(bodyBytes))
	signature := ipaymuHash(fmt.Sprintf("post:%s:%s:%s", s.cfg.VA, bodySHA, s.cfg.APIKey))
	timestamp := time.Now().Format("20060102150405")

	req, err := http.NewRequest("POST", s.cfg.BaseURL+"/api/v2/payment", bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("va", s.cfg.VA)
	req.Header.Set("signature", signature)
	req.Header.Set("timestamp", timestamp)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBytes, _ := io.ReadAll(resp.Body)
	log.Printf("[iPaymu] status=%d body=%s", resp.StatusCode, string(respBytes))

	var result struct {
		Status  int    `json:"Status"`
		Message string `json:"Message"`
		Data    struct {
			PaymentNo string `json:"PaymentNo"`
			Url       string `json:"Url"`
		} `json:"Data"`
	}
	if err := json.Unmarshal(respBytes, &result); err != nil {
		return nil, fmt.Errorf("gagal parse respons iPaymu: %s", string(respBytes))
	}
	if result.Status != 200 {
		return nil, fmt.Errorf("iPaymu error (%d): %s", result.Status, result.Message)
	}

	return &IPaymuPaymentResult{
		TrxID:      result.Data.PaymentNo,
		PaymentURL: result.Data.Url,
	}, nil
}

func ipaymuHash(s string) string {
	h := sha256.New()
	h.Write([]byte(s))
	return strings.ToLower(hex.EncodeToString(h.Sum(nil)))
}

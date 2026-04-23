package utils

import (
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type FieldError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

type ValidationResponse struct {
	Success bool         `json:"success"`
	Message string       `json:"message"`
	Errors  []FieldError `json:"errors,omitempty"`
}

// ParseValidationError mengubah Gin validation error jadi daftar field error yang human-readable
func ParseValidationError(err error) []FieldError {
	var ve validator.ValidationErrors
	if !errors.As(err, &ve) {
		return []FieldError{{Field: "general", Message: err.Error()}}
	}

	fieldErrors := make([]FieldError, 0, len(ve))
	for _, fe := range ve {
		field := toSnakeCase(fe.Field())
		message := formatValidationMessage(field, fe.Tag(), fe.Param())
		fieldErrors = append(fieldErrors, FieldError{
			Field:   field,
			Message: message,
		})
	}
	return fieldErrors
}

// ValidationErrorDetailResponse mengembalikan response dengan detail per-field
func ValidationErrorDetailResponse(c *gin.Context, err error) {
	fieldErrors := ParseValidationError(err)

	// Gabungkan pesan untuk field "message" utama
	messages := make([]string, 0, len(fieldErrors))
	for _, fe := range fieldErrors {
		messages = append(messages, fe.Message)
	}

	c.JSON(http.StatusUnprocessableEntity, ValidationResponse{
		Success: false,
		Message: strings.Join(messages, "; "),
		Errors:  fieldErrors,
	})
}

func formatValidationMessage(field, tag, param string) string {
	readableField := humanizeField(field)

	switch tag {
	case "required":
		return fmt.Sprintf("%s is required", readableField)
	case "email":
		return fmt.Sprintf("%s must be a valid email", readableField)
	case "min":
		return fmt.Sprintf("%s must be at least %s characters", readableField, param)
	case "max":
		return fmt.Sprintf("%s must be at most %s characters", readableField, param)
	case "uuid":
		return fmt.Sprintf("%s must be a valid ID", readableField)
	default:
		return fmt.Sprintf("%s is invalid", readableField)
	}
}

func humanizeField(field string) string {
	replacer := strings.NewReplacer(
		"_", " ",
	)
	field = replacer.Replace(field)
	if len(field) > 0 {
		return strings.ToUpper(field[:1]) + field[1:]
	}
	return field
}

func toSnakeCase(s string) string {
	var result strings.Builder
	for i, c := range s {
		if c >= 'A' && c <= 'Z' {
			if i > 0 {
				result.WriteByte('_')
			}
			result.WriteRune(c + 32) // lowercase
		} else {
			result.WriteRune(c)
		}
	}
	return result.String()
}

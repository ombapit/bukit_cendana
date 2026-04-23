import type { Translations } from "@/lib/i18n";

interface APIFieldError {
  field: string;
  message: string;
}

interface APIErrorResponse {
  success: boolean;
  message: string;
  errors?: APIFieldError[];
}

/**
 * Parse API error response dan terjemahkan ke bahasa yang aktif.
 * Jika API mengembalikan field errors, translate per-field.
 * Jika tidak, kembalikan message apa adanya.
 */
export function parseAPIError(err: unknown, t: Translations): string {
  const axiosError = err as { response?: { data?: APIErrorResponse } };
  const data = axiosError?.response?.data;

  if (!data) return t.saveFailed;

  // Jika ada field-level errors dari backend
  if (data.errors && data.errors.length > 0) {
    const messages = data.errors.map((fe) => {
      const fieldName = t.validation.fieldNames[fe.field] || fe.field;
      // Cek tag dari message backend untuk menentukan terjemahan
      const msg = fe.message.toLowerCase();
      if (msg.includes("required")) return t.validation.required(fieldName);
      if (msg.includes("valid email")) return t.validation.email(fieldName);
      if (msg.includes("at least")) {
        const match = fe.message.match(/at least (\d+)/);
        return t.validation.min(fieldName, match?.[1] || "");
      }
      if (msg.includes("at most")) {
        const match = fe.message.match(/at most (\d+)/);
        return t.validation.max(fieldName, match?.[1] || "");
      }
      return t.validation.invalid(fieldName);
    });
    return messages.join(". ");
  }

  return data.message || t.saveFailed;
}

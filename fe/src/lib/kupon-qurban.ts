import type { PenerimaQurban } from "@/types";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace("/api/v1", "");

async function toBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// Pre-fetch all QR codes in parallel before drawing
async function prefetchQRCodes(wargas: PenerimaQurban[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  await Promise.all(
    wargas
      .filter((w) => w.qr_code)
      .map(async (w) => {
        const b64 = await toBase64(`${API_BASE}${w.qr_code}`);
        if (b64) map.set(String(w.id), b64);
      })
  );
  return map;
}

// Coupon dimensions (mm)
const CW = 47;   // width
const CH = 68;   // height
const COLS = 4;
const ROWS = 4;
const MARGIN_X = 5;
const MARGIN_Y = 5;
const GAP_X = (210 - MARGIN_X * 2 - COLS * CW) / (COLS - 1); // ~4mm
const GAP_Y = (297 - MARGIN_Y * 2 - ROWS * CH) / (ROWS - 1); // ~5mm

function drawKupon(
  doc: import("jspdf").jsPDF,
  warga: PenerimaQurban,
  x: number,
  y: number,
  qrB64: string | null,
) {
  // Border only, no fill
  doc.setFillColor(255, 255, 255);
  doc.rect(x, y, CW, CH, "FD");
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(x, y, CW, CH, "S");

  // Title bold, 2 lines
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(0, 0, 0);
  doc.text("Pengambilan Daging Qurban", x + CW / 2, y + 5.5, { align: "center" });
  doc.text("Cendana 2026", x + CW / 2, y + 10, { align: "center" });

  // Underline below title
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.line(x + 3, y + 12, x + CW - 3, y + 12);

  // QR code
  const qrSize = 30;
  const qrX = x + (CW - qrSize) / 2;
  const qrY = y + 15;

  if (qrB64) {
    doc.addImage(qrB64, "PNG", qrX, qrY, qrSize, qrSize);
  } else {
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.rect(qrX, qrY, qrSize, qrSize, "S");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5);
    doc.setTextColor(160, 160, 160);
    doc.text("No QR", x + CW / 2, qrY + qrSize / 2, { align: "center" });
  }

  // Name
  const nameY = qrY + qrSize + 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.setTextColor(80, 80, 80);
  doc.text("Nama", x + CW / 2, nameY, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  const nameText = warga.nama.length > 22 ? warga.nama.substring(0, 21) + "…" : warga.nama;
  doc.text(nameText, x + CW / 2, nameY + 5, { align: "center" });

  // Blok
  const blokY = nameY + 9;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.setTextColor(80, 80, 80);
  doc.text("Blok", x + CW / 2, blokY, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(warga.blok, x + CW / 2, blokY + 5.5, { align: "center" });
}

export async function generateKuponQurbanPDF(wargas: PenerimaQurban[]) {
  const { default: jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Pre-fetch all QR images in parallel
  const qrMap = await prefetchQRCodes(wargas);

  const perPage = COLS * ROWS; // 16

  wargas.forEach((warga, i) => {
    if (i > 0 && i % perPage === 0) doc.addPage();

    const slot = i % perPage;
    const col  = slot % COLS;
    const row  = Math.floor(slot / COLS);

    const x = MARGIN_X + col * (CW + GAP_X);
    const y = MARGIN_Y + row * (CH + GAP_Y);

    const qrB64 = qrMap.get(String(warga.id)) ?? null;
    drawKupon(doc, warga, x, y, qrB64);
  });

  doc.save("Kupon_Qurban_Cendana_2026.pdf");
}

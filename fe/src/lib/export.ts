import * as XLSX from "xlsx";
import ExcelJS from "exceljs";

export function exportXLS(filename: string, sheetName: string, rows: Record<string, unknown>[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

// Returns how many full months have passed since YYYYMM.
function monthsSince(yyyymm: string): number {
  if (!yyyymm || yyyymm.length !== 6) return 999;
  const year = parseInt(yyyymm.substring(0, 4), 10);
  const month = parseInt(yyyymm.substring(4, 6), 10);
  const now = new Date();
  return (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month);
}

export interface WargaExportRow {
  no: number;
  nama: string;
  blok: string;
  no_telp: string;
  iuran: number;
  last_payment_label: string;
  last_payment_raw: string; // YYYYMM — used for color logic only
}

export async function exportWargaXLS(filename: string, rows: WargaExportRow[]) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Data Warga");

  ws.columns = [
    { header: "No",                  key: "no",               width: 5  },
    { header: "Nama",                key: "nama",             width: 30 },
    { header: "Blok",                key: "blok",             width: 10 },
    { header: "No. Telepon",         key: "no_telp",          width: 18 },
    { header: "Iuran/Bulan (Rp)",    key: "iuran",            width: 18 },
    { header: "Pembayaran Terakhir", key: "last_payment",     width: 22 },
  ];

  // Bold header
  ws.getRow(1).font = { bold: true };

  rows.forEach((r) => {
    const dataRow = ws.addRow({
      no: r.no,
      nama: r.nama,
      blok: r.blok,
      no_telp: r.no_telp,
      iuran: r.iuran,
      last_payment: r.last_payment_label,
    });

    const late = monthsSince(r.last_payment_raw);
    if (late > 3) {
      dataRow.font = { color: { argb: "FFFF0000" } }; // red
    } else if (late > 2) {
      dataRow.font = { color: { argb: "FFCC8800" } }; // amber-yellow
    }
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

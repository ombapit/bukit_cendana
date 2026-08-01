import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportXLS(filename: string, sheetName: string, rows: Record<string, unknown>[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

// Returns how many full months have passed since YYYYMM.
function monthsSince(yyyymm: string, referenceDate?: Date): number {
  if (!yyyymm || yyyymm.length !== 6) return 999;
  const year = parseInt(yyyymm.substring(0, 4), 10);
  const month = parseInt(yyyymm.substring(4, 6), 10);
  const ref = referenceDate || new Date();
  return (ref.getFullYear() - year) * 12 + (ref.getMonth() + 1 - month);
}

export interface WargaExportRow {
  no: number;
  nama: string;
  blok: string;
  no_telp: string;
  iuran: number;
  last_payment_label: string;
  last_payment_raw: string;
}

export interface AnggotaExportRow {
  no: number;
  nama_kk: string;
  blok: string;
  nama: string;
  status_hubungan: string;
  no_telp: string;
}

export async function exportWargaXLS(
  filename: string,
  rows: WargaExportRow[],
  anggotaRows: AnggotaExportRow[],
) {
  const wb = new ExcelJS.Workbook();

  // === Sheet 1: Data Warga ===
  const ws = wb.addWorksheet("Data Warga");
  ws.columns = [
    { header: "No",                  key: "no",           width: 5  },
    { header: "Nama",                key: "nama",         width: 30 },
    { header: "Blok",                key: "blok",         width: 10 },
    { header: "Iuran/Bulan (Rp)",    key: "iuran",        width: 18 },
    { header: "Pembayaran Terakhir", key: "last_payment", width: 22 },
  ];
  ws.getRow(1).font = { bold: true };
  rows.forEach((r) => {
    const dataRow = ws.addRow({
      no: r.no,
      nama: r.nama,
      blok: r.blok,
      iuran: r.iuran,
      last_payment: r.last_payment_label,
    });
    const late = monthsSince(r.last_payment_raw);
    if (late > 3) {
      dataRow.font = { color: { argb: "FFFF0000" } };
    } else if (late > 2) {
      dataRow.font = { color: { argb: "FFCC8800" } };
    }
  });

  // === Sheet 2: Anggota Keluarga ===
  const ws2 = wb.addWorksheet("Anggota Keluarga");
  ws2.columns = [
    { header: "No",              key: "no",              width: 5  },
    { header: "Nama KK",         key: "nama_kk",         width: 28 },
    { header: "Blok",            key: "blok",            width: 10 },
    { header: "Nama Anggota",    key: "nama",            width: 28 },
    { header: "Status Hubungan", key: "status_hubungan", width: 18 },
    { header: "No. Telepon",     key: "no_telp",         width: 18 },
  ];
  ws2.getRow(1).font = { bold: true };
  anggotaRows.forEach((r) => ws2.addRow(r));

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

// ========== PDF EXPORT ==========
const BULAN_INDO: Record<string, string> = {
  "01": "Januari", "02": "Februari", "03": "Maret", "04": "April",
  "05": "Mei", "06": "Juni", "07": "Juli", "08": "Agustus",
  "09": "September", "10": "Oktober", "11": "November", "12": "Desember",
};

const BULAN_INDO_SHORT: Record<string, string> = {
  "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
  "05": "Mei", "06": "Jun", "07": "Jul", "08": "Ags",
  "09": "Sep", "10": "Okt", "11": "Nov", "12": "Des",
};

function formatTanggalFull(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = BULAN_INDO[String(date.getMonth() + 1).padStart(2, '0')];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function formatMonthShort(yyyymm: string): string {
  if (!yyyymm || yyyymm.length !== 6) return "-";
  const year = yyyymm.substring(0, 4);
  const month = BULAN_INDO_SHORT[yyyymm.substring(4, 6)];
  return `${month} ${year}`;
}

function getCurrentMonthYYYYMM(referenceDate?: Date): string {
  const ref = referenceDate || new Date();
  const year = ref.getFullYear();
  const month = String(ref.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
}

// Kurangi N bulan dari format YYYYMM, handle cross-year dengan benar
function subtractMonths(yyyymm: string, months: number): string {
  if (!yyyymm || yyyymm.length !== 6) return yyyymm;
  let year = parseInt(yyyymm.substring(0, 4), 10);
  let month = parseInt(yyyymm.substring(4, 6), 10);

  month -= months;

  while (month < 1) {
    month += 12;
    year -= 1;
  }

  return `${year}${String(month).padStart(2, '0')}`;
}

export async function exportWargaPDF(rows: {
  no: number;
  nama: string;
  blok: string;
  kondisi_rumah: string;
  last_payment_raw: string;
}[], customDate?: Date) {
  const doc = new jsPDF({
    orientation: 'portrait', // Ganti jadi portrait (tegak)
    unit: 'mm',
    format: 'a4'
  });

  const reportDate = customDate || new Date();

  // Header
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("REKAPAN TAGIHAN IPL BUKIT CENDANA RT.06/RW.IX", 105, 15, { align: "center" });

  // Sub header
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold"); // Bold sesuai permintaan
  doc.text(`Per Tanggal ${formatTanggalFull(reportDate)}`, 105, 22, { align: "center" });

  // Table data
  const tableData = rows.map((w) => {
    const lastPayment = w.last_payment_raw;
    let late = monthsSince(lastPayment, reportDate);
    const currentMonth = getCurrentMonthYYYYMM(reportDate);

    let tagihan: string;
    let keterangan: string;
    let lainLain: string;
    let bgColor: [number, number, number] | undefined;
    let textColor: [number, number, number] | undefined;

    if (!lastPayment) {
      tagihan = "-";
      keterangan = "-";
      lainLain = "-";
      bgColor = [255, 100, 100]; // Merah (tidak muda)
      textColor = [255, 255, 255]; // Text putih
    } else if (late <= 0) {
      // Jika late <=0: sudah lunas sampai bulan ini ATAU LEBIH (sudah bayar bulan depan)
      tagihan = "LUNAS";
      keterangan = `Lunas s.d. ${formatMonthShort(lastPayment)}`;
      // Kosongkan LAIN-LAIN jika terakhir bayar sama dengan bulan berjalan
      lainLain = lastPayment === currentMonth ? "" : `Terakhir bulan ${formatMonthShort(lastPayment)}`;
      // Lunas = tidak ada warna background
      bgColor = undefined;
      textColor = undefined;
    } else {
      tagihan = `${late} BULAN`;
      const fromMonthYYYYMM = subtractMonths(currentMonth, late - 1);
      const fromMonth = formatMonthShort(fromMonthYYYYMM);
      const toMonth = formatMonthShort(currentMonth);

      // Untuk tunggakan 1 bulan, tidak perlu "s.d"
      if (late === 1) {
        keterangan = toMonth;
        // 1 bulan = warna hijau
        bgColor = [220, 255, 220]; // Hijau muda
        textColor = [0, 100, 0];
      } else {
        keterangan = `${fromMonth} s.d ${toMonth}`;

        // Warna berdasarkan keterlambatan
        if (late >= 6) {
          bgColor = [255, 100, 100]; // Merah (tidak muda)
          textColor = [255, 255, 255]; // Text putih
        } else if (late >= 3) {
          bgColor = [255, 220, 180]; // Orange muda
          textColor = [150, 80, 0];
        } else if (late >= 2) {
          bgColor = [255, 255, 200]; // Kuning muda
          textColor = [120, 100, 0];
        }
      }

      // Kosongkan LAIN-LAIN jika bulan terakhir bayar sama dengan bulan filter
      lainLain = lastPayment === currentMonth ? "" : `Terakhir bulan ${formatMonthShort(lastPayment)}`;
    }

    return {
      no: w.no,
      nama: w.nama,
      blok: w.blok,
      kondisiRumah: w.kondisi_rumah || "-",
      tagihan,
      keterangan,
      lainLain,
      bgColor,
      textColor
    };
  });

  autoTable(doc, {
    startY: 30,
    head: [['NO', 'NAMA WARGA', 'BLOK', 'KONDISI', 'TAGIHAN', 'KETERANGAN', 'LAIN-LAIN']],
    body: tableData.map(row => [
      row.no,
      row.nama,
      row.blok,
      row.kondisiRumah,
      row.tagihan,
      row.keterangan,
      row.lainLain
    ]),
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [50, 50, 50],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12, overflow: 'visible' },
      1: { cellWidth: 40 },
      2: { halign: 'center', cellWidth: 15 },
      3: { halign: 'center', cellWidth: 22 },
      4: { halign: 'center', cellWidth: 20 },
      5: { cellWidth: 40 },
      6: { cellWidth: 33 },
    },
    didParseCell: (data) => {
      if (data.row.index >= 0 && data.section === 'body') {
        const rowData = tableData[data.row.index];
        // Hanya warnai kolom TAGIHAN (index 4) dan KETERANGAN (index 5) jika ada warna
        if (rowData.bgColor && (data.column.index === 4 || data.column.index === 5)) {
          data.cell.styles.fillColor = rowData.bgColor;
          if (rowData.textColor) {
            data.cell.styles.textColor = rowData.textColor;
          }
        }
      }
    }
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Dicetak otomatis pada ${formatTanggalFull(reportDate)}`, 105, 285, { align: "center" });
  }

  doc.save(`Rekapan_Tagihan_IPL_Bukit_Cendana_${reportDate.getFullYear()}${String(reportDate.getMonth() + 1).padStart(2, '0')}${String(reportDate.getDate()).padStart(2, '0')}.pdf`);
}

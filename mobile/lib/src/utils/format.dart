const _bulanIndo = {
  '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April',
  '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus',
  '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember',
};

const _bulanShort = {
  '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
  '05': 'Mei', '06': 'Jun', '07': 'Jul', '08': 'Ags',
  '09': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Des',
};

String formatRupiah(num value) {
  if (value == 0) return 'Rp 0';
  final negative = value < 0;
  final abs = value.abs().toInt();
  final s = abs.toString();
  final out = StringBuffer();
  for (var i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 == 0) out.write('.');
    out.write(s[i]);
  }
  return '${negative ? '- ' : ''}Rp $out';
}

/// Convert YYYYMM (string) → "Mei 2026". Returns "-" on bad input.
String formatTanggalIPL(String yyyymm) {
  if (yyyymm.length != 6) return '-';
  final tahun = yyyymm.substring(0, 4);
  final bulan = yyyymm.substring(4, 6);
  return '${_bulanIndo[bulan] ?? bulan} $tahun';
}

/// ISO string → "12 Mei 2026". Falls back to "-" if unparseable.
String formatTanggal(String iso, {bool short = false}) {
  try {
    final d = DateTime.parse(iso).toLocal();
    final tgl = d.day.toString().padLeft(2, '0');
    final mm = d.month.toString().padLeft(2, '0');
    final bln = (short ? _bulanShort[mm] : _bulanIndo[mm]) ?? mm;
    return '$tgl $bln ${d.year}';
  } catch (_) {
    return '-';
  }
}

String formatRelative(String iso) {
  try {
    final date = DateTime.parse(iso);
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inDays == 0) {
      if (diff.inHours == 0) return '${diff.inMinutes} menit lalu';
      return '${diff.inHours} jam lalu';
    } else if (diff.inDays == 1) {
      return '1 hari lalu';
    } else if (diff.inDays < 30) {
      return '${diff.inDays} hari lalu';
    }
    return formatTanggal(iso, short: true);
  } catch (_) {
    return '-';
  }
}

int monthsSince(String yyyymm) {
  if (yyyymm.length != 6) return 999;
  final year = int.tryParse(yyyymm.substring(0, 4)) ?? 0;
  final month = int.tryParse(yyyymm.substring(4, 6)) ?? 0;
  if (year == 0) return 999;
  final now = DateTime.now();
  return (now.year - year) * 12 + (now.month - month);
}

String stripHtml(String html) {
  return html
      .replaceAll(RegExp(r'<[^>]+>'), ' ')
      .replaceAll('&nbsp;', ' ')
      .replaceAll('&amp;', '&')
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .replaceAll('&quot;', '"')
      .replaceAll(RegExp(r'\s+'), ' ')
      .trim();
}

String absoluteImageUrl(String path) {
  if (path.isEmpty) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = 'https://bukitcendana.my.id';
  return '$baseUrl$path';
}

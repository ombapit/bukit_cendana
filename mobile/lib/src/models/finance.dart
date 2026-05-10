class Finance {
  final String id;
  final String namaTransaksi;
  final String deskripsi;
  final String kategori;
  final num debit;
  final num kredit;
  final String gambar;
  final String timestamp;

  Finance({
    required this.id,
    required this.namaTransaksi,
    this.deskripsi = '',
    this.kategori = '',
    this.debit = 0,
    this.kredit = 0,
    this.gambar = '',
    this.timestamp = '',
  });

  factory Finance.fromJson(Map<String, dynamic> json) {
    return Finance(
      id: json['id'] ?? '',
      namaTransaksi: json['nama_transaksi'] ?? '',
      deskripsi: json['deskripsi'] ?? '',
      kategori: json['kategori'] ?? '',
      debit: (json['debit'] ?? 0) as num,
      kredit: (json['kredit'] ?? 0) as num,
      gambar: json['gambar'] ?? '',
      timestamp: json['timestamp'] ?? '',
    );
  }
}

class FinanceSummary {
  final num totalKredit;
  final num totalDebit;
  final num saldo;

  FinanceSummary({this.totalKredit = 0, this.totalDebit = 0, this.saldo = 0});

  factory FinanceSummary.fromJson(Map<String, dynamic> json) {
    return FinanceSummary(
      totalKredit: (json['total_kredit'] ?? 0) as num,
      totalDebit: (json['total_debit'] ?? 0) as num,
      saldo: (json['saldo'] ?? 0) as num,
    );
  }
}

class FinancePage {
  final List<Finance> records;
  final int total;
  final int totalPages;
  final int page;

  FinancePage({
    required this.records,
    required this.total,
    required this.totalPages,
    required this.page,
  });
}

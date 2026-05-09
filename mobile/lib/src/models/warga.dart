class WargaWithLastPayment {
  final String id;
  final String nama;
  final String blok;
  final String noTelp;
  final int iuran;
  final String kondisiRumah;
  final String qrCode;
  final String lastPayment;

  WargaWithLastPayment({
    required this.id,
    required this.nama,
    required this.blok,
    this.noTelp = '',
    this.iuran = 0,
    this.kondisiRumah = '',
    this.qrCode = '',
    this.lastPayment = '',
  });

  factory WargaWithLastPayment.fromJson(Map<String, dynamic> json) {
    return WargaWithLastPayment(
      id: json['id'] ?? '',
      nama: json['nama'] ?? '',
      blok: json['blok'] ?? '',
      noTelp: json['no_telp'] ?? '',
      iuran: (json['iuran'] ?? 0) as int,
      kondisiRumah: json['kondisi_rumah'] ?? '',
      qrCode: json['qr_code'] ?? '',
      lastPayment: json['last_payment'] ?? '',
    );
  }
}

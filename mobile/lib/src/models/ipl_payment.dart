class InitiateIPLPaymentResponse {
  final String referenceId;
  final String paymentUrl;
  final int jumlahBulan;
  final int totalAmount;
  final String wargaNama;
  final String wargaBlok;
  final String tanggalIplStart;
  final String tanggalIplEnd;

  const InitiateIPLPaymentResponse({
    required this.referenceId,
    required this.paymentUrl,
    required this.jumlahBulan,
    required this.totalAmount,
    required this.wargaNama,
    required this.wargaBlok,
    required this.tanggalIplStart,
    required this.tanggalIplEnd,
  });

  factory InitiateIPLPaymentResponse.fromJson(Map<String, dynamic> json) {
    return InitiateIPLPaymentResponse(
      referenceId: json['reference_id'] ?? '',
      paymentUrl: json['payment_url'] ?? '',
      jumlahBulan: (json['jumlah_bulan'] ?? 1) as int,
      totalAmount: (json['total_amount'] ?? 0) as int,
      wargaNama: json['warga_nama'] ?? '',
      wargaBlok: json['warga_blok'] ?? '',
      tanggalIplStart: json['tanggal_ipl_start'] ?? '',
      tanggalIplEnd: json['tanggal_ipl_end'] ?? '',
    );
  }
}

class IPLPaymentStatus {
  final String referenceId;
  final String status;
  final int jumlahBulan;
  final int totalAmount;
  final String wargaNama;
  final String wargaBlok;
  final String tanggalIplStart;
  final String tanggalIplEnd;

  const IPLPaymentStatus({
    required this.referenceId,
    required this.status,
    required this.jumlahBulan,
    required this.totalAmount,
    required this.wargaNama,
    required this.wargaBlok,
    required this.tanggalIplStart,
    required this.tanggalIplEnd,
  });

  factory IPLPaymentStatus.fromJson(Map<String, dynamic> json) {
    return IPLPaymentStatus(
      referenceId: json['reference_id'] ?? '',
      status: json['status'] ?? '',
      jumlahBulan: (json['jumlah_bulan'] ?? 1) as int,
      totalAmount: (json['total_amount'] ?? 0) as int,
      wargaNama: json['warga_nama'] ?? '',
      wargaBlok: json['warga_blok'] ?? '',
      tanggalIplStart: json['tanggal_ipl_start'] ?? '',
      tanggalIplEnd: json['tanggal_ipl_end'] ?? '',
    );
  }

  bool get isPaid => status == 'paid';
  bool get isPending => status == 'pending';
  bool get isFailed => status == 'failed' || status == 'cancelled';
}

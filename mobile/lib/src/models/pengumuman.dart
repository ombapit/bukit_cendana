class Pengumuman {
  final String id;
  final String judul;
  final String konten;
  final String gambar;
  final String kategori;
  final String tags;
  final bool isPublished;
  final String createdByName;
  final String createdAt;
  final String updatedAt;

  Pengumuman({
    required this.id,
    required this.judul,
    required this.konten,
    required this.gambar,
    required this.kategori,
    required this.tags,
    required this.isPublished,
    required this.createdByName,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Pengumuman.fromJson(Map<String, dynamic> json) {
    return Pengumuman(
      id: json['id'] ?? '',
      judul: json['judul'] ?? '',
      konten: json['konten'] ?? '',
      gambar: json['gambar'] ?? '',
      kategori: json['kategori'] ?? '',
      tags: json['tags'] ?? '',
      isPublished: json['is_published'] ?? false,
      createdByName: json['created_by_name'] ?? '',
      createdAt: json['created_at'] ?? '',
      updatedAt: json['updated_at'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'judul': judul,
      'konten': konten,
      'gambar': gambar,
      'kategori': kategori,
      'tags': tags,
      'is_published': isPublished,
      'created_by_name': createdByName,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }
}

class ApiResponse<T> {
  final bool success;
  final String message;
  final T? data;
  final Meta? meta;

  ApiResponse({
    required this.success,
    required this.message,
    this.data,
    this.meta,
  });

  factory ApiResponse.fromJson(Map<String, dynamic> json, T Function(dynamic) fromJsonT) {
    return ApiResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: json['data'] != null ? fromJsonT(json['data']) : null,
      meta: json['meta'] != null ? Meta.fromJson(json['meta']) : null,
    );
  }
}

class Meta {
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  Meta({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  factory Meta.fromJson(Map<String, dynamic> json) {
    return Meta(
      page: json['page'] ?? 0,
      limit: json['limit'] ?? 0,
      total: json['total'] ?? 0,
      totalPages: json['total_pages'] ?? 0,
    );
  }
}

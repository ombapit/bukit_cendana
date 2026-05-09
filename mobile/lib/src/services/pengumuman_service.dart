import 'package:dio/dio.dart';
import '../config/api_config.dart';
import '../models/pengumuman.dart';

class PengumumanService {
  late final Dio _dio;

  PengumumanService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConfig.baseUrl,
        connectTimeout: Duration(milliseconds: ApiConfig.connectTimeout),
        receiveTimeout: Duration(milliseconds: ApiConfig.receiveTimeout),
      ),
    );

    _dio.interceptors.add(
      LogInterceptor(responseBody: true, requestBody: true),
    );
  }

  Future<List<Pengumuman>> getAll({
    int page = 1,
    int limit = 12,
    String search = '',
    String kategori = '',
    bool publishedOnly = true,
  }) async {
    try {
      final params = {
        'page': page,
        'limit': limit,
        if (search.isNotEmpty) 'search': search,
        if (kategori.isNotEmpty) 'kategori': kategori,
        if (publishedOnly) 'published_only': true,
      };

      final response = await _dio.get(
        ApiConfig.pengumumanEndpoint,
        queryParameters: params,
      );

      if (response.statusCode == 200) {
        final jsonData = response.data as Map<String, dynamic>;
        
        if (jsonData['data'] is List) {
          final dataList = jsonData['data'] as List;
          return dataList
              .map((item) => Pengumuman.fromJson(item as Map<String, dynamic>))
              .toList();
        }
        return [];
      }
      return [];
    } catch (e) {
      print('Error fetching pengumuman: $e');
      return [];
    }
  }

  Future<Pengumuman?> getById(String id) async {
    try {
      final response = await _dio.get('${ApiConfig.pengumumanEndpoint}/$id');

      if (response.statusCode == 200) {
        final jsonData = response.data as Map<String, dynamic>;
        
        if (jsonData['data'] is Map) {
          return Pengumuman.fromJson(jsonData['data'] as Map<String, dynamic>);
        }
        return null;
      }
      return null;
    } catch (e) {
      print('Error fetching pengumuman detail: $e');
      return null;
    }
  }
}

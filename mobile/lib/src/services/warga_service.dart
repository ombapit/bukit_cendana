import 'package:dio/dio.dart';
import '../config/api_config.dart';
import '../models/warga.dart';

class WargaService {
  late final Dio _dio;

  WargaService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConfig.baseUrl,
        connectTimeout: Duration(milliseconds: ApiConfig.connectTimeout),
        receiveTimeout: Duration(milliseconds: ApiConfig.receiveTimeout),
      ),
    );
  }

  Future<List<WargaWithLastPayment>> getAll({
    int page = 1,
    int limit = 1000,
    int? tunggakan,
  }) async {
    try {
      final params = {
        'page': page,
        'limit': limit,
        if (tunggakan != null) 'tunggakan': tunggakan,
      };

      final response = await _dio.get(
        ApiConfig.wargaEndpoint,
        queryParameters: params,
      );

      if (response.statusCode == 200) {
        final jsonData = response.data as Map<String, dynamic>;

        if (jsonData['data'] is List) {
          final dataList = jsonData['data'] as List;
          return dataList
              .map(
                (item) => WargaWithLastPayment.fromJson(
                  item as Map<String, dynamic>,
                ),
              )
              .toList();
        }
        return [];
      }
      return [];
    } catch (e) {
      return [];
    }
  }
}

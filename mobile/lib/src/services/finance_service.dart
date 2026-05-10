import 'package:dio/dio.dart';
import '../config/api_config.dart';
import '../models/finance.dart';

class FinanceService {
  late final Dio _dio;

  FinanceService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConfig.baseUrl,
        connectTimeout: Duration(milliseconds: ApiConfig.connectTimeout),
        receiveTimeout: Duration(milliseconds: ApiConfig.receiveTimeout),
      ),
    );
  }

  Future<FinancePage> getAll({
    int page = 1,
    int limit = 20,
    String search = '',
    String dateFrom = '',
    String dateTo = '',
  }) async {
    try {
      final params = <String, dynamic>{
        'page': page,
        'limit': limit,
        if (search.isNotEmpty) 'search': search,
        if (dateFrom.isNotEmpty) 'date_from': dateFrom,
        if (dateTo.isNotEmpty) 'date_to': dateTo,
      };

      final res = await _dio.get('/finance', queryParameters: params);
      if (res.statusCode != 200) {
        return FinancePage(records: [], total: 0, totalPages: 1, page: page);
      }
      final body = res.data as Map<String, dynamic>;
      final list = (body['data'] as List? ?? [])
          .map((e) => Finance.fromJson(e as Map<String, dynamic>))
          .toList();
      final meta = body['meta'] as Map<String, dynamic>?;
      return FinancePage(
        records: list,
        total: (meta?['total'] ?? list.length) as int,
        totalPages: (meta?['total_pages'] ?? 1) as int,
        page: (meta?['page'] ?? page) as int,
      );
    } catch (_) {
      return FinancePage(records: [], total: 0, totalPages: 1, page: page);
    }
  }

  Future<FinanceSummary> getSummary({String dateFrom = '', String dateTo = ''}) async {
    try {
      final params = <String, dynamic>{
        if (dateFrom.isNotEmpty) 'date_from': dateFrom,
        if (dateTo.isNotEmpty) 'date_to': dateTo,
      };
      final res = await _dio.get('/finance/summary', queryParameters: params);
      if (res.statusCode != 200) return FinanceSummary();
      final body = res.data as Map<String, dynamic>;
      final data = body['data'] as Map<String, dynamic>?;
      if (data == null) return FinanceSummary();
      return FinanceSummary.fromJson(data);
    } catch (_) {
      return FinanceSummary();
    }
  }
}

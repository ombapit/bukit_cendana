import 'package:dio/dio.dart';
import '../config/api_config.dart';
import '../models/ipl_payment.dart';

class IPLPaymentService {
  late final Dio _dio;

  IPLPaymentService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConfig.baseUrl,
        connectTimeout: Duration(milliseconds: ApiConfig.connectTimeout),
        receiveTimeout: Duration(milliseconds: ApiConfig.receiveTimeout),
      ),
    );
  }

  Future<InitiateIPLPaymentResponse> initiate({
    required String wargaId,
    required String tanggalIpl,
    String tanggalIplEnd = '',
  }) async {
    final body = <String, dynamic>{
      'warga_id': wargaId,
      'tanggal_ipl': tanggalIpl,
      if (tanggalIplEnd.isNotEmpty) 'tanggal_ipl_end': tanggalIplEnd,
    };

    final res = await _dio.post('/ipl-payments', data: body);
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return InitiateIPLPaymentResponse.fromJson(data);
  }

  Future<IPLPaymentStatus> getStatus(String referenceId) async {
    final res = await _dio.get('/ipl-payments/$referenceId/status');
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return IPLPaymentStatus.fromJson(data);
  }
}

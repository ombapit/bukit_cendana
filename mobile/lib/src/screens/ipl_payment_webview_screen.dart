import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../widgets/app_background.dart';

enum IPLPaymentWebViewResult { success, cancelled, error }

class IPLPaymentWebViewScreen extends StatefulWidget {
  final String paymentUrl;
  final String referenceId;

  const IPLPaymentWebViewScreen({
    super.key,
    required this.paymentUrl,
    required this.referenceId,
  });

  @override
  State<IPLPaymentWebViewScreen> createState() => _IPLPaymentWebViewScreenState();
}

class _IPLPaymentWebViewScreenState extends State<IPLPaymentWebViewScreen> {
  late final WebViewController _controller;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) => setState(() => _loading = true),
          onPageFinished: (_) => setState(() => _loading = false),
          onNavigationRequest: (req) {
            final url = req.url;
            if (url.contains('/ipl-payments/return') || url.contains('ipl-payment/success')) {
              Navigator.of(context).pop(IPLPaymentWebViewResult.success);
              return NavigationDecision.prevent;
            }
            if (url.contains('/ipl-payments/cancel') || url.contains('ipl-payment/cancel')) {
              Navigator.of(context).pop(IPLPaymentWebViewResult.cancelled);
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.paymentUrl));
  }

  @override
  Widget build(BuildContext context) {
    return AppBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: const Text('Pembayaran IPL'),
          leading: IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => Navigator.of(context).pop(IPLPaymentWebViewResult.cancelled),
          ),
        ),
        body: Stack(
          children: [
            WebViewWidget(controller: _controller),
            if (_loading)
              const Center(
                child: CircularProgressIndicator(),
              ),
          ],
        ),
      ),
    );
  }
}

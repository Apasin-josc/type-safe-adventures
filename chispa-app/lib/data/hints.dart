import 'dart:async';
import 'dart:convert';
import 'dart:io';

/// Le pide una pista a Salsa (Claude) al servidorcito de tu Mac. La API key nunca está en la app:
/// la app solo conoce la dirección del servidor y un token para que nadie más lo use.
///
/// Se compila con:  --dart-define=HINT_TOKEN=$(cat hint-server/.token)
/// (y opcional --dart-define=HINT_URL=http://otra-mac.local:8787)
class HintClient {
  static const url = String.fromEnvironment('HINT_URL', defaultValue: 'http://QUE-PADRE.local:8787');
  static const token = String.fromEnvironment('HINT_TOKEN');

  static bool get configured => token.isNotEmpty;

  /// Regresa la pista, o lanza [HintError] con un código corto: 'offline', 'token', 'nokey', 'rate', 'fail'.
  static Future<String> ask({
    required String lang,
    required String prompt,
    required String code,
    List<Map<String, String>> fails = const [],
    String? error,
  }) async {
    if (!configured) throw const HintError('token');
    final client = HttpClient()..connectionTimeout = const Duration(seconds: 6);
    try {
      final req = await client.postUrl(Uri.parse('$url/hint')).timeout(const Duration(seconds: 8));
      req.headers
        ..contentType = ContentType.json
        ..set(HttpHeaders.authorizationHeader, 'Bearer $token');
      req.write(jsonEncode({'lang': lang, 'prompt': prompt, 'code': code, 'fails': fails, 'error': error}));
      final res = await req.close().timeout(const Duration(seconds: 25));
      final body = await res.transform(utf8.decoder).join().timeout(const Duration(seconds: 25));
      Map<String, dynamic> j;
      try {
        j = jsonDecode(body) as Map<String, dynamic>;
      } catch (_) {
        throw const HintError('fail');
      }
      if (res.statusCode == 200 && j['hint'] is String) return j['hint'] as String;
      throw HintError(j['error'] as String? ?? 'fail');
    } on HintError {
      rethrow;
    } on SocketException {
      throw const HintError('offline');
    } on TimeoutException {
      throw const HintError('offline');
    } on HttpException {
      throw const HintError('offline');
    } finally {
      client.close(force: true);
    }
  }
}

class HintError implements Exception {
  const HintError(this.code);
  final String code;
  @override
  String toString() => 'HintError($code)';
}

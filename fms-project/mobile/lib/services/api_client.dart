import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiClient {
  final String baseUrl;
  String? accessToken;

  ApiClient({required this.baseUrl});

  Map<String, String> get _headers => {
        "Content-Type": "application/json",
        if (accessToken != null) "Authorization": "Bearer $accessToken",
      };

  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> body) async {
    final res = await http.post(Uri.parse("$baseUrl$path"), headers: _headers, body: jsonEncode(body));
    final decoded = jsonDecode(res.body);
    if (res.statusCode >= 400) {
      throw ApiException(code: decoded["code"] ?? "ERR-500", message: decoded["message"] ?? "Request failed.");
    }
    return decoded;
  }

  Future<Map<String, dynamic>> get(String path) async {
    final res = await http.get(Uri.parse("$baseUrl$path"), headers: _headers);
    final decoded = jsonDecode(res.body);
    if (res.statusCode >= 400) {
      throw ApiException(code: decoded["code"] ?? "ERR-500", message: decoded["message"] ?? "Request failed.");
    }
    return decoded;
  }
}

class ApiException implements Exception {
  final String code;
  final String message;
  ApiException({required this.code, required this.message});
  @override
  String toString() => "$code: $message";
}

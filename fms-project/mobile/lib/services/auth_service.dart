import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_client.dart';

class AuthService {
  final ApiClient api;
  final _storage = const FlutterSecureStorage();

  AuthService({required this.api});

  static const _kAccessToken = "accessToken";

  Future<void> login(String username, String password) async {
    final res = await api.post("/api/auth/login", {"username": username, "password": password});
    final data = res["data"];
    api.accessToken = data["accessToken"];
    await _storage.write(key: _kAccessToken, value: data["accessToken"]);
  }

  Future<bool> tryRestoreSession() async {
    final access = await _storage.read(key: _kAccessToken);
    if (access == null) return false;
    api.accessToken = access;
    return true;
  }

  Future<void> logout() async {
    api.accessToken = null;
    await _storage.delete(key: _kAccessToken);
  }
}

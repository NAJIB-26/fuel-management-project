import 'package:flutter/material.dart';
import 'services/api_client.dart';
import 'services/auth_service.dart';
import 'screens/login_screen.dart';
import 'screens/home_shell.dart';

const String kApiBaseUrl = "http://10.0.2.2:4000"; // Android emulator -> localhost. Change for real device/server.

void main() {
  runApp(const FmsApp());
}

class FmsApp extends StatefulWidget {
  const FmsApp({super.key});
  @override
  State<FmsApp> createState() => _FmsAppState();
}

class _FmsAppState extends State<FmsApp> {
  late final ApiClient _apiClient;
  late final AuthService _authService;
  bool _checkingSession = true;
  bool _loggedIn = false;

  @override
  void initState() {
    super.initState();
    _apiClient = ApiClient(baseUrl: kApiBaseUrl);
    _authService = AuthService(api: _apiClient);
    _restoreSession();
  }

  Future<void> _restoreSession() async {
    final restored = await _authService.tryRestoreSession();
    setState(() { _loggedIn = restored; _checkingSession = false; });
  }

  @override
  Widget build(BuildContext context) {
    if (_checkingSession) {
      return const MaterialApp(home: Scaffold(body: Center(child: CircularProgressIndicator())));
    }
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: _loggedIn
          ? HomeShell(apiClient: _apiClient, authService: _authService)
          : LoginScreen(baseUrl: kApiBaseUrl, onLoggedIn: () => setState(() => _loggedIn = true)),
    );
  }
}

import 'package:flutter/material.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';
import 'login_screen.dart';

class HomeShell extends StatelessWidget {
  final ApiClient apiClient;
  final AuthService authService;
  const HomeShell({super.key, required this.apiClient, required this.authService});

  Future<void> _handleLogout(BuildContext context) async {
    await authService.logout();
    if (context.mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => LoginScreen(baseUrl: apiClient.baseUrl, onLoggedIn: () => Navigator.of(context).pop()),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(
          title: const Text("نظام مراقبة المحروقات والصيانة"),
          actions: [IconButton(icon: const Icon(Icons.logout), onPressed: () => _handleLogout(context))],
        ),
        body: const Center(child: Text("الشاشة الرئيسية")),
      ),
    );
  }
}

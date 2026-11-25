import 'package:flutter/material.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  final String baseUrl;
  final VoidCallback onLoggedIn;
  const LoginScreen({super.key, required this.baseUrl, required this.onLoggedIn});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  late final AuthService _authService;
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _authService = AuthService(api: ApiClient(baseUrl: widget.baseUrl));
  }

  Future<void> _handleLogin() async {
    setState(() { _loading = true; _error = null; });
    try {
      await _authService.login(_usernameController.text.trim(), _passwordController.text);
      widget.onLoggedIn();
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text("تسجيل الدخول", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                if (_error != null)
                  Padding(padding: const EdgeInsets.only(bottom: 12), child: Text(_error!, style: const TextStyle(color: Colors.red))),
                TextField(controller: _usernameController, decoration: const InputDecoration(labelText: "اسم المستخدم", border: OutlineInputBorder())),
                const SizedBox(height: 12),
                TextField(controller: _passwordController, obscureText: true, decoration: const InputDecoration(labelText: "كلمة المرور", border: OutlineInputBorder())),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _loading ? null : _handleLogin,
                    child: _loading ? const CircularProgressIndicator() : const Text("دخول"),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

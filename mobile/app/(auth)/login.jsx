import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, setToken } = useContext(AuthContext); // Access context directly if needed

  const handleLogin = async () => {
    if (!email || !password) {
        Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
        return;
    }
    const result = await login(email, password);
    console.log('Login Result:', result); // Log for debugging
    if (!result.success) {
        Alert.alert('Đăng nhập thất bại', result.message || JSON.stringify(result));
    }
  };

  const handleGoogleLogin = async () => {
    try {
        const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
        const redirectUrl = Linking.createURL('google-auth'); // Scheme: mobile://google-auth
        const authUrl = `${API_URL}/auth/google?platform=mobile`;
        
        console.log('Opening Auth Session:', authUrl, 'Redirect:', redirectUrl);

        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

        if (result.type === 'success') {
            const { url } = result;
            const params = new URLSearchParams(url.split('?')[1]);
            const token = params.get('token');

            if (token) {
                const success = await setToken(token);
                if (success) {
                   // Router redirect handled by AuthContext useEffect
                } else {
                   Alert.alert('Lỗi', 'Không thể lấy thông tin người dùng sau khi đăng nhập Google');
                }
            }
        }
    } catch (error) {
        Alert.alert('Lỗi đăng nhập Google', error.message || 'Không thể mở kết nối');
    }
  };

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
    >
      <StatusBar style="light" />
      <View style={styles.content}>
        <View style={styles.header}>
            <Text style={styles.title}>Chào mừng trở lại</Text>
            <Text style={styles.subtitle}>Nhập thông tin xác thực để truy cập tài khoản</Text>
        </View>

        <View style={styles.form}>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="email@example.com"
                    placeholderTextColor="#71717a" // zinc-500
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Mật khẩu</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập mật khẩu của bạn"
                    placeholderTextColor="#71717a"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            <TouchableOpacity 
                style={styles.button} 
                onPress={handleLogin}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="black" />
                ) : (
                    <Text style={styles.buttonText}>Đăng nhập</Text>
                )}
            </TouchableOpacity>

             <TouchableOpacity 
                style={[styles.button, { backgroundColor: '#db4437', marginTop: 8 }]} 
                onPress={handleGoogleLogin}
                disabled={isLoading}
            >
                <Text style={[styles.buttonText, { color: 'white' }]}>Tiếp tục với Google</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Chưa có tài khoản? </Text>
                <Link href="/(auth)/signup" asChild>
                    <TouchableOpacity>
                        <Text style={styles.link}>Đăng ký</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b', // zinc-950
    padding: 24,
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    gap: 32,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    color: '#a1a1aa', // zinc-400
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#27272a', // zinc-800
    borderWidth: 1,
    borderColor: '#3f3f46', // zinc-700
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 14,
  },
  button: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    height: 48,
  },
  buttonText: {
    color: 'black',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#a1a1aa', // zinc-400
  },
  link: {
    color: 'white',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, setToken } = useContext(AuthContext);
  const { colors, theme } = useTheme();
  const styles = getStyles(colors);

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
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
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
                    placeholderTextColor={colors.subtext} // zinc-500
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
                    placeholderTextColor={colors.subtext}
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
                    <ActivityIndicator color={colors.background} />
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

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // zinc-950
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
    color: colors.text,
  },
  subtitle: {
    color: colors.subtext, // zinc-400
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.input, // zinc-800 or white
    borderWidth: 1,
    borderColor: colors.border, // zinc-700
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 14,
  },
  button: {
    backgroundColor: colors.text, // Invert: White on Dark, Black on Light
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    height: 48,
  },
  buttonText: {
    color: colors.background, // Invert: Black on White btn, White on Black btn
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: colors.subtext, // zinc-400
  },
  link: {
    color: colors.text,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

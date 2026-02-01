import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useRouter, Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { register, isLoading } = useContext(AuthContext);
  const router = useRouter();
  const { colors, theme } = useTheme();
  const styles = getStyles(colors);

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
        Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
        return;
    }
    if (password !== confirmPassword) {
        Alert.alert('Lỗi', 'Mật khẩu không khớp');
        return;
    }

    const result = await register(username, email, password, confirmPassword);
    if (result.success) {
        Alert.alert('Thành công', 'Tạo tài khoản thành công! Vui lòng đăng nhập.', [
            { text: 'OK', onPress: () => router.replace('/(auth)/login') }
        ]);
    } else {
        Alert.alert('Đăng ký thất bại', result.message || 'Đã có lỗi xảy ra');
    }
  };

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
    >
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
            <Text style={styles.title}>Tạo tài khoản</Text>
            <Text style={styles.subtitle}>Nhập thông tin chi tiết để bắt đầu</Text>
        </View>

        <View style={styles.form}>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Họ và tên</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập tên của bạn"
                    placeholderTextColor={colors.subtext}
                    value={username}
                    onChangeText={setUsername}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="email@example.com"
                    placeholderTextColor={colors.subtext}
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
                    placeholder="Tạo mật khẩu"
                    placeholderTextColor={colors.subtext}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Xác nhận mật khẩu</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor={colors.subtext}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />
            </View>

            <TouchableOpacity 
                style={styles.button} 
                onPress={handleRegister}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color={colors.background} />
                ) : (
                    <Text style={styles.buttonText}>Đăng ký</Text>
                )}
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Đã có tài khoản? </Text>
                <Link href="/(auth)/login" asChild>
                    <TouchableOpacity>
                        <Text style={styles.link}>Đăng nhập</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // zinc-950
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
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
    backgroundColor: colors.input, // zinc-800
    borderWidth: 1,
    borderColor: colors.border, // zinc-700
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 14,
  },
  button: {
    backgroundColor: colors.text, // Invert logic
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    height: 48,
  },
  buttonText: {
    color: colors.background, // Invert logic
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

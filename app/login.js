import React, { useState, useContext } from 'react';
import { TextInput, Button, View, Alert, StyleSheet, Text, TouchableOpacity,
  SafeAreaView
 } from 'react-native';
import { AuthContext } from '../context/AuthContext'; // Lấy AuthContext
import api from '../constants/api'; // Import API instance
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext); // Lấy hàm login từ AuthContext
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await api.post("/login", { email, password });

      if (response.status === 200 && response.data.token) {
        const { token, user } = response.data; // Lấy token và thông tin người dùng
        await login(token, user); // Lưu thông tin vào AuthContext;
        router.push("/"); // Chuyển đến trang chính
      } else {
        Alert.alert("Lỗi", "Thông tin đăng nhập không hợp lệ.");
      }
    } catch (error) {
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể kết nối đến máy chủ.");
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#aaa"
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#aaa"
      />
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Đăng nhập</Text>
      </TouchableOpacity>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Chưa có tài khoản?</Text>
        <TouchableOpacity onPress={() => router.push('/signup')}>
          <Text style={styles.signupLink}>Đăng ký ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '90%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    width: '90%',
    height: 50,
    backgroundColor: '#ff5c1c',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  signupText: {
    fontSize: 16,
    color: '#333',
  },
  signupLink: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff5c1c',
    marginLeft: 5,
  },
});

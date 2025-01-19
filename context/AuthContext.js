import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // Lưu thông tin người dùng
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const savedToken = await AsyncStorage.getItem("userToken");
        const savedUser = await AsyncStorage.getItem("userInfo");

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser)); // Lấy thông tin người dùng từ AsyncStorage
          setIsLoggedIn(true);
        } else {
          setToken(null);
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Lỗi khi khởi tạo auth:", error);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (jwtToken, userInfo) => {
    try {
      await AsyncStorage.setItem("userToken", jwtToken);
      await AsyncStorage.setItem("userInfo", JSON.stringify(userInfo));
      setToken(jwtToken);
      setUser(userInfo);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Lỗi khi lưu thông tin đăng nhập:", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userInfo");
      setToken(null);
      setUser(null);
      setIsLoggedIn(false);
      router.push("/login")
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

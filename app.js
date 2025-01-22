import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { AuthProvider } from './context/AuthContext'; // Đường dẫn đến AuthContext.js
import RootLayout from './RootLayout'; // Đảm bảo đã định nghĩa RootLayout của bạn

export default function App() {

  return (
    <AuthProvider>
      <RootLayout />
    </AuthProvider>
  );
}

import React from 'react';
import { AuthProvider } from './context/AuthContext'; // Đường dẫn đến AuthContext.js

export default function App() {
  return (
    <AuthProvider>
<RootLayout />
    </AuthProvider>
  );
}

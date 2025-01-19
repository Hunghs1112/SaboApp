import axios from 'axios';

// Cấu hình URL cơ sở của API
const API_BASE_URL = 'http://64.176.84.220:3000/api';

// Tạo một instance của axios để sử dụng cho toàn bộ ứng dụng
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Giới hạn thời gian chờ (10 giây)
});

// Interceptor để log lỗi (nếu cần)
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;

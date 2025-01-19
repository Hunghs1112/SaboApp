import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView
} from "react-native";
import api from "../constants/api";
import { AuthContext } from "../context/AuthContext";
import { useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native"; // Đảm bảo import useFocusEffect
import { ScrollView } from 'react-native-virtualized-view';
export default function OrderDetailScreen() {
  const { user } = useContext(AuthContext); // Lấy thông tin user
  const [orderDetails, setOrderDetails] = useState(null); // Chi tiết đơn hàng
  const [loading, setLoading] = useState(true);
  const { orderId, user_id } = useLocalSearchParams(); // Lấy cả orderId và user_id
 // Đối tượng ánh xạ trạng thái tiếng Việt
 const statusTranslations = {
  "pending": "Xuất xưởng TQ",
  "shop_pending": "Qua cửa khẩu",
  "shipping": "Tới kho VN",
  "delivering": "Xuất kho VN",
   "completed": "Hoàn thành",
    "cancelled": "Đã hủy"
};

const paymentStatusTranslations = {
  "unpaid": "Chưa thanh toán",
  "deposit paid": "Đã thanh toán cọc",
  "paid": "Đã thanh toán",
};
const getStatusText = (status) => {
  return statusTranslations[status] || status; // Trả về trạng thái nếu không tìm thấy trong đối tượng
};

const getPaymentStatusText = (paymentStatus) => {
  return paymentStatusTranslations[paymentStatus] || paymentStatus; // Trả về trạng thái nếu không tìm thấy trong đối tượng
};

useFocusEffect(
  React.useCallback(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/orders/details/${orderId}?user_id=${user_id}`);
        setOrderDetails(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId, user_id])
);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5C1C" />
      </View>
    );
  }

  if (!orderDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Không thể tải chi tiết đơn hàng.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView style={styles.container}>
      {/* Thông tin đơn hàng */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
        <View style={styles.card}>
          <Text style={styles.infoText}>🆔 Mã đơn hàng: {orderDetails.order_id}</Text>
          <Text style={styles.infoText}>📋 Trạng thái: {getStatusText(orderDetails.status)}</Text>
          <Text style={styles.infoText}>💰 Tổng tiền: ¥{orderDetails.total_amount}</Text>
          <Text style={styles.infoText}>
            📅 Ngày tạo: {new Date(orderDetails.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Địa chỉ người nhận */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Địa chỉ người nhận</Text>
        <View style={styles.card}>
          <Text style={styles.infoText}>👤 Họ và tên: {orderDetails.customer.full_name}</Text>
          <Text style={styles.infoText}>📞 Số điện thoại: {orderDetails.customer.phone}</Text>
          <Text style={styles.infoText}>🏠 Địa chỉ: {orderDetails.customer.address}</Text>
        </View>
      </View>

      {/* Ghi chú và trạng thái thanh toán */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin bổ sung</Text>
        <View style={styles.card}>
          <Text style={styles.infoText}>📝 Ghi chú: {orderDetails.note || "Không có ghi chú"}</Text>
          <Text style={styles.infoText}>💳 Trạng thái thanh toán: {getPaymentStatusText(orderDetails.payment_status)}</Text>
        </View>
      </View>

      {/* Danh sách sản phẩm */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sản phẩm trong đơn hàng</Text>
        <FlatList
          data={orderDetails.items}
          keyExtractor={(item) => item.product_id}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
            {/* Container bao gồm ảnh và nội dung */}
            <View style={styles.productRow}>
              {/* Hình ảnh sản phẩm */}
              <Image
                source={{ uri: item.product_image }}
                style={styles.productImage}
                resizeMode="cover"
              />
              
              {/* Nội dung sản phẩm */}
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.product_name}</Text>
                <Text style={styles.productDetailText}>Số lượng: {item.quantity}</Text>
                <Text style={styles.productDetailText}>Giá mỗi sản phẩm: ¥{item.price}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.totalText}>
                    Tổng: ¥{(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          )}
        />
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white', // Đảm bảo màu nền phù hợp
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#FF5C1C",
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF5C1C",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
productCard: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productRow: {
    flexDirection: "row", // Đặt hướng ngang
    alignItems: "center",
  },
  productImage: {
    width: 100, // Kích thước cố định cho ảnh
    height: 100,
    borderRadius: 8,
    marginRight: 10, // Khoảng cách giữa ảnh và nội dung
  },
  productInfo: {
    flex: 1, // Để chiếm phần còn lại của hàng
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  productDetailText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "flex-start", // Để căn trái tổng giá
    marginTop: 10,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF5C1C",
  },
});

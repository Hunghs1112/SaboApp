import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import api from "../constants/api";
import { router } from "expo-router";
export default function OrderManagementScreen() {
  const { user } = useContext(AuthContext); // Thông tin user từ AuthContext
  const [selectedStatus, setSelectedStatus] = useState("pending"); // Trạng thái được chọn
  const [orders, setOrders] = useState([]); // Danh sách đơn hàng
  const [loading, setLoading] = useState(false);

  const statuses = [
    { title: "Xuất xưởng TQ", status: "pending" },
    { title: "Qua cửa khẩu", status: "shop_pending" },
    { title: "Tới kho VN", status: "shipping" },
    { title: "Xuất kho VN", status: "delivering" },
    { title: "Hoàn thành", status: "completed" },
    { title: "Đã huỷ", status: "cancelled" },
  ];

  // Lấy danh sách đơn hàng theo trạng thái
  useEffect(() => {
    fetchOrdersByStatus(selectedStatus);
  }, [selectedStatus]);

  const fetchOrdersByStatus = async (status) => {
    setLoading(true);
    try {
      const response = await api.get(`/orders/status/${status}?user_id=${user.id}`);
      setOrders(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderOrderCard = ({ item }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderText}>Mã đơn hàng: {item.order_id}</Text>
      <Text style={styles.orderText}>Trạng thái: {item.status}</Text>
      <Text style={styles.orderText}>Tổng tiền: ¥{item.total_amount}</Text>
      <Text style={styles.orderText}>Ngày tạo: {new Date(item.created_at).toLocaleDateString()}</Text>
      <TouchableOpacity
  style={styles.detailButton}
  onPress={() =>
    router.push({
      pathname: "/orderDetail",
      params: { orderId: item.order_id, user_id: user.id },
    })
  }
>
  <Text style={styles.detailButtonText}>Xem chi tiết →</Text>
</TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý đơn hàng</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        {statuses.map((item) => (
          <TouchableOpacity
            key={item.status}
            style={[
              styles.tabItem,
              selectedStatus === item.status && styles.activeTabItem,
            ]}
            onPress={() => setSelectedStatus(item.status)}
          >
            <Text
              style={[
                styles.tabText,
                selectedStatus === item.status && styles.activeTabText,
              ]}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#FF5C1C" />
        ) : orders.length > 0 ? (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.order_id.toString()}
            renderItem={renderOrderCard}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có đơn hàng nào!</Text>
            <TouchableOpacity style={styles.shopButton}>
              <Text style={styles.shopButtonText}>Tiếp tục mua sắm →</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#FF5C1C",
    paddingVertical: 15,
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  tabsWrapper: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    paddingVertical: 10,
  },
  tabItem: {
    flex: 1, // Mỗi tab chiếm 1 phần đều nhau
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeTabItem: {
    backgroundColor: "#FF5C1C",
  },
  tabText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  content: { flex: 1, padding: 10 },
  orderCard: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  orderText: { fontSize: 16, color: "#333", marginBottom: 5 },
  detailButton: {
    backgroundColor: "#FF5C1C",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  detailButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyContainer: { alignItems: "center", justifyContent: "center", flex: 1 },
  emptyText: { fontSize: 16, color: "#666", marginBottom: 20 },
  shopButton: {
    backgroundColor: "#FF5C1C",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  shopButtonText: { color: "#fff", fontWeight: "bold" },
});

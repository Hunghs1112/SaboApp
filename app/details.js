import React, { useEffect, useState, useContext } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView
} from "react-native";
import api from "../constants/api";
import { AuthContext } from "../context/AuthContext"; // Lấy thông tin người dùng
import { router } from "expo-router"; // Điều hướng

export default function DetailsScreen() {
  const [selectedTab, setSelectedTab] = useState("Mua trọn gói"); // Tab hiện tại
  const [cartItems, setCartItems] = useState([]); // Danh sách sản phẩm trong giỏ hàng
  const [wholesaleItems, setWholesaleItems] = useState([]); // Danh sách sản phẩm mua sỉ
  const [loading, setLoading] = useState(false); // Trạng thái loading
  const { user } = useContext(AuthContext); // Lấy thông tin user từ AuthContext
  const [refreshing, setRefreshing] = useState(false); // Thêm trạng thái làm mới
  useEffect(() => {
    if (selectedTab === "Mua trọn gói") {
      fetchCartData(); // Chỉ gọi API khi chuyển sang tab "Mua trọn gói"
    }
  }, [selectedTab]);
  
  const onRefresh = async () => {
    setRefreshing(true); // Bắt đầu trạng thái làm mới
    await fetchCartData(); // Gọi lại API để cập nhật dữ liệu
    setRefreshing(false); // Kết thúc trạng thái làm mới
  };
  // Lấy dữ liệu giỏ hàng từ API
  const fetchCartData = async () => {
    if (!user) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập để xem giỏ hàng.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/cart/${user.id}`); // API lấy giỏ hàng
      const items = response.data; // Lưu dữ liệu giỏ hàng

      // Phân loại sản phẩm theo cart_status
      const retailItems = items.filter(item => item.cart_status === '0'); // Sản phẩm mua lẻ
      const wholesaleItems = items.filter(item => item.cart_status === '1'); // Sản phẩm mua sỉ

      setCartItems(retailItems); // Cập nhật sản phẩm mua lẻ
      setWholesaleItems(wholesaleItems); // Cập nhật sản phẩm mua sỉ
    } catch (error) {
      console.error("Lỗi lấy dữ liệu giỏ hàng:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu giỏ hàng.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    if (!user) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập để xóa sản phẩm.");
      return;
    }
  
    try {
      const response = await api.post("/cart/remove", { id: itemId }); // Gửi id sản phẩm cần xóa
      if (response.status === 200) {
        fetchCartData(); // Tải lại giỏ hàng sau khi xóa
      } else {
        Alert.alert("Lỗi", "Không thể xóa sản phẩm khỏi giỏ hàng.");
      }
    } catch (error) {
      console.error("Lỗi xóa sản phẩm khỏi giỏ hàng:", error);
      Alert.alert("Lỗi", "Không thể xóa sản phẩm. Vui lòng thử lại.");
    }
  };
  // Tính tổng tiền
  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

// Điều hướng đến trang thanh toán
const handleCheckout = () => {
  const itemsToCheckout = selectedTab === "Mua trọn gói" ? cartItems : wholesaleItems;

  if (!itemsToCheckout.length) {
    Alert.alert("Thông báo", `Giỏ hàng của bạn đang trống ở tab ${selectedTab}.`);
    return;
  }

  router.push({ pathname: "/checkout", params: { items: JSON.stringify(itemsToCheckout) } });
};
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
      </View>
  
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "Mua trọn gói" && styles.activeTab]}
          onPress={() => setSelectedTab("Mua trọn gói")}
        >
          <Text style={[styles.tabText, selectedTab === "Mua trọn gói" && styles.activeTabText]}>
            Mua trọn gói
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "Mua sỉ" && styles.activeTab]}
          onPress={() => setSelectedTab("Mua sỉ")}
        >
          <Text style={[styles.tabText, selectedTab === "Mua sỉ" && styles.activeTabText]}>
            Mua sỉ
          </Text>
        </TouchableOpacity>
      </View>
  
      {/* Nội dung */}
      <View style={styles.content}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {loading ? (
            <ActivityIndicator size="large" color="#FF5C1C" />
          ) : selectedTab === "Mua trọn gói" ? (
            cartItems.length > 0 ? (
              cartItems.map((item) => (
                <View key={item.product_id} style={styles.cartItem}>
                  <Image source={{ uri: item.product_image }} style={styles.itemImage} />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.product_name}</Text>
                    <Text style={styles.itemPrice}>¥{item.price}</Text>
                  </View>
                  <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveFromCart(item.id)}
                  >
                    <Text style={styles.removeButtonText}>X</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyCartContainer}>
                <Image
                  source={{
                    uri: "https://cdn-icons-png.flaticon.com/256/1942/1942770.png",
                  }}
                  style={styles.emptyCartImage}
                />
                <Text style={styles.emptyCartText}>Không có sản phẩm nào trong giỏ hàng!</Text>
              </View>
            )
          ) : wholesaleItems.length > 0 ? (
            wholesaleItems.map((item) => (
              <View key={item.product_id} style={styles.cartItem}>
                <Image source={{ uri: item.product_image }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.product_name}</Text>
                  <Text style={styles.itemPrice}>¥{item.price}</Text>
                </View>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveFromCart(item.id)}
                >
                  <Text style={styles.removeButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.placeholderText}>Chưa có sản phẩm mua sỉ!</Text>
          )}
        </ScrollView>
      </View>
  
      {/* Nút Thanh Toán */}
      <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
        <Text style={styles.checkoutText}>Thanh Toán</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
  
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#FF5C1C",
    height: 60,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center" },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "#FF5C1C" },
  tabText: { color: "#666", fontSize: 16 },
  activeTabText: { color: "#FF5C1C", fontWeight: "bold" },
  content: { flex: 1, padding: 10 },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
  },
  itemImage: { width: 50, height: 50, borderRadius: 5, marginRight: 10 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: "bold" },
  itemPrice: { fontSize: 14, color: "#FF5C1C" },
  itemQuantity: { fontSize: 14, fontWeight: "bold" },
  totalText: { textAlign: "right", fontSize: 16, fontWeight: "bold", marginTop: 10 },
  emptyCartContainer: { alignItems: "center", marginTop: 50 },
  emptyCartImage: { width: 150, height: 150, marginBottom: 20 },
  emptyCartText: { fontSize: 16, color: "#666" },
  placeholderText: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#666" },
  checkoutButton: {
    backgroundColor: "#FF5C1C",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 10,
  },
  checkoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#FF5C1C",
    borderRadius: 10,
    padding: 4,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
});

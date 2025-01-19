import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
  Modal,
  SafeAreaView
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { AuthContext } from "../context/AuthContext";
import api from "../constants/api";
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect

export default function CheckoutScreen() {
  const { user } = useContext(AuthContext); // Lấy user từ AuthContext
  const { items } = useLocalSearchParams(); // Lấy dữ liệu sản phẩm từ params
  const [cartItems, setCartItems] = useState([]); // Dữ liệu sản phẩm trong giỏ hàng
  const [address, setAddress] = useState(null); // Địa chỉ mặc định
  const [loading, setLoading] = useState(true); // Trạng thái loading
  const [paymentMethod, setPaymentMethod] = useState("Tiền Việt Nam Đồng"); // Mặc định là VND
  const [notes, setNotes] = useState(""); // Ghi chú cho đơn hàng
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [depositRate, setDepositRate] = useState(0); // Tỷ lệ cọc từ DB
  const [depositAmount, setDepositAmount] = useState(0); // Tiền cọc
  const [totalAmount, setTotalAmount] = useState(0); // Tổng giá trị đơn hàng
  const [balance, setBalance] = useState(0); // Số dư tài khoản
  const [balanceVND, setBalanceVND] = useState(0); // Số dư tài khoản VND
  const [exchangeRate, setExchangeRate] = useState(0); // Tỷ giá

  const handleOpenModal = () => {
    setIsModalVisible(true);
    handleCalculateDeposit(); // Tính toán cọc khi mở modal
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    try {
      const parsedItems = JSON.parse(items || "[]");
      console.log("Dữ liệu nhận được:", parsedItems); // Debug để kiểm tra dữ liệu
      setCartItems(parsedItems);
    } catch (error) {
      console.error("Lỗi khi parse items:", error);
      setCartItems([]);
    }
  }, [items]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchDefaultAddress = async () => {
        try {
          const response = await api.get(`/addresses/default/${user.id}`);
          
          // Check if the response contains the message when no default address is found
          if (response.data.message && response.data.message === "Không tìm thấy địa chỉ mặc định.") {
            // Set address to null, don't show any error
            setAddress(null);
          } else {
            // If an address is found, set it
            setAddress(response.data);
          }
        } catch (error) {
          // Handle any other errors (not the "no address found" case)
          console.error("Lỗi khi lấy địa chỉ mặc định:", error);
          setAddress(null);
        } finally {
          setLoading(false); // Ensure loading is turned off
        }
      };

      const fetchData = async () => {
        if (!user) return; // Ngăn không chạy nếu user là null
        try {
          // Lấy số dư tài khoản từ API
          const balanceResponse = await api.get(`/account/${user.id}/balance`);
          setBalanceVND(balanceResponse.data.balance);

          // Lấy tỷ giá từ API rate
          const rateResponse = await api.get("/rate");
          setExchangeRate(rateResponse.data.exchange_rate);
        } catch (err) {
          console.error("Lỗi khi lấy dữ liệu:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchDefaultAddress();
      fetchData();
    }, [user]) // Chạy lại khi user thay đổi hoặc khi trang nhận được focus
  );

  // Tính tổng tiền
  const calculateTotal = () =>
    cartItems.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      return total + price * quantity;
    }, 0).toFixed(2);

  const calculateTotalVND = () => {
    const totalAmount = calculateTotal();
    return (totalAmount * exchangeRate).toFixed(0);
  };

  const handlePlaceOrder = async () => {
    if (!address) {
      Alert.alert("Lỗi", "Vui lòng thêm địa chỉ giao hàng.");
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert("Lỗi", "Giỏ hàng của bạn trống.");
      return;
    }

    try {
      const totalAmount = calculateTotal();

      // Tạo đơn hàng
      const orderResponse = await api.post("/orders/create", {
        user_id: user.id,
        total_amount: totalAmount,
        address_id: address.id,
        payment_method: paymentMethod,
        notes: notes || "",
      });

      const orderId = orderResponse.data.order_id;

      if (!orderId) {
        throw new Error("Không thể tạo đơn hàng. Vui lòng thử lại.");
      }
      
      // Thêm sản phẩm vào order_items
      const itemsResponse = await api.post("/orders/add-items", {
        order_id: orderId,
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          product_name: item.product_name,
          product_image: item.product_image,
        })),
      });

      if (itemsResponse.status !== 201) {
        throw new Error("Không thể thêm sản phẩm vào đơn hàng.");
      }

      // Xóa giỏ hàng
      const cartResponse = await api.delete(`/cart/${user.id}`);
      if (cartResponse.status !== 200) {
        console.warn("Không thể xóa giỏ hàng, nhưng đơn hàng đã được đặt.");
      }
   // Reset relevant states after successful order
   setCartItems([]);  // Clear cart
   setAddress(null);  // Clear address
   setNotes("");  // Clear notes
   setPaymentMethod("Tiền Việt Nam Đồng");  // Reset payment method
   setTotalAmount(0);  // Reset total amount
   Alert.alert(
    "Thanh toán thành công!",
    "Nhà phân phối đang chuẩn bị kiện hàng."
  );
      router.push("/"); // Điều hướng về trang chính hoặc trang danh sách đơn hàng
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error.message || error);
      Alert.alert("Lỗi", error.message || "Đặt hàng thất bại, vui lòng thử lại.");
    }
  };

  const handleCalculateDeposit = async () => {
    try {
      const response = await api.get("/deposit-rates");
      const rates = response.data;
      let rate;

      const applicableRate = rates.find((r) => {
        if (r.max_value) {
          return totalAmount >= r.min_value && totalAmount < r.max_value;
        } else {
          return totalAmount >= r.min_value;
        }
      });

      if (applicableRate) {
        rate = applicableRate.rate;
      } else {
        rate = 0.20;
      }

      setDepositRate(rate);
      setDepositAmount(calculateTotalVND() * rate);
    } catch (error) {
      console.error("Lỗi khi lấy tỷ lệ cọc:", error);
      Alert.alert("Lỗi", "Không thể lấy tỷ lệ cọc. Vui lòng thử lại.");
    }
  };

  const handlePayment = async () => {
    try {
      const paymentResponse = await api.post("/account/deduct-deposit", {
        user_id: user.id,
        depositAmount: depositAmount,
      });

      if (paymentResponse.status === 200) {
        setBalance(balance - depositAmount); // Giảm số dư còn lại
        handlePlaceOrder(); // Thực hiện đặt hàng
      } else {
        throw new Error("Thanh toán cọc thất bại.");
      }
    } catch (error) {
      console.error("Lỗi thanh toán cọc:", error.message || error);
      Alert.alert("Thanh toán thất bại.", "Số dư trong ví không đủ\n để thực hiện thanh toán");
    }
  };
    
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Xác Nhận Thanh Toán</Text>
    
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF5C1C" />
            <Text>Đang tải...</Text>
          </View>
        ) : (
          <>
{/* Địa chỉ giao hàng */}
<View style={styles.addressSection}>
  <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
  {address ? (
      <View>
      <Text>
        {address.full_name}, {address.phone}{"\n"}
        {address.address_line1}, {address.city}, {address.country}
      </Text>
      {/* Thêm nút "Thay Đổi" */}
      <TouchableOpacity
        style={styles.changeAddressButton}
        onPress={() => router.push("/address")} // Điều hướng tới trang thay đổi địa chỉ
      >
        <Text style={styles.changeAddressButtonText}>Thay Đổi</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <View>
      <Text>Không có địa chỉ mặc định.</Text>
      <TouchableOpacity
        style={styles.addAddressButton}
        onPress={() => router.push("/address")} // Điều hướng tới trang thêm địa chỉ
      >
        <Text style={styles.addAddressButtonText}>Thêm Địa Chỉ</Text>
      </TouchableOpacity>
    </View>
  )}
</View>
<FlatList
  data={cartItems}
  keyExtractor={(item, index) =>
    item?.product_id?.toString() || index.toString()
  }
  renderItem={({ item }) => (
    <View style={styles.itemCard}>
      {/* Ảnh sản phẩm */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: item.product_image || "https://via.placeholder.com/150",
          }}
          style={styles.itemImage}
        />
      </View>

      {/* Thông tin sản phẩm */}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>
          {item.product_name || "Không có tên sản phẩm"}
        </Text>
        <Text style={styles.itemQuantity}>
          Số lượng: x{item.quantity || 1}
        </Text>
        <Text style={styles.itemPrice}>
          Giá: ¥
          {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
        </Text>
      </View>
    </View>
  )}
  ListEmptyComponent={<Text>Không có sản phẩm nào trong giỏ hàng.</Text>}
/>   
            {/* Ghi chú */}
            <TextInput
              style={styles.notesInput}
              placeholder="Ghi chú cho đơn hàng"
              value={notes}
              onChangeText={setNotes}
            />
    
            {/* Tổng tiền */}
            <Text style={styles.totalText}>Tổng tiền: ¥{calculateTotal()}</Text>
    
            {/* Nút đặt hàng */}
            <TouchableOpacity style={styles.orderButton} onPress={handleOpenModal}>
              <Text style={styles.orderButtonText}>Lên Đơn Ngay</Text>
            </TouchableOpacity>
          </>
        )}
        <Modal
  visible={isModalVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={handleCloseModal}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Thanh Toán Cọc</Text>
      <Text style={styles.modalText}>
        Tổng đơn hàng: ¥{(calculateTotalVND() / exchangeRate).toLocaleString()}
      </Text>
      <Text style={styles.modalText}>
        Tỷ lệ cọc: {(depositRate * 100).toFixed(0)}%
      </Text>
      <Text style={styles.modalText}>
        Số tiền cọc: ¥{(depositAmount / exchangeRate).toLocaleString()}
      </Text>
      <Text style={styles.modalText}>
        Số dư tài khoản: ¥{(balanceVND/exchangeRate).toLocaleString()}
      </Text>

      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCloseModal}
        >
          <Text style={styles.buttonText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
          <Text style={styles.buttonText}>Thanh Toán</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  addressSection: { marginBottom: 20, padding: 10, backgroundColor: "#f9f9f9", borderRadius: 5 },
  sectionTitle: { fontWeight: "bold", marginBottom: 10 },
  itemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  itemText: { fontSize: 16 },
  totalText: { fontSize: 18, fontWeight: "bold", textAlign: "right", marginVertical: 10 },
  notesInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    fontSize: 16,
  },
  orderButton: {
    backgroundColor: "#FF5C1C",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  orderButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  imageContainer: {
    marginRight: 10,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    resizeMode: "cover",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: "#FF5C1C",
    marginTop: 5,
  },
  paymentMethodSection: {
    marginVertical: 20,
  },
  paymentOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  paymentOption: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  selectedPaymentOption: {
    backgroundColor: "#FF5C1C",
    borderColor: "#FF5C1C",
  },
  paymentOptionText: {
    fontSize: 14,
    color: "#333",
  },
  selectedPaymentOptionText: {
    color: "#fff",
    fontWeight: "bold"},

    addAddressButton: {
      backgroundColor: "#FF5C1C",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      alignItems: "center",
      marginTop: 10,
    },
    addAddressButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
    },
    orderButton: {
      backgroundColor: "#FF5C1C",
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
    },
    orderButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      width: "90%",
      backgroundColor: "#fff",
      borderRadius: 10,
      padding: 20,
    },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
    modalText: { fontSize: 16, marginVertical: 5 },
    modalButtons: { flexDirection: "row", marginTop: 20 },
    cancelButton: {
      flex: 1,
      backgroundColor: "#ccc",
      padding: 10,
      borderRadius: 5,
      marginRight: 10,
    },
    payButton: {
      flex: 1,
      backgroundColor: "#FF5C1C",
      padding: 10,
      borderRadius: 5,
    },
    buttonText: { textAlign: "center", color: "#fff", fontSize: 16 },
    changeAddressButton: {
      backgroundColor: "#FF5C1C",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      alignItems: "center",
      marginTop: 10,
    },
    changeAddressButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
    },
});

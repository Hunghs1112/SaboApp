import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  SafeAreaView
} from "react-native";
import api from "../constants/api";
import { AuthContext } from "../context/AuthContext";

export default function AddressScreen() {
  const { user } = useContext(AuthContext);
  const [addresses, setAddresses] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    fetchAddresses();
  }, []);
  const handleSetDefaultAddress = async (addressId) => {
    try {
      const response = await api.post("/addresses/default", {
        user_id: user.id,
        address_id: addressId,
      });
  
      if (response.status === 200) {

        fetchAddresses();
      } else {
        Alert.alert("Lỗi", "Không thể đặt địa chỉ làm mặc định.");
      }
    } catch (error) {
      console.error("Lỗi khi đặt địa chỉ mặc định:", error);
      Alert.alert("Lỗi", "Không thể đặt địa chỉ làm mặc định. Vui lòng thử lại.");
    }
  };
  const fetchAddresses = async () => {
    try {
      const response = await api.get(`/addresses/${user.id}`);
      setAddresses(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy địa chỉ:", error);
    }
  };

  const handleAddAddress = async () => {
    try {
      await api.post("/addresses", {
        user_id: user.id,
        full_name: fullName,
        phone,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        postal_code: postalCode,
        country,
        is_default: false,
      });
      Alert.alert("Thành công", "Địa chỉ đã được thêm thành công!");
      setIsModalVisible(false); 
      fetchAddresses(); 
    } catch (error) {
      console.error("Lỗi khi thêm địa chỉ:", error);
      Alert.alert("Lỗi", "Không thể thêm địa chỉ, vui lòng thử lại!");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
     <Text style={styles.title}>Địa Chỉ Của Tôi</Text>

     {addresses.length > 0 ? (
  <FlatList
    data={addresses}
    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
    renderItem={({ item }) => (
      <View style={styles.addressCard}>
        <Text style={styles.name}>{item.full_name ? item.full_name : "Không có tên"}</Text>
        <Text>{item.phone ? item.phone : "Không có số điện thoại"}</Text>
        <Text>{item.address_line1 ? item.address_line1 : "Không có địa chỉ"}</Text>
        <Text>
          {item.city ? item.city : "Không có thành phố"},{' '}
          {item.postal_code ? item.postal_code : "Không có Postal Code"},{' '}
          {item.country ? item.country : "Không có quốc gia"}
        </Text>

        {item.is_default ? (
          <Text style={styles.default}>Mặc định</Text>
        ) : (
          <TouchableOpacity
            style={styles.setDefaultButton}
            onPress={() => handleSetDefaultAddress(item.id)}
          >
            <Text style={styles.setDefaultButtonText}>Đặt làm mặc định</Text>
          </TouchableOpacity>
        )}
      </View>
    )}
  />
) : (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>Không có địa chỉ nào</Text>
  </View>
)}



      <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Thêm Địa Chỉ</Text>
      </TouchableOpacity>

      
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm Địa Chỉ Mới</Text>
            <TextInput
  style={styles.input}
  placeholder="Họ và Tên"
  placeholderTextColor="#444"
  value={fullName}
  onChangeText={setFullName}
/>
<TextInput
  style={styles.input}
  placeholder="Số Điện Thoại"
  placeholderTextColor="#444"
  value={phone}
  onChangeText={setPhone}
  keyboardType="phone-pad"
/>
<TextInput
  style={styles.input}
  placeholder="Địa chỉ 1"
  placeholderTextColor="#444"
  value={addressLine1}
  onChangeText={setAddressLine1}
/>
<TextInput
  style={styles.input}
  placeholder="Địa chỉ 2 (không bắt buộc)"
  placeholderTextColor="#444"
  value={addressLine2}
  onChangeText={setAddressLine2}
/>
<TextInput
  style={styles.input}
  placeholder="Thành phố"
  placeholderTextColor="#444"
  value={city}
  onChangeText={setCity}
/>
<TextInput
  style={styles.input}
  placeholder="Mã Bưu Điện"
  placeholderTextColor="#444"
  value={postalCode}
  onChangeText={setPostalCode}
  keyboardType="number-pad"
/>
<TextInput
  style={styles.input}
  placeholder="Quốc gia"
  placeholderTextColor="#444"
  value={country}
  onChangeText={setCountry}
/>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddAddress}>
                <Text style={styles.buttonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  addressCard: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: "bold" },
  default: { color: "#FF5C1C", fontWeight: "bold", marginTop: 5 },
  addButton: {
    backgroundColor: "#FF5C1C",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
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
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  saveButton: {
    backgroundColor: "#FF5C1C",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: { color: "#fff", textAlign: "center", fontSize: 16 },
  setDefaultButton: {
    backgroundColor: "#FF5C1C",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  setDefaultButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  
});

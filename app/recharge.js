import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Image,
  SafeAreaView
} from "react-native";
import api from "../constants/api";
import { useLocalSearchParams, router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native"; 
import { AuthContext } from "../context/AuthContext";

export default function RechargeScreen() {
  const { userId } = useLocalSearchParams(); // Lấy userId từ params
  const [amount, setAmount] = useState(""); // Số tiền nạp (VNĐ)
  const [addInfo, setAddInfo] = useState("nap tien"); // Nội dung chuyển tiền
  const [showModal, setShowModal] = useState(false); // Trạng thái modal QR
  const [qrCodeURL, setQrCodeURL] = useState(""); // URL QR Code
  const [exchangeRate, setExchangeRate] = useState(3500); // Tỷ giá (VNĐ -> CNY)
  const [bankDetails, setBankDetails] = useState({ bank_code: "", account_number: "" }); // Thông tin tài khoản ngân hàng
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); // Trạng thái vô hiệu hóa nút
  const { user } = useContext(AuthContext); 
  const [lastPressTime, setLastPressTime] = useState(null); // Thời gian bấm nút gần nhất

  const sendTelegramMessage = async (username, userId, amount, addInfo) => {
    const botToken = "7660455671:AAFkfiTeJjviLsd_Egp0sK84cSD-mTM3cBs";
    const chatId = "-4695344815";
  
    const message = `
    🌟 *Yêu cầu nạp tiền* 🌟
    - Tài khoản: ${username}
    - User ID: ${userId}
    - Số tiền nạp: ${parseInt(amount).toLocaleString()} VNĐ
    - Nội dung: ${addInfo}
    `;
  
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown", // Dùng Markdown để làm nổi bật nội dung
        }),
      });
  
      if (!response.ok) {
        console.error("Lỗi gửi tin nhắn Telegram:", response.statusText);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API Telegram:", error);
    }
  };

  // Lấy thông tin ngân hàng từ backend
  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const response = await api.get("/bank/details");
        setBankDetails(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin ngân hàng:", error);
        Alert.alert("Lỗi", "Không thể tải thông tin ngân hàng.");
      }
    };

    fetchBankDetails();
  }, []);

  const handleSubmit = () => {
    if (!amount || isNaN(amount) || parseInt(amount) < 1000) {
      Alert.alert("Lỗi", "Vui lòng nhập số tiền hợp lệ (>= 1000).");
      return;
    }
  
    const url = `https://qrcode.io.vn/api/generate/${bankDetails.bank_code}/${bankDetails.account_number}/${parseInt(amount)}/${addInfo.replace(/\s+/g, "-")}`;
  
    setQrCodeURL(url);
    setShowModal(true);
  
    // Vô hiệu hóa nút "Nạp tiền" trong 15 giây
    setIsButtonDisabled(true);
    setTimeout(() => {
      setIsButtonDisabled(false);
    }, 15000);
  };

  const handleConfirmTransfer = async () => {
    const currentTime = new Date().getTime(); // Thời gian hiện tại (ms)
  
    // Kiểm tra nếu chưa đủ 15 giây kể từ lần bấm cuối
    if (lastPressTime && currentTime - lastPressTime < 15000) {
      const remainingTime = 15 - Math.floor((currentTime - lastPressTime) / 1000);
      Alert.alert("Vui lòng chờ", `Bạn phải đợi thêm ${remainingTime} giây trước khi thực hiện yêu cầu.`);
      return;
    }
  
    try {
      if (!amount || parseFloat(amount) <= 0) {
        Alert.alert("Lỗi", "Số tiền nạp phải lớn hơn 0.");
        return;
      }
  
      const username = user.username; // Thay bằng logic lấy username từ state hoặc backend
  
      const response = await api.post("/recharge/request", {
        user_id: userId, // ID người dùng
        amount: parseFloat(amount), // Số tiền nạp
      });
  
      if (response.status === 201) {
        setShowModal(false); // Đóng modal
        // Gửi tin nhắn đến Telegram
        await sendTelegramMessage(username, userId, amount, addInfo);
  
        Alert.alert("Thành công", "Yêu cầu nạp tiền đã được gửi!");
       
  
        // Lưu thời gian bấm nút
        setLastPressTime(currentTime);
  
        // Đổi trạng thái nút và hẹn giờ 15 giây
        setIsButtonDisabled(true);
        setTimeout(() => {
          setIsButtonDisabled(false);
        }, 15000);
      } else {
        throw new Error("Không thể xử lý yêu cầu");
      }
    } catch (err) {
      console.error("Lỗi khi gửi yêu cầu nạp tiền:", err);
      Alert.alert("Lỗi", "Không thể gửi yêu cầu.\nVui lòng thử lại.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Nạp tiền vào tài khoản</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập số tiền (VNĐ)"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      {/* Hiển thị số tiền quy đổi sang CNY */}
      {amount && (
        <Text style={styles.exchangeText}>
          Tương đương: {(parseFloat(amount) / exchangeRate).toFixed(2)} ¥
        </Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Nội dung chuyển tiền"
        value={addInfo}
        onChangeText={setAddInfo}
      />

<TouchableOpacity
  style={[
    styles.submitButton,
    isButtonDisabled && { backgroundColor: "#ddd" }, // Thay đổi màu khi bị vô hiệu hóa
  ]}
  onPress={handleSubmit}
  disabled={isButtonDisabled} // Vô hiệu hóa nút
>
  <Text style={styles.submitButtonText}>
    {isButtonDisabled ? "Vui lòng chờ 15s cho yêu cầu tiếp theo" : "Nạp tiền"}
  </Text>
</TouchableOpacity>

      {/* Modal QR */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Quét mã QR để chuyển khoản</Text>

            {/* Thông tin số tiền */}
            <Text style={styles.modalText}>
              Số tiền nạp: {parseInt(amount).toLocaleString()} đ
            </Text>
            <Text style={styles.modalText}>
              Tương đương: {(parseFloat(amount) / exchangeRate).toFixed(2)} ¥
            </Text>
            <Text style={styles.modalText}>Nội dung: {addInfo}</Text>

            {/* QR code */}
            {qrCodeURL && (
              <Image source={{ uri: qrCodeURL }} style={styles.qrImage} />
            )}

<TouchableOpacity
  style={styles.confirmButton}
  onPress={handleConfirmTransfer}
>
  <Text style={styles.confirmButtonText}>Tôi đã chuyển khoản</Text>
</TouchableOpacity>
            <Text style={styles.infoText}>Hãy chờ vài giây sau khi xác nhận </Text>
            <Text style={styles.confirmButtonText}>Hãy chờ vài giây sau khi xác nhận </Text>
            {/* Nút hủy */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  exchangeText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#FF5C1C",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  qrImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#F44336",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  infoText:  {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
});

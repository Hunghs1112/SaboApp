import React, { useContext, useState, useEffect } from "react";
import { Text, View, StyleSheet, ScrollView, Image, Linking, TouchableOpacity, ActivityIndicator, SafeAreaView } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import api from '../constants/api'; // Import API instance
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { router, useRouter } from 'expo-router';
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import DeviceInfo from 'react-native-device-info'; // Import react-native-device-info

export default function AccountScreen() {
  const { user, logout } = useContext(AuthContext); // Logout function from AuthContext
  const [showBalance, setShowBalance] = useState(false); // State để ẩn/hiện số dư
  const [rate, setRate] = useState(null); 
  const [error, setError] = useState(null);
  const [balanceVND, setBalanceVND] = useState(0); // Số dư tài khoản VND
  const [exchangeRate, setExchangeRate] = useState(0); // Tỷ giá
  const [loading, setLoading] = useState(true); // Loading state
  const [apiVersion, setApiVersion] = useState(null); // State to store the version from API
  const [isVersionMatch, setIsVersionMatch] = useState(false); // State to track version match

  const serviceItems = [
    { title: "Cơ cấu biểu phí", icon: "document-text-outline", link: "https://help.sabomall.com/bieu-phi/co-cau-bieu-phi" },
    { title: "Quy định chính sách", icon: "newspaper-outline", link: "https://help.sabomall.com/faq/cau-hoi-thuong-gap/5.-chinh-sach" },
    { title: "Hỏi đáp", icon: "help-circle-outline", link: "https://help.sabomall.com/faq/cau-hoi-thuong-gap" },
    { title: "Hướng dẫn", icon: "book-outline", link: "https://help.sabomall.com/huong-dan/tren-may-tinh/huong-dan-dat-don-hang-tren-sabomall" },
    { title: "Trợ giúp", icon: "headset-outline", link: "https://help.sabomall.com/huong-dan/tren-dien-thoai-app-mobile" },
  ]
  // Fetch device info and version
  useEffect(() => {
    const fetchDeviceInfo = async () => {
      const version = await DeviceInfo.getVersion();
      setApiVersion(version); // Store device version
      // Fetch the API version
      try {
        const response = await api.get("/version");
        const apiVersion = response.data.version;
        setIsVersionMatch(apiVersion === version); // Compare API version with device version
      } catch (err) {
        console.error("Error fetching version:", err);
      }
    };

    fetchDeviceInfo(); // Call fetchDeviceInfo on mount
  }, []);

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance); // Đổi trạng thái ẩn/hiện số dư
  };
  
  const handleLogout = () => {
    logout();
  };
  const [links, setLinks] = useState([]); // State to store the links (Zalo, Telegram, etc.)

  // Fetch the links from the backend
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await api.get("/get-links"); // Fetch links from this endpoint
        setLinks([
          {
            title: "Chat Zalo",
            type: "image",
            image:
              "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/2048px-Icon_of_Zalo.svg.png",
            url: response.data.zalo_link, // Dynamically use Zalo link from API
          },
          {
            title: "Telegram",
            type: "image",
            image:
              "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Telegram_2019_Logo.svg/2048px-Telegram_2019_Logo.svg.png",
            url: response.data.telegram_link, // Dynamically use Telegram link from API
          },
        ]);
      } catch (error) {
        console.error("Error fetching links:", error);
        Alert.alert("Error", "Unable to fetch chat links.");
      }
    };

    fetchLinks();
  }, []);
  const handlePress = (url) => {
    if (url) {
      // Open the link using Linking API
      Linking.openURL(url).catch((err) => console.error("Failed to open link:", err));
    } else {
      Alert.alert("Error", "Link is not available.");
    }
  };
  
  useFocusEffect(
    useCallback(() => {
      const fetchRate = async () => {
        try {
          const response = await api.get("/rate");
          console.log("Dữ liệu từ API:", response.data);
          setRate(response.data); // Lưu tỷ giá
        } catch (err) {
          console.error("Lỗi khi lấy tỷ giá:", err);
          setError("Không thể tải tỷ giá");
        }
      };
  
      const fetchData = async () => {
        if (!user) return;
        try {
          const balanceResponse = await api.get(`/account/${user.id}/balance`);
          setBalanceVND(balanceResponse.data.balance);
  
          const rateResponse = await api.get("/rate");
          setExchangeRate(rateResponse.data.exchange_rate);
        } catch (err) {
          console.error("Lỗi khi lấy dữ liệu:", err);
        } finally {
          setLoading(false);
        }
      };
  
      fetchRate();
      fetchData();
  
      // Cleanup function nếu cần
      return () => {
        setError(null); // Ví dụ reset lỗi
      };
    }, [user]) // Thêm user hoặc các dependency cần thiết
  );
  
  const formatCurrency = (value) => {
    return value.toLocaleString("vi-VN") + "đ"; // Định dạng theo chuẩn tiếng Việt
  };

  return (
    
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={{ uri: user?.avatar || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYPRLSISP2uoEdGxNPVFrz02gI2KWiJ_VwNA&s" }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{user?.username || "Tài khoản của bạn"}</Text>
        </View>
        <TouchableOpacity style={styles.settingsIcon}>
          <Icon name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Tỷ giá */}
      <View style={styles.rateBox}>
      {/* Hiển thị lỗi nếu xảy ra vấn đề */}
      {error ? (
        <Text style={styles.rateText}>{error}</Text>
      ) : rate ? (
        <Text style={styles.rateText}>
          Tỷ giá hiện tại: ¥1 = {formatCurrency(rate.exchange_rate)}
        </Text>
      ) : (
        <Text style={styles.rateText}>Đang tải dữ liệu...</Text>
      )}
    </View>


      {/* Nội dung chính */}
      <ScrollView contentContainerStyle={styles.mainContent}>
{/* Đơn hàng */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Đơn hàng</Text>
  <View style={styles.row}>
    {[
      { title: "Đã Đặt", icon: "wallet-outline", status: "pending" },
      { title: "Xuất Xưởng Trung Quốc", icon: "storefront-outline", status: "shop_pending" },
      { title: "Vận chuyển quốc tế", icon: "airplane-outline", status: "shipping" },
      { title: "Đang giao", icon: "boat-outline", status: "delivering" },
    ].map((item, index) => (
      <TouchableOpacity
        key={index}
        style={styles.menuItem}
        onPress={() =>
          router.push({
            pathname: "/orderManage",
            params: { status: item.status },
          })
        } // Điều hướng tới trang quản lý đơn hàng
      >
        <Icon name={item.icon} size={30} color="#ff5c1c" />
        <Text style={styles.menuText}>{item.title}</Text>
      </TouchableOpacity>
    ))}
  </View>
</View>

{!isVersionMatch && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Tài khoản trả trước{" "}
              <TouchableOpacity onPress={toggleBalanceVisibility}>
                <Icon
                  name={showBalance ? "eye-outline" : "eye-off-outline"}
                  size={24}
                  color="#333"
                />
              </TouchableOpacity>
            </Text>
          </View>

          {/* Display balance in VND and CNY */}
          {loading ? (
            <ActivityIndicator size="small" color="#ff5c1c" />
          ) : (
            <View>
              <View style={styles.row}>
                {/* Nhân Dân Tệ */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Nhân Dân Tệ</Text>
                  <Text style={styles.cardBalance}>
                    {showBalance
                      ? `${(balanceVND / exchangeRate).toFixed(2)} ¥`
                      : "********"}
                  </Text>
                </View>
              </View>

              {/* Recharge Button */}
              <TouchableOpacity
                style={styles.rechargeButton}
                onPress={() => router.push({ pathname: "/recharge", params: { userId: user.id } })}
              >
                <Text style={styles.rechargeButtonText}>Nạp tiền</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tiện ích</Text>
      <View style={styles.row}>
        {[
          { title: "Địa chỉ", icon: "location-outline", route: "/address" },
          { title: "Khiếu nại", icon: "chatbubble-ellipses-outline" },
          { title: "Phiếu giao", icon: "document-outline" },
          { title: "Voucher của tôi", icon: "pricetag-outline" },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => {
              if (item.route) {
                router.push(item.route); // Điều hướng đến route
              }
            }}
          >
            <Icon name={item.icon} size={30} color="#ff5c1c" />
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
      </View>

      <View style={styles.container}>
      {/* Liên hệ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Liên hệ</Text>
        <View style={styles.row}>
          {[
            {
              title: "Chat Zalo",
              type: "image",
              image:
                "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/2048px-Icon_of_Zalo.svg.png",
              url: "https://zalo.me", // Link Zalo
            },
            {
              title: "Telegram",
              type: "image",
              image:
                "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Telegram_2019_Logo.svg/2048px-Telegram_2019_Logo.svg.png",
              url: "https://telegram.org", // Link Telegram
            },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.linkItem}
              onPress={() => handlePress(item.url)} // Xử lý bấm để mở link
            >
              {item.type === "image" ? (
                <Image source={{ uri: item.image }} style={styles.menuImage} />
              ) : (
                <Icon name={item.icon} size={40} color="#ff5c1c" />
              )}
              <Text style={styles.menuText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
    
        <View style={styles.section}>
      <Text style={styles.sectionTitle}>Dịch vụ</Text>
      <View style={styles.row}>
        {serviceItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => handlePress(item.link)}
          >
            <Icon name={item.icon} size={30} color="#ff5c1c" />
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>

        {/* Nút đăng xuất */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white", // Nền xám nhạt
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  settingsIcon: {
    padding: 8,
  },
  rateBox: {
    marginHorizontal: 4, // Giảm khoảng cách bên trái và phải
    marginTop: 4, // Khoảng cách trên giữa header và tỷ giá
    backgroundColor: "#F66F61", // Màu đỏ cho tỷ giá
    borderRadius: 10, // Bo góc
    padding: 10,
    alignItems: "center",
  },
  rateText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  mainContent: {
    padding: 4, // Giảm padding tổng thể
  },
  section: {
    backgroundColor: "#FFF", // Nền trắng cho mỗi mục
    borderRadius: 10, // Bo góc
    padding: 10, // Padding bên trong mỗi mục
    marginBottom: 4, // Khoảng cách giữa các mục
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row", // Sắp xếp các thẻ từ trái sang phải
    flexWrap: "wrap", // Để các phần tử tự xuống dòng khi không đủ không gian
    justifyContent: "space-between", // Phân bổ đều khoảng cách giữa các thẻ
  },
  linkItem: {
    alignItems: "center",
    width: "48%", // Đảm bảo hai thẻ trên một dòng
    backgroundColor: "#ffffff",
  },
  menuItem: {
    width: "23%",
    alignItems: "center",
    marginBottom: 10, // Khoảng cách dưới mỗi mục
  },
  menuImage: {
    width: 38, // Kích thước ảnh
    height: 38, // Kích thước ảnh
    borderRadius: 20, // Bo góc ảnh tròn
    marginBottom: 5,
  },
  menuText: {
    marginTop: 5,
    fontSize: 14,
    textAlign: "center",
    color: "#333",
  },
  card: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  cardBalance: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  logoutButton: {
    backgroundColor: "#ff5c1c",
    borderRadius: 10,
    marginTop: 10,
    padding: 15,
    alignItems: "center",
    elevation: 2,
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  rechargeButton: {
    backgroundColor: "#FF5C1C",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
    elevation: 3,
  },
  rechargeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  SafeAreaView
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router"; // Sử dụng router để điều hướng
import { searchProducts } from "../constants/alibabaApi"; // Hàm gọi API tìm kiếm

export default function SearchScreen() {
  const [searchKeyword, setSearchKeyword] = useState(""); // Từ khóa tìm kiếm
  const [results, setResults] = useState([]); // Kết quả tìm kiếm
  const [loading, setLoading] = useState(false); // Trạng thái loading
  const router = useRouter(); // Router để điều hướng

  const handleSearch = async () => {
    const trimmedKeyword = searchKeyword.trim();

    if (!trimmedKeyword) {
      alert("Vui lòng nhập từ khóa tìm kiếm!");
      return;
    }

    setLoading(true);

    try {
      const response = await searchProducts(trimmedKeyword, 0, 20, '{"price":"desc"}');
      const responseData = response?.data?.data || []; // Lấy danh sách sản phẩm
      setResults(responseData);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Thanh tìm kiếm */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Nhập từ khóa tìm kiếm..."
          value={searchKeyword}
          onChangeText={setSearchKeyword}
          onSubmitEditing={handleSearch} // Thực hiện tìm kiếm khi nhấn Enter
        />
        <TouchableOpacity onPress={handleSearch}>
          <Icon name="search-outline" size={24} color="#ff5c1c" />
        </TouchableOpacity>
      </View>

      {/* Hiển thị kết quả tìm kiếm */}
      {loading ? (
        <ActivityIndicator size="large" color="#ff5c1c" style={styles.loader} />
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.offerId.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => router.push(`/productDetail?id=${item.offerId}`)} // Điều hướng sang trang chi tiết sản phẩm
            >
              <Image source={{ uri: item.imageUrl || "https://via.placeholder.com/150" }} style={styles.resultImage} />
              <View style={styles.resultDetails}>
                <Text style={styles.resultName}>{item.subjectTrans || item.subject || "Không có tiêu đề"}</Text>
                <Text style={styles.resultPrice}>
                  Giá: {item.priceInfo?.price || "Liên hệ để biết giá"}
                </Text>
                <Text style={styles.resultSold}>
                  Đã bán: {item.monthSold || 0} sản phẩm
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noResultsText}>Không có kết quả nào được tìm thấy.</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 8,
  },
  loader: {
    marginTop: 16,
  },
  resultItem: {
    flexDirection: "row",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
  },
  resultImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  resultDetails: {
    flex: 1,
    justifyContent: "center",
  },
  resultName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  resultPrice: {
    fontSize: 14,
    color: "#ff5c1c",
  },
  resultSold: {
    fontSize: 14,
    color: "#666",
  },
  noResultsText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});

import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Image, SafeAreaView} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { searchProducts } from "../constants/alibabaApi";
import { useRouter, router } from "expo-router";
export default function SearchResults() {
  const [keyword, setKeyword] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKeywordAndResults = async () => {
      try {
        const storedKeyword = await AsyncStorage.getItem("searchKeyword");
        console.log("Retrieved keyword from AsyncStorage:", storedKeyword);

        if (storedKeyword) {
          setKeyword(storedKeyword);
          await fetchSearchResults(storedKeyword);
        } else {
          console.log("No keyword found.");
          setError("Không tìm thấy từ khóa.");
        }
      } catch (error) {
        console.error("Error retrieving search keyword:", error);
        setError("Lỗi khi tải từ khóa tìm kiếm!");
      } finally {
        setLoading(false);
      }
    };

    fetchKeywordAndResults();
  }, []);

  useEffect(() => {
    const fetchUpdatedKeyword = async () => {
      try {
        const updatedKeyword = await AsyncStorage.getItem("searchKeyword");
        console.log("Re-fetched updated keyword from AsyncStorage:", updatedKeyword);
        setKeyword(updatedKeyword);
      } catch (error) {
        console.error("Error re-fetching search keyword:", error);
      }
    };

    fetchUpdatedKeyword();
  }, [keyword]);

 
  const fetchSearchResults = async (searchKeyword) => {
    try {
      console.log("Fetching search results for keyword:", searchKeyword);
  
      // Call the `searchProducts` API
      const response = await searchProducts(
        searchKeyword, // keyword
        0, // page
        50, // pageSize
        '{"price":"desc"}', // sort
        "", // priceStart
        "" // priceEnd
      );
  
      console.log("API Response:", response);
  
      // Extract the product data
      const products = response?.data?.data || []; // Safely extract the product list
      setProducts(products); // Update state with the extracted product list
    } catch (err) {
      console.error("Error fetching search results:", err);
      setError("Lỗi khi lấy kết quả tìm kiếm!");
    }
  };
  
  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        router.push({
          pathname: "/productDetail",
          params: { id: item.offerId },
        })
      }
    >
      {/* Hiển thị ảnh sản phẩm */}
      <Image
        source={{ uri: item.imageUrl || "https://via.placeholder.com/150" }}
        style={styles.productImage}
      />
  
      {/* Hiển thị tiêu đề sản phẩm */}
      <Text style={styles.productTitle}>
        {item.subjectTrans || item.subject || "Không có tiêu đề"}
      </Text>
  
      {/* Hiển thị giá sản phẩm */}
      <Text style={styles.productPrice}>
        Giá: {item.priceInfo?.price || "Liên hệ để biết giá"}
      </Text>
  
      {/* Hiển thị tỷ lệ mua lại và số lượng bán trong tháng */}
      <Text style={styles.productDetails}>
        Đã bán: {item.monthSold || 0} | Tỷ lệ mua lại: {item.repurchaseRate || "N/A"}
      </Text>
    </TouchableOpacity>
  );
  
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff5c1c" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy kết quả nào!</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Kết quả tìm kiếm cho: {keyword}</Text>
      <FlatList
  data={products}
  renderItem={renderProduct}
  keyExtractor={(item) => item.offerId.toString()}
  contentContainerStyle={{ paddingHorizontal: 10 }}
  numColumns={2} // Hiển thị 2 cột
/>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  productCard: {
    width: "45%",
    margin: "2.5%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  productImage: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  productPrice: {
    fontSize: 12,
    color: "#ff5c1c",
    marginBottom: 4,
    textAlign: "center",
  },
  productDetails: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});

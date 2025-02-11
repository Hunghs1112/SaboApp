import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, StyleSheet, Button, ScrollView, Linking, Image, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { cards, categories, images, imageicons, categories2, categories3 } from '../constants/data'
import api from '../constants/api';
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import DeviceInfo from 'react-native-device-info'; // Import react-native-device-info

import { searchProducts, getProductDetail } from '../constants/alibabaApi'
export default function Index() {
  const [categories, setCategories] = useState([
    { id: 'shoes', name: 'Giày dép' },
    { id: 'clothes', name: 'Quần áo' },
    { id: 'accessories', name: 'Phụ kiện' },
    { id: 'laptop', name: 'Laptop' },
    { id: 'xe máy', name: 'Xe' },
  ]); // Mock danh mục
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [telegramLink, setTelegramLink] = useState("");
  const [apiVersion, setApiVersion] = useState(null);
  const [isVersionMatch, setIsVersionMatch] = useState(false); // State to track version match import
  const handleNavigateToSearch = () => {
    router.push("/search-page"); // Điều hướng đến trang tìm kiếm
  };

// Fetch device info and version
useEffect(() => {
  const fetchDeviceInfo = async () => {
    const version = await DeviceInfo.getVersion();
    setApiVersion(version); // Store device version
  Alert(version);
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

  const fetchProductsByCategory = async (categoryId) => {
    setLoading(true);
    setSelectedCategory(categoryId);

    try {
      const response = await searchProducts(categoryId, 0, 20); // Tìm sản phẩm theo danh mục
      setProducts(Array.isArray(response.data?.data) ? response.data.data : []); // Gán sản phẩm trả về
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
      setProducts([]); // Đặt mảng rỗng khi lỗi
    } finally {
      setLoading(false);
    }
  };


  // Fetch the image icons and links from the backend

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await api.get("/get-links"); // Fetch the links from this endpoint
        setTelegramLink(response.data.telegram_link); // Set the Telegram link from response
      } catch (error) {
        console.error("Error fetching links:", error);
        Alert.alert("Error", "Unable to fetch icon links.");
      }
    };

    fetchLinks();
  }, []);
  const handlePress = () => {
    if (telegramLink) {
      // Open the Telegram link
      Linking.openURL(telegramLink).catch((err) => console.error("Failed to open Telegram link:", err));
    } else {
      Alert.alert("Error", "Telegram link is not available.");
    }
  };
  // Gọi API khi chọn danh mục mặc định
  useEffect(() => {
    fetchProductsByCategory(categories[0].id);
  }, []);

  return (<SafeAreaView style={styles.safeArea}>
    <View style={{ flex: 1, backgroundColor: '#ccc' }}>

      <View style={styles.searchBar}>
        <Icon name="camera-outline" size={24} color="gray" />
        <TouchableOpacity onPress={handleNavigateToSearch} style={{ flex: 1 }}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm..."
            editable={false} // Không cho phép nhập ở trang hiện tại
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNavigateToSearch}>
          <Icon name="search-outline" size={24} color="#ff5c1c" />
        </TouchableOpacity>

      </View>

      <ScrollView style={{ flex: 1 }}>

        {isVersionMatch && (
          <View style={styles.contentContainer}>
            <View style={styles.sliderContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                style={styles.imageSlider}
              >
                {images.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    style={styles.sliderImage}
                    resizeMode="stretch"
                  />
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        <View style={styles.imageSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {imageicons.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.imageContainer}
                onPress={handlePress}
              >
                <Image source={{ uri: item.uri }} style={styles.iconImage} />
                <Text style={styles.imageLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Danh mục */}
        <View style={styles.categorySection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.cardContainer, // Sử dụng style từ phần cardContainer để đảm bảo giao diện đồng bộ
                  selectedCategory === category.id && styles.selectedCategory, // Highlight danh mục được chọn
                ]}
                onPress={() => fetchProductsByCategory(category.id)}
              >
                <Text style={styles.cardTitle}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.productSection}>
          <Text style={styles.sectionTitle}>Sản phẩm theo danh mục</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#ff5c1c" />
          ) : products.length > 0 ? (
            <View style={styles.productGrid}>
              {products.map((product, index) => (
                <TouchableOpacity
                  key={product.offerId || index}
                  style={styles.productCard}
                  onPress={() => router.push(`/productDetail?id=${product.offerId}`)} // Truyền offerId
                >
                  <Image
                    source={{
                      uri: product.imageUrl || "https://via.placeholder.com/150",
                    }}
                    style={styles.productImage}
                  />
                  <Text style={styles.productTitle}>
                    {product.subjectTrans && product.subjectTrans.length > 30
                      ? `${product.subjectTrans.slice(0, 30)}...`
                      : product.subjectTrans || product.subject}
                  </Text>
                  <Text style={styles.productPrice}>
                    Bấm để xem chi tiết
                  </Text>

                </TouchableOpacity>

              ))}
            </View>
          ) : (
            <Text style={styles.noProductsText}>Không có sản phẩm nào!</Text>
          )}
        </View>
      </ScrollView>
    </View>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white', // Đảm bảo màu nền phù hợp
  },
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 5 },
  searchBar: {
    position: 'absolute', // Sticky position
    top: 0, // Stick it to the top of the screen
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'white', // Background color of the search bar
    zIndex: 10, // Ensure the search bar stays on top of other content
    flexDirection: 'row', // Align icons and input horizontally
    justifyContent: 'space-between', // Spread out icons and input
    alignItems: 'center', // Center vertically
    paddingHorizontal: 15,
  },
  searchInput: {
    flex: 1, // Make TextInput take up available space
    height: 40,
    borderColor: '#ff5c1c',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginHorizontal: 10, // Space between icons and text input
  },
  contentContainer: {
    marginTop: 60, // Space for the sticky search bar
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  sliderContainer: {
    height: 200, // Height of the slider
    marginBottom: 5, // Space between the slider and next section
    margin: '10',
    backgroundColor: 'white'
  },
  imageSlider: {
    flex: 1,
  },
  sliderImage: {
    width: 390, // Width of each image
    height: 200, // Height of each image
    borderRadius: 20, // Optional, to make image corners rounded
    marginRight: 2, // Space between images in the slider
  },
  imageSection: {
    marginTop: 50,
    height: 100, // Adjust height as needed
    marginBottom: 15, // Space between the image section and next section
    backgroundColor: 'white'
  },
  imageContainer: {
    width: 110, // Width of each image container, adjust to show 4 images at a time
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 25,
  },
  iconImage: {
    width: 60, // Adjust width and height of the images as needed
    height: 60,
    borderRadius: 30, // Optional: make images circular
  },
  imageLabel: {
    marginTop: 5,
    fontSize: 12,
    color: 'gray',
  },
  cardSection: {
    marginRight: 4,
    height: 130, // Chiều cao của section danh mục
    marginBottom: -15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  cardContainer: {
    width: 100, // Chiều rộng thẻ
    height: 50, // Chiều cao thẻ
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 3,
    marginRight: 3, // Khoảng cách giữa các thẻ
    backgroundColor: 'white',
    borderRadius: 10, // Bo tròn góc thẻ
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3, // Hiệu ứng đổ bóng trên Android
    padding: 5,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'left',
    color: 'gray',
    flexWrap: 'wrap', // Xuống dòng nếu quá dài
  },
  headerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  moreButton: {
    padding: 5,
    backgroundColor: '#ff5c1c',
    borderRadius: 5,
  },
  moreButtonText: {
    color: 'white',
    fontSize: 14,
  },
  sellersWrapper: {
    marginBottom: 15,
  },
  sellerItem: {
    marginRight: 15,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  selectedSellerItem: {
    backgroundColor: '#ff5c1c',
  },
  sellerText: {
    fontSize: 14,
    color: 'gray',
  },
  productSection: {
    marginTop: 15,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    lineHeight: 16,
    height: 48, // 3 dòng * lineHeight (16px)
    overflow: 'hidden',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff5c1c',
  },
  noProductsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
  },
  categorySection: {
    marginTop: -5,
  }
});

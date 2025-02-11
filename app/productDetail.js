import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  SafeAreaView,
Linking
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getProductDetail } from "../constants/alibabaApi";
import { router } from "expo-router";
import api from "../constants/api"; // Tệp cấu hình API
import { AuthContext } from "../context/AuthContext";
export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams(); // Lấy ID sản phẩm
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSkuImage, setSelectedSkuImage] = useState(null); // Ảnh SKU được chọn
  const [selectedSkuPrice, setSelectedSkuPrice] = useState(null); // Giá SKU được chọn
  const { user } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const handleAddToCartWithQuantity = () => {
    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập số lượng hợp lệ.");
      return;
    }
    setModalVisible(false);
    handleAddToCart(user, product, parsedQuantity, selectedSkuPrice);
  };
  const handleBuyWholesale = () => {
    Alert.alert(
      "Thông Báo",
      "Liên hệ mua sỉ lẻ số lượng lớn \ntại mục 'Mua Sỉ' trên trang chủ \n để có giá tốt nhất.",
      [
        { text: "OK", onPress: () => console.log("Alert closed") },
      ]
    );
  };
  function extractImageUrls(description) {
    if (!description || typeof description !== "string") {
      return [];
    }
  
    const imgUrls = [];
    const regex = /<img[^>]+src="([^">]+)"/g; // Tìm tất cả các thẻ <img> và lấy URL từ thuộc tính src
    let match;
  
    while ((match = regex.exec(description)) !== null) {
      imgUrls.push(match[1]);
    }
  
    return imgUrls;
  }
  
  const handleAddToCart = async (user, product, quantity = 1, selectedSkuPrice = 0) => {
    if (!product || !user?.id) {
      Alert.alert("Lỗi", "Thông tin sản phẩm hoặc người dùng không khả dụng.");
      return;
    }
  
    const payload = {
      user_id: user.id,
      product_id: product.offerId || "N/A",
      product_name: product.subjectTrans || product.subject || "Không có tên sản phẩm",
      product_image: product.selectedSkuImage || product.productImage?.images?.[0] || "https://via.placeholder.com/150",
      quantity: quantity,
      price: selectedSkuPrice || product.productSaleInfo?.priceRangeList?.[0]?.price || 0,
    };
  
    try {
      const response = await api.post("/cart/add", payload);
      if (response.status === 200) {
        Alert.alert("Thành công", "Sản phẩm đã được thêm vào giỏ hàng!");
      } else {
        Alert.alert("Lỗi", "Không thể thêm sản phẩm vào giỏ hàng.");
      }
    } catch (error) {
      console.error("Lỗi thêm sản phẩm vào giỏ hàng:", error);
      Alert.alert("Lỗi", "Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
    }
  };
  
  const handleBuyNow = () => {
    if (!product) {
      Alert.alert("Lỗi", "Thông tin sản phẩm không khả dụng.");
      return;
    }
  
    const itemToCheckout = [
      {
        product_id: product.offerId || "N/A",
        product_name: product.subjectTrans || product.subject || "Không có tên sản phẩm",
        price: product.productSaleInfo?.priceRangeList?.[0]?.price || 0,
        quantity: 1,
        product_image: selectedSkuImage || product.productImage?.images?.[0] || "https://via.placeholder.com/150",
      },
    ];
  
    try {
      const itemsString = JSON.stringify(itemToCheckout);
      console.log("Navigating with items:", itemsString);
      router.push({
        pathname: "/checkout",
        params: { items: itemsString },
      });
    } catch (error) {
      console.error("Error during Buy Now:", error);
      Alert.alert("Lỗi", "Không thể xử lý sản phẩm để thanh toán.");
    }
  };
  
  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        const response = await getProductDetail(id, "vi"); // Gọi API chi tiết sản phẩm
        const data = response.data || null;

        // Xử lý xóa tag HTML trong mô tả sản phẩm
        if (data && data.description) {
          data.description = data.description.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");; // Loại bỏ thẻ HTML
        }

        setProduct(data);
      } catch (error) {
        console.error("Error fetching product detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff5c1c" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Sản phẩm không tìm thấy.</Text>
      </View>
    );
  }

  return (<SafeAreaView style={styles.container}>
   <ScrollView style={{ flex: 1 }}>
      {/* Ảnh chính sản phẩm */}
      <View style={styles.mainImageContainer}>
        <Image
          source={{ uri: selectedSkuImage || product.productImage?.images?.[0] || "https://via.placeholder.com/150" }}
          style={styles.mainImage}
        />
      </View>
  
      {/* Dòng ảnh SKU */}
      <View style={styles.skuImagesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {product.productImage?.images?.map((image, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedSkuImage(image)}
            >
              <Image source={{ uri: image }} style={styles.skuImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
  
      {/* Tiêu đề sản phẩm */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{product.subjectTrans || product.subject || "Không có tiêu đề"}</Text>
      </View>
  
      {/* Giá sản phẩm */}
      <View style={styles.priceContainer}>
        <Text style={styles.priceText}>
          Giá: ¥{product.productSaleInfo?.priceRangeList?.[0]?.price || "Liên hệ để biết thêm"}
        </Text>
        <Text style={styles.amountText}>
          Số lượng còn: {product.productSaleInfo?.amountOnSale || "Không có thông tin"}
        </Text>
      </View>
  {/* Thông tin người bán */}
<View style={styles.sellerContainer}>
  <Text style={styles.sellerTitle}>Thông tin người bán:</Text>
  <View style={styles.sellerInfo}>
    <Text style={styles.sellerName}>Tên: {product.sellerNickName || "Không có thông tin"}</Text>
    {/* {product.sellerShopUrl ? (
      <TouchableOpacity
        onPress={() => Linking.openURL(product.sellerShopUrl)} // Mở liên kết shop
      >
        <Text style={styles.sellerShopLink}>Shop: {product.sellerShopUrl}</Text>
      </TouchableOpacity>
    ) : (
      <Text style={styles.sellerNoLink}>Shop: Không có liên kết</Text>
    )} */}
  </View>
</View>
    {/* Mô tả sản phẩm */}
    <View style={styles.descriptionContainer}>
      <Text style={styles.descriptionTitle}>Mô tả sản phẩm:</Text>
      <Text style={styles.descriptionText}>{product.description || "Không có mô tả."}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {extractImageUrls(product.description)?.map((url, index) => (
          <Image key={index} source={{ uri: url }} style={styles.skuImage} />
        ))}
      </ScrollView>
    </View>


      {/* Thông tin vận chuyển */}
      <View style={styles.shippingContainer}>
        <Text style={styles.shippingTitle}>Thông tin vận chuyển:</Text>
        <Text>Địa chỉ: {product.productShippingInfo?.sendGoodsAddressText || "Không có thông tin"}</Text>
        <Text>Kích thước: {`${product.productShippingInfo?.length || 0} x ${product.productShippingInfo?.width || 0} x ${product.productShippingInfo?.height || 0}`} cm</Text>
        <Text>Trọng lượng: {product.productShippingInfo?.weight || "Không có thông tin"} kg</Text>
      </View>
  
      
  
      {/* Thông tin thuộc tính sản phẩm */}
      <View style={styles.attributesContainer}>
        <Text style={styles.attributesTitle}>Thuộc tính sản phẩm:</Text>
        {product.productAttribute?.map((attr, index) => (
          <View key={index} style={styles.attributeItem}>
            <Text>
              {attr.attributeNameTrans || attr.attributeName || "Không có tên"}:{" "}
              {attr.valueTrans || attr.value || "Không có giá trị"}
            </Text>
          </View>
        ))}
      </View>
  
     {/* Video sản phẩm */}
{/* {product.mainVideo ? (
  <View style={styles.videoContainer}>
    <Text style={styles.videoTitle}>Video sản phẩm:</Text>
    <Video
      source={{ uri: product.mainVideo }}
      style={styles.video}
      useNativeControls // Bật các điều khiển cho video
      resizeMode="contain" // Đặt chế độ resize cho video
      shouldPlay={false} // Video sẽ không tự động phát
    />
  </View>
) : (
  <View style={styles.videoContainer}>
    <Text style={styles.videoTitle}>Không có video sản phẩm.</Text>
  </View>
)} */}
  
      {/* Dòng trạng thái */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Trạng thái sản phẩm:</Text>
        <Text>{product.status || "Không có thông tin"}</Text>
      </View>

    </ScrollView>
    <View style={styles.actionsContainer}>
    <TouchableOpacity
        style={styles.addToCartButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyWholesale}>
    <Text style={styles.buyNowText}>Mua Sỉ</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
    <Text style={styles.buyNowText}>Mua ngay</Text>
  </TouchableOpacity>
</View>
 {/* Modal Nhập Số lượng */}
 <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nhập số lượng</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAddToCartWithQuantity}
              >
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
</SafeAreaView>
  );
}  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mainImageContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  mainImage: {
    width: "100%",
    height: 300,
    resizeMode: "contain",
    borderRadius: 10,
  },
  skuImagesContainer: {
    flexDirection: "row",
    marginVertical: 16,
    paddingHorizontal: 10,
  },
  skuImage: {
    width: 70,
    height: 70,
    margin: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  titleContainer: {
    padding: 16,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  priceContainer: {
    padding: 16,
    alignItems: "center",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff5c1c",
  },
  amountText: {
    fontSize: 14,
    color: "#666",
  },
  descriptionContainer: {
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
  },
  shippingContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  sellerContainer: {
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  sellerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  sellerInfo: {
    marginTop: 8,
  },
  sellerName: {
    fontSize: 16,
    marginBottom: 4,
    color: "#555",
  },
  sellerShopLink: {
    fontSize: 16,
    color: "#ff5c1c",
    textDecorationLine: "underline",
  },
  sellerNoLink: {
    fontSize: 16,
    color: "#999",
  },
  attributesContainer: {
    padding: 16,
  },
  attributesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  attributeItem: {
    marginBottom: 8,
  },
  videoContainer: {
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  video: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  statusContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  actionsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  addToCartButton: {
    flex: 1,
    marginRight: 5,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ff5c1c",
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: "center",
  },
  addToCartText: {
    color: "#ff5c1c",
    fontWeight: "bold",
  },
  buyNowButton: {
    flex: 1,
    marginLeft: 5,
    backgroundColor: "#ff5c1c",
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: "center",
  },
  buyNowText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 4,
  },
  cancelButtonText: {
    color: "#ff5c1c",
    textAlign: "center",
    fontWeight: "bold",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#ff5c1c",
    paddingVertical: 10,
    marginLeft: 8,
    borderRadius: 4,
  },
  confirmButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});

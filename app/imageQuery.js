import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  PanResponder,
  SafeAreaView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useRouter } from 'expo-router';
import { queryProductsByImage } from '../constants/alibabaApi'; // API for searching products
import * as FileSystem from 'expo-file-system'; // FileSystem to handle image base64

export default function ImageSearch() {
  const [loading, setLoading] = useState(false); // Loading state
  const [results, setResults] = useState([]); // Store search results
  const [image, setImage] = useState(null); // Store selected image
  const [base64Image, setBase64Image] = useState(''); // Store base64 image
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility for editing
  const [framePosition, setFramePosition] = useState({
    x: 80,
    y: 180,
    width: 300,
    height: 300,
  });

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const router = useRouter();

  // Request camera and media library permissions
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== 'granted') alert('Camera access is required!');
      if (libraryStatus !== 'granted') alert('Media library access is required!');
    })();
  }, []);

  // Pick image from the gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setBase64Image(result.assets[0].base64 || '');
      setModalVisible(true);
    }
  };

  // Take photo with the camera
  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setBase64Image(result.assets[0].base64 || '');
      setModalVisible(true);
    }
  };

  // PanResponder for dragging the frame
  const panResponderMoveFrame = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gestureState) => {
      setFramePosition((prevPosition) => ({
        ...prevPosition,
        x: Math.min(
          Math.max(prevPosition.x + gestureState.dx, 0),
          windowWidth - prevPosition.width
        ),
        y: Math.min(
          Math.max(prevPosition.y + gestureState.dy, 0),
          windowHeight - prevPosition.height
        ),
      }));
    },
    onPanResponderRelease: () => {},
  });

  // PanResponder to resize the frame
  const panResponderResizeFrame = (direction) =>
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        setFramePosition((prev) => {
          const newPosition = { ...prev };

          if (direction.includes('right')) {
            newPosition.width = Math.max(prev.width + gestureState.dx, 50);
          }
          if (direction.includes('bottom')) {
            newPosition.height = Math.max(prev.height + gestureState.dy, 50);
          }
          if (direction.includes('left')) {
            const dx = Math.min(gestureState.dx, prev.width - 50);
            newPosition.x = Math.min(Math.max(prev.x + dx, 0), windowWidth);
            newPosition.width = Math.max(prev.width - dx, 50);
          }
          if (direction.includes('top')) {
            const dy = Math.min(gestureState.dy, prev.height - 50);
            newPosition.y = Math.min(Math.max(prev.y + dy, 0), windowHeight);
            newPosition.height = Math.max(prev.height - dy, 50);
          }

          return newPosition;
        });
      },
    });

    const confirmSelection = async () => {
      try {
        // Đọc base64 từ ảnh hiện tại
        const base64 = await FileSystem.readAsStringAsync(image, {
          encoding: FileSystem.EncodingType.Base64,
        });
    
        if (base64) {
          setModalVisible(false); // Ẩn modal sau khi xác nhận
          searchByImage(base64); // Gửi toàn bộ ảnh tới API
        } else {
          alert('Không thể lấy base64 của ảnh!');
        }
      } catch (error) {
        console.error('Lỗi khi xử lý ảnh:', error.message);
        alert('Đã xảy ra lỗi khi xử lý ảnh!');
      }
    };
    
    
  // Search for products by image
  const searchByImage = async (imageBase64) => {
    if (!imageBase64) {
      alert('Please select or capture an image first!');
      return;
    }

    setLoading(true);
    setResults([]);
    const payload = {
      imageBase64: imageBase64.replace(/^data:image\/jpeg;base64,/, ''),
      beginPage: 1,
      pageSize: '50',
      country: 'vi',
    };

    try {
      const response = await queryProductsByImage(payload);
      if (response && response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        setResults(response.data.data);
      } else {
        alert('No search results found!');
      }
    } catch (error) {
      console.error('API request failed:', error.message);
      alert('API request failed! Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Chọn ảnh từ thư viện</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>Chụp ảnh</Text>
        </TouchableOpacity>
      </View>

      {/* Display cropped image */}
      {image && (
        <View style={styles.croppedImageContainer}>
          <Image source={{ uri: image }} style={styles.croppedImage} />
        </View>
      )}

      {loading && <ActivityIndicator size="large" color="#ff5c1c" style={styles.loader} />}

      {results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.offerId.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => router.push(`/productDetail?id=${item.offerId}`)}
            >
              <Image
                source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
                style={styles.resultImage}
              />
              <View style={styles.resultDetails}>
                <Text style={styles.resultName}>{item.subjectTrans || 'No title'}</Text>
                <Text style={styles.resultPrice}>
                  Price: ¥{item.priceInfo?.price || 'Contact for price'}
                </Text>
                <Text style={styles.resultSold}>Sold: {item.monthSold || 0}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : results.length === 0 && !loading ? (
        <Text style={styles.noResultsText}>No results found.</Text>
      ) : null}

<Modal visible={modalVisible} animationType="slide" transparent={true}>
  <View style={styles.modalContainer}>
    {/* Hiển thị ảnh */}
    <Image source={{ uri: image }} style={styles.fullImage} />

    {/* Nút xác nhận */}
    <TouchableOpacity style={styles.confirmButton} onPress={confirmSelection}>
      <Text style={styles.confirmText}>Xác nhận</Text>
    </TouchableOpacity>
  </View>
</Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#ff5c1c',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
  croppedImageContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  croppedImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  resultImage: {
    width: 60,
    height: 60,
    marginRight: 16,
    borderRadius: 8,
  },
  resultDetails: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultPrice: {
    fontSize: 14,
    color: '#ff5c1c',
  },
  resultSold: {
    fontSize: 12,
    color: '#888',
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  fullImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  frame: {
    position: 'absolute',
    borderColor: '#00ff00',
    borderWidth: 2,
  },
  resizeHandle: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#00ff00',
  },
  confirmButton: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#ff5c1c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

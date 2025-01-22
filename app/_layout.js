import React, { useContext } from 'react';
import { Alert, StyleSheet, View, SafeAreaView } from 'react-native';
import { Tabs, router } from 'expo-router';
import { AuthContext, AuthProvider} from '../context/AuthContext'
import Icon from 'react-native-vector-icons/Ionicons';

function RootLayoutTabs() {
  const { isLoggedIn } = useContext(AuthContext); // Lấy trạng thái từ AuthContext

  const handleTabPress = (tabName) => {
    console.log('Tab pressed:', tabName); // Debug kiểm tra tab nào được nhấn
    const restrictedTabs = ['notification', 'details', 'account', 'chat'];
    if (!isLoggedIn && restrictedTabs.includes(tabName)) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần đăng nhập để truy cập mục này.',
        [
          { text: 'Đăng nhập', onPress: () => router.push('login') },
          { text: 'Hủy', style: 'cancel' },
        ]
      );
      return false; // Chặn điều hướng
    }
    return true; // Cho phép điều hướng
  };

  console.log('isLoggedIn:', isLoggedIn); // Debug trạng thái đăng nhập

  return (
    
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#ff5c1c',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#f9f9f9' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="details"
        options={{
          tabBarLabel: 'Giỏ hàng',
          tabBarIcon: ({ color, size }) => (
            <Icon name="cart-outline" color={color} size={size} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            if (!handleTabPress('details')) {
              e.preventDefault(); // Chặn điều hướng
            }
          },
        }}
      />
    <Tabs.Screen
  name="search"
  options={{
    tabBarLabel: "Tìm kiếm",
    tabBarIcon: ({ color, size }) => (
      <View style={styles.iconContainer}>
        <Icon name="camera-outline" color="white" size={size} />
      </View>
    ),
  }}
  listeners={({ navigation }) => ({
    tabPress: (e) => {
      e.preventDefault(); // Ngăn tab chuyển mặc định
      navigation.navigate("imageQuery"); // Điều hướng đến Search Page
    },
  })}
/>

      <Tabs.Screen
        name="notification"
        options={{
          tabBarLabel: 'Thông báo',
          tabBarIcon: ({ color, size }) => (
            <Icon name="notifications-outline" color={color} size={size} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            if (!handleTabPress('notification')) {
              e.preventDefault(); // Chặn điều hướng
            }
          },
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          tabBarLabel: 'Tài khoản',
          tabBarIcon: ({ color, size }) => (
            <Icon name="person-outline" color={color} size={size} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            if (!handleTabPress('account')) {
              e.preventDefault(); // Chặn điều hướng
            }
          },
        }}
      />
     <Tabs.Screen
        name="chat"
        options={{
          href: null, // Ẩn tab Login
        }}
    
      />
          <Tabs.Screen
          name="login"
          options={{
            href: null, // Ẩn tab Login
          }}
        />
        <Tabs.Screen
          name="signup"
          options={{
            href: null, // Ẩn tab Signup
          }}
        />
        <Tabs.Screen
          name="productDetail"
          options={{
            href: null, // Ẩn tab Signup
          }}
        />
        <Tabs.Screen
          name="address"
          options={{
            href: null, // Ẩn tab Signup
          }}
        />
        <Tabs.Screen
          name="checkout"
          options={{
            href: null, // Ẩn tab Signup
          }}
        />
         <Tabs.Screen
          name="orderManage"
          options={{
            href: null, // Ẩn tab Signup
          }}
        />
        <Tabs.Screen
          name="search-results"
          options={{
            href: null, // Ẩn tab Signup
          }}
        />
        <Tabs.Screen
          name="search-page"
          options={{
            href: null, // Ẩn tab Signup
          }}
        />
        <Tabs.Screen
          name="orderDetail"
          options={{
            href: null, // Ẩn tab Signup
          }}
        />
          <Tabs.Screen
          name="recharge"
          options={{
            href: null, // Ẩn tab Signup
          }}
        />
              <Tabs.Screen
          name="imageQuery"
          options={{
            href: null, // Ẩn tab Signup
          }}
        />

      </Tabs>
      
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutTabs />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ff5c1c',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
});

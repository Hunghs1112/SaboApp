import React, { useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";

export default function NotificationScreen() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả"); // Quản lý mục được chọn

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo</Text>
      </View>

      {/* Categories */}
      <View style={styles.categories}>
        {["Tất cả", "Đơn hàng", "Khiếu nại", "Tài chính"].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.categoryButton,
              selectedCategory === item && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === item && styles.categoryTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.contentText}>
          Hiển thị thông báo cho mục: {selectedCategory}
        </Text>
        {/* Thêm logic để hiển thị thông báo tương ứng với mục được chọn */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#FF5C1C", // Màu cam cho header
    height: 60,
    justifyContent: "center",
    paddingHorizontal: 16, // Padding để căn chữ sang trái
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "left", // Căn chữ sang trái
  },
  categories: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  categoryButtonActive: {
    backgroundColor: "#FF5C1C",
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
  },
  categoryTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  contentText: {
    fontSize: 16,
    color: "#666",
  },
});

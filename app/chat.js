import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { View, Text, TextInput, Button, FlatList, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';

// Thay thế 'http://localhost:3000' bằng địa chỉ IP của server nếu cần
const socket = io('http://64.176.84.220:3000');
const userId = 'user123'; // Unique user ID, nên thay thế bằng ID của người dùng thực

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Tham gia vào phòng chat của user
    socket.emit('joinRoom', userId);

    socket.on('adminMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, { sender: 'admin', message }]);
    });

    return () => {
      socket.off('adminMessage');
    };
  }, []);

  const sendMessage = () => {
    const room = userId; // Gửi tin nhắn đến phòng chat của user
    socket.emit('clientMessage', { room, message });
    setMessages((prevMessages) => [...prevMessages, { sender: 'client', message }]);
    setMessage('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.chatContainer}>
          <FlatList
            data={messages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageContainer,
                  item.sender === 'client' ? styles.clientMessageContainer : styles.adminMessageContainer,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    item.sender === 'client' ? styles.clientMessageText : styles.adminMessageText,
                  ]}
                >
                  {item.sender === 'client' ? `You: ${item.message}` : `Admin: ${item.message}`}
                </Text>
              </View>
            )}
          />
          <View style={styles.inputContainer}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message"
              style={styles.input}
            />
            <Button title="Send" onPress={sendMessage} color="#FF5C1C" />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  chatContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  messageContainer: {
    marginVertical: 5,
    maxWidth: '80%',
    borderRadius: 20,
    padding: 12,
    paddingHorizontal: 18,
  },
  clientMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1e7f3',
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 20,
  },
  adminMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0f7e4',
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 20,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  clientMessageText: {
    color: '#003366',
  },
  adminMessageText: {
    color: '#2d6a4f',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});

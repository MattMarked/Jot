import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Header from '../components/Header';
import Message from '../components/Message';
import InputBar from '../components/InputBar';
import { useApp } from '../context/AppContext';

const ChatScreen = ({ route, navigation }) => {
  const { chat } = route.params;
  const { loadMessages, sendMessage, updateMessageStatus } = useApp();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef(null);

  // Load messages when component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      const chatMessages = await loadMessages(chat.id);
      setMessages(chatMessages);
      setIsLoading(false);
      
      // Scroll to bottom when messages are loaded
      if (flatListRef.current && chatMessages.length > 0) {
        setTimeout(() => {
          flatListRef.current.scrollToEnd({ animated: false });
        }, 200);
      }
      
      // Mark unread messages as read
      chatMessages.forEach(message => {
        if (!message.isOwn && message.status !== 'read') {
          updateMessageStatus(message.id, chat.id, 'read');
        }
      });
    };
    
    fetchMessages();
  }, [chat.id, loadMessages, updateMessageStatus]);

  // Handle sending a new message
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    const result = await sendMessage(chat.id, text);
    
    if (result.success) {
      // Scroll to the bottom
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    }
  };

  const renderRightComponent = () => {
    return (
      <View style={styles.headerButtons}>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="videocam" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="call" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar style="light" />
      <Header
        title={chat.name}
        showBackButton
        rightComponent={renderRightComponent()}
        onBackPress={() => navigation.goBack()}
      />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#075E54" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Message message={item} isOwn={item.isOwn} />
          )}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start a conversation!</Text>
            </View>
          }
        />
      )}
      
      <InputBar onSendMessage={handleSendMessage} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4DDD6', // WhatsApp chat background color
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
  },
  messagesList: {
    paddingVertical: 10,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
  },
});

export default ChatScreen;

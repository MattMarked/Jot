import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Header from '../components/Header';
import Message from '../components/Message';
import InputBar from '../components/InputBar';

// Mock data for demonstration
const MOCK_MESSAGES = [
  {
    id: '1',
    text: 'Hey there!',
    time: '10:00 AM',
    status: 'read',
    isOwn: false,
  },
  {
    id: '2',
    text: 'Hi! How are you?',
    time: '10:02 AM',
    status: 'read',
    isOwn: true,
  },
  {
    id: '3',
    text: 'I\'m good, thanks for asking. How about you?',
    time: '10:03 AM',
    status: 'read',
    isOwn: false,
  },
  {
    id: '4',
    text: 'Doing well! Just working on a new project.',
    time: '10:05 AM',
    status: 'read',
    isOwn: true,
  },
  {
    id: '5',
    text: 'That sounds interesting. What kind of project?',
    time: '10:06 AM',
    status: 'read',
    isOwn: false,
  },
  {
    id: '6',
    text: 'It\'s a chat application similar to WhatsApp. I\'m building it with React Native.',
    time: '10:08 AM',
    status: 'delivered',
    isOwn: true,
  },
];

const ChatScreen = ({ route, navigation }) => {
  const { chat } = route.params;
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const flatListRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when component mounts
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: false });
      }, 200);
    }
  }, []);

  const handleSendMessage = (text) => {
    const newMessage = {
      id: String(messages.length + 1),
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      isOwn: true,
    };
    
    setMessages([...messages, newMessage]);
    
    // Scroll to the bottom
    setTimeout(() => {
      flatListRef.current.scrollToEnd({ animated: true });
    }, 100);
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
      
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Message message={item} isOwn={item.isOwn} />
        )}
        contentContainerStyle={styles.messagesList}
      />
      
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
  },
});

export default ChatScreen;

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import dynamoDb from '../utils/dynamoDb';
import syncService from '../utils/syncService';

// Create the context
const AppContext = createContext();

// Storage keys
const { STORAGE_KEYS } = syncService;

// Mock data for demonstration
const MOCK_CHATS = [
  {
    id: '1',
    name: 'John Doe',
    lastMessage: 'Hey, how are you doing?',
    lastMessageTime: '10:30 AM',
    profilePic: 'https://randomuser.me/api/portraits/men/1.jpg',
    unreadCount: 3,
  },
  {
    id: '2',
    name: 'Jane Smith',
    lastMessage: 'Meeting at 2 PM',
    lastMessageTime: 'Yesterday',
    profilePic: 'https://randomuser.me/api/portraits/women/1.jpg',
    unreadCount: 0,
  },
  {
    id: '3',
    name: 'Work Group',
    lastMessage: 'Alice: The project is due tomorrow',
    lastMessageTime: 'Yesterday',
    profilePic: 'https://randomuser.me/api/portraits/men/2.jpg',
    unreadCount: 5,
  },
  {
    id: '4',
    name: 'Family Group',
    lastMessage: 'Mom: Don\'t forget to call grandma',
    lastMessageTime: 'Monday',
    profilePic: 'https://randomuser.me/api/portraits/women/2.jpg',
    unreadCount: 0,
  },
  {
    id: '5',
    name: 'David Johnson',
    lastMessage: 'Let me know when you arrive',
    lastMessageTime: '05/24/25',
    profilePic: 'https://randomuser.me/api/portraits/men/3.jpg',
    unreadCount: 0,
  },
];

// Provider component
export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Check if user is logged in and load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Check for user data
        const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          // Load chats
          const chatsData = await AsyncStorage.getItem(STORAGE_KEYS.CHATS);
          if (chatsData) {
            setChats(JSON.parse(chatsData));
          } else {
            // Initialize with mock data for demo
            await AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(MOCK_CHATS));
            setChats(MOCK_CHATS);
          }
          
          // Start background sync
          syncService.startBackgroundSync();
          
          // Get last sync time
          const lastSync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
          if (lastSync) {
            setLastSyncTime(new Date(lastSync));
          }
        }
      } catch (error) {
        console.log('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    
    // Cleanup function to stop background sync
    return () => {
      syncService.stopBackgroundSync();
    };
  }, []);

  // Perform manual sync with cloud
  const syncWithCloud = async () => {
    if (!user || isSyncing) return { success: false, error: 'Cannot sync right now' };
    
    try {
      setIsSyncing(true);
      const result = await syncService.performSync();
      
      if (result.success) {
        // Reload data after sync
        const chatsData = await AsyncStorage.getItem(STORAGE_KEYS.CHATS);
        if (chatsData) {
          setChats(JSON.parse(chatsData));
        }
        
        // Update last sync time
        const lastSync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
        if (lastSync) {
          setLastSyncTime(new Date(lastSync));
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error syncing with cloud:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSyncing(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      // In a real app, you would make an API call to authenticate
      // For demo purposes, we'll just simulate a successful login
      const userId = uuidv4();
      const userData = {
        id: userId,
        name: 'John Doe',
        email,
        profilePic: 'https://randomuser.me/api/portraits/men/1.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save user data to AsyncStorage and DynamoDB
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      await dynamoDb.saveUser(userData);
      
      setUser(userData);
      
      // Initialize with mock data for demo
      await AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(MOCK_CHATS));
      setChats(MOCK_CHATS);
      
      // Start background sync
      syncService.startBackgroundSync();
      
      return { success: true };
    } catch (error) {
      console.error('Error logging in:', error);
      return { success: false, error: 'Failed to login' };
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      // In a real app, you would make an API call to register
      // For demo purposes, we'll just simulate a successful registration
      const userId = uuidv4();
      const userData = {
        id: userId,
        name,
        email,
        profilePic: 'https://randomuser.me/api/portraits/men/1.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save user data to AsyncStorage and DynamoDB
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      await dynamoDb.saveUser(userData);
      
      setUser(userData);
      
      // Initialize with empty chats
      await AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify([]));
      setChats([]);
      
      // Start background sync
      syncService.startBackgroundSync();
      
      return { success: true };
    } catch (error) {
      console.error('Error registering:', error);
      return { success: false, error: 'Failed to register' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Stop background sync
      syncService.stopBackgroundSync();
      
      // Clear user data from AsyncStorage
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      
      // Reset state
      setUser(null);
      setChats([]);
      setMessages({});
      setLastSyncTime(null);
      
      return { success: true };
    } catch (error) {
      console.error('Error logging out:', error);
      return { success: false, error: 'Failed to logout' };
    }
  };

  // Load messages for a chat
  const loadMessages = async (chatId) => {
    try {
      // Check if we already have messages for this chat
      if (messages[chatId]) {
        return messages[chatId];
      }
      
      // Try to get messages from AsyncStorage
      const key = `${STORAGE_KEYS.MESSAGES_PREFIX}${chatId}`;
      const storedMessages = await AsyncStorage.getItem(key);
      
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        setMessages(prev => ({
          ...prev,
          [chatId]: parsedMessages
        }));
        return parsedMessages;
      }
      
      // If no messages found, initialize with empty array
      setMessages(prev => ({
        ...prev,
        [chatId]: []
      }));
      return [];
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  };

  // Add a new chat
  const addChat = async (chat) => {
    try {
      const chatId = chat.id || uuidv4();
      const timestamp = new Date().toISOString();
      
      const newChat = {
        ...chat,
        id: chatId,
        userId: user.id,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      
      // Update local state
      const updatedChats = [newChat, ...chats];
      setChats(updatedChats);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(updatedChats));
      
      // Add to sync queue
      await syncService.addToSyncQueue('chat_add', newChat);
      
      // Save to DynamoDB
      await dynamoDb.createChat(newChat);
      
      return { success: true, chatId };
    } catch (error) {
      console.error('Error adding chat:', error);
      return { success: false, error: error.message };
    }
  };

  // Update a chat
  const updateChat = async (updatedChat) => {
    try {
      // Update timestamp
      updatedChat.updatedAt = new Date().toISOString();
      
      // Update local state
      const updatedChats = chats.map(chat => 
        chat.id === updatedChat.id ? updatedChat : chat
      );
      setChats(updatedChats);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(updatedChats));
      
      // Add to sync queue
      await syncService.addToSyncQueue('chat_update', updatedChat);
      
      // Update in DynamoDB
      await dynamoDb.updateChat(updatedChat.id, updatedChat);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating chat:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete a chat
  const deleteChat = async (chatId) => {
    try {
      // Update local state
      const updatedChats = chats.filter(chat => chat.id !== chatId);
      setChats(updatedChats);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(updatedChats));
      
      // Add to sync queue
      await syncService.addToSyncQueue('chat_delete', { id: chatId });
      
      // Delete from DynamoDB
      await dynamoDb.deleteChat(chatId);
      
      // Remove messages for this chat
      const key = `${STORAGE_KEYS.MESSAGES_PREFIX}${chatId}`;
      await AsyncStorage.removeItem(key);
      
      // Update messages state
      setMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[chatId];
        return newMessages;
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting chat:', error);
      return { success: false, error: error.message };
    }
  };

  // Send a message
  const sendMessage = async (chatId, text) => {
    try {
      const messageId = uuidv4();
      const timestamp = new Date().toISOString();
      const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const newMessage = {
        id: messageId,
        chatId,
        userId: user.id,
        text,
        time: formattedTime,
        timestamp,
        status: 'sent',
        isOwn: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      
      // Update local state
      const chatMessages = messages[chatId] || [];
      const updatedMessages = [...chatMessages, newMessage];
      
      setMessages(prev => ({
        ...prev,
        [chatId]: updatedMessages
      }));
      
      // Save to AsyncStorage
      const key = `${STORAGE_KEYS.MESSAGES_PREFIX}${chatId}`;
      await AsyncStorage.setItem(key, JSON.stringify(updatedMessages));
      
      // Update chat's last message
      const chatToUpdate = chats.find(c => c.id === chatId);
      if (chatToUpdate) {
        const updatedChat = {
          ...chatToUpdate,
          lastMessage: text,
          lastMessageTime: formattedTime,
          updatedAt: timestamp,
        };
        
        await updateChat(updatedChat);
      }
      
      // Add to sync queue
      await syncService.addToSyncQueue('message_add', newMessage);
      
      // Save to DynamoDB
      await dynamoDb.createMessage(newMessage);
      
      return { success: true, messageId };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  };

  // Update message status
  const updateMessageStatus = async (messageId, chatId, status) => {
    try {
      // Update local state
      const chatMessages = messages[chatId] || [];
      const updatedMessages = chatMessages.map(message => 
        message.id === messageId ? { ...message, status, updatedAt: new Date().toISOString() } : message
      );
      
      setMessages(prev => ({
        ...prev,
        [chatId]: updatedMessages
      }));
      
      // Save to AsyncStorage
      const key = `${STORAGE_KEYS.MESSAGES_PREFIX}${chatId}`;
      await AsyncStorage.setItem(key, JSON.stringify(updatedMessages));
      
      // Add to sync queue
      await syncService.addToSyncQueue('message_status_update', { id: messageId, status });
      
      // Update in DynamoDB
      await dynamoDb.updateMessageStatus(messageId, status);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating message status:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isLoading,
        chats,
        messages,
        isSyncing,
        lastSyncTime,
        login,
        register,
        logout,
        addChat,
        updateChat,
        deleteChat,
        loadMessages,
        sendMessage,
        updateMessageStatus,
        syncWithCloud,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the context
const AppContext = createContext();

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
  const [chats, setChats] = useState(MOCK_CHATS);

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.log('Error retrieving user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      // In a real app, you would make an API call to authenticate
      // For demo purposes, we'll just simulate a successful login
      const userData = {
        id: '1',
        name: 'John Doe',
        email,
        profilePic: 'https://randomuser.me/api/portraits/men/1.jpg',
      };

      // Save user data to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.log('Error logging in:', error);
      return { success: false, error: 'Failed to login' };
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      // In a real app, you would make an API call to register
      // For demo purposes, we'll just simulate a successful registration
      const userData = {
        id: '1',
        name,
        email,
        profilePic: 'https://randomuser.me/api/portraits/men/1.jpg',
      };

      // Save user data to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.log('Error registering:', error);
      return { success: false, error: 'Failed to register' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      return { success: true };
    } catch (error) {
      console.log('Error logging out:', error);
      return { success: false, error: 'Failed to logout' };
    }
  };

  // Add a new chat
  const addChat = (chat) => {
    setChats([chat, ...chats]);
  };

  // Update a chat
  const updateChat = (updatedChat) => {
    setChats(chats.map(chat => 
      chat.id === updatedChat.id ? updatedChat : chat
    ));
  };

  // Delete a chat
  const deleteChat = (chatId) => {
    setChats(chats.filter(chat => chat.id !== chatId));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isLoading,
        chats,
        login,
        register,
        logout,
        addChat,
        updateChat,
        deleteChat,
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

import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Header from '../components/Header';
import ChatListItem from '../components/ChatListItem';

// Mock data for demonstration
const MOCK_CONTACTS = [
  {
    id: '1',
    name: 'John Doe',
    lastMessage: 'Online',
    lastMessageTime: '',
    profilePic: 'https://randomuser.me/api/portraits/men/1.jpg',
    unreadCount: 0,
  },
  {
    id: '2',
    name: 'Jane Smith',
    lastMessage: 'Last seen today at 11:30 AM',
    lastMessageTime: '',
    profilePic: 'https://randomuser.me/api/portraits/women/1.jpg',
    unreadCount: 0,
  },
  {
    id: '3',
    name: 'Robert Johnson',
    lastMessage: 'Online',
    lastMessageTime: '',
    profilePic: 'https://randomuser.me/api/portraits/men/2.jpg',
    unreadCount: 0,
  },
  {
    id: '4',
    name: 'Emily Davis',
    lastMessage: 'Last seen yesterday',
    lastMessageTime: '',
    profilePic: 'https://randomuser.me/api/portraits/women/2.jpg',
    unreadCount: 0,
  },
  {
    id: '5',
    name: 'Michael Wilson',
    lastMessage: 'Last seen 3 days ago',
    lastMessageTime: '',
    profilePic: 'https://randomuser.me/api/portraits/men/3.jpg',
    unreadCount: 0,
  },
];

const ContactsScreen = ({ navigation }) => {
  const [contacts, setContacts] = useState(MOCK_CONTACTS);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactPress = (contact) => {
    // Create a new chat object
    const newChat = {
      id: contact.id,
      name: contact.name,
      lastMessage: '',
      lastMessageTime: 'Just now',
      profilePic: contact.profilePic,
      unreadCount: 0,
    };
    
    // Navigate to the chat screen with the new chat
    navigation.navigate('Chat', { chat: newChat });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Header
        title="New Chat"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8F8F8F" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatListItem chat={item} onPress={() => handleContactPress(item)} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    margin: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
});

export default ContactsScreen;

import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import ChatListItem from '../components/ChatListItem';
import Header from '../components/Header';
import { useApp } from '../context/AppContext';

const ChatListScreen = ({ navigation }) => {
  const { chats, user } = useApp();

  const handleChatPress = (chat) => {
    navigation.navigate('Chat', { chat });
  };

  const renderRightComponent = () => {
    return (
      <View style={styles.headerButtons}>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="search" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Header title="Jot Chat" rightComponent={renderRightComponent()} />
      
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatListItem chat={item} onPress={() => handleChatPress(item)} />
        )}
      />
      
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Contacts')}>
        <Ionicons name="chatbubble" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#075E54',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default ChatListScreen;

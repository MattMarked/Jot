import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncData } from './dynamoDb';
import { SYNC_CONFIG } from './config';

// Keys for AsyncStorage
const STORAGE_KEYS = {
  USER: 'user',
  CHATS: 'chats',
  MESSAGES_PREFIX: 'messages_',
  LAST_SYNC: 'last_sync',
  SYNC_QUEUE: 'sync_queue',
};

// Get all messages from AsyncStorage
const getAllMessages = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const messageKeys = allKeys.filter(key => key.startsWith(STORAGE_KEYS.MESSAGES_PREFIX));
    
    const messagesObj = {};
    
    for (const key of messageKeys) {
      const chatId = key.replace(STORAGE_KEYS.MESSAGES_PREFIX, '');
      const messages = await AsyncStorage.getItem(key);
      
      if (messages) {
        messagesObj[chatId] = JSON.parse(messages);
      }
    }
    
    return messagesObj;
  } catch (error) {
    console.error('Error getting all messages from AsyncStorage:', error);
    return {};
  }
};

// Save messages to AsyncStorage
const saveMessages = async (chatId, messages) => {
  try {
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.MESSAGES_PREFIX}${chatId}`,
      JSON.stringify(messages)
    );
    return true;
  } catch (error) {
    console.error('Error saving messages to AsyncStorage:', error);
    return false;
  }
};

// Perform sync with DynamoDB
export const performSync = async () => {
  try {
    // Get user data
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    
    if (!userData) {
      console.log('No user data found, skipping sync');
      return { success: false, error: 'No user data found' };
    }
    
    const user = JSON.parse(userData);
    
    // Get local chats
    const chatsData = await AsyncStorage.getItem(STORAGE_KEYS.CHATS);
    const localChats = chatsData ? JSON.parse(chatsData) : [];
    
    // Get all messages
    const localMessages = await getAllMessages();
    
    // Perform sync with DynamoDB
    const syncResult = await syncData(user.id, localChats, localMessages);
    
    if (syncResult.success) {
      // Update local storage with synced data
      await AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(syncResult.chats));
      
      // Update messages for each chat
      for (const [chatId, messages] of Object.entries(syncResult.messages)) {
        await saveMessages(chatId, messages);
      }
      
      // Update last sync timestamp
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      
      return { success: true };
    } else {
      console.error('Sync failed:', syncResult.error);
      return { success: false, error: syncResult.error };
    }
  } catch (error) {
    console.error('Error performing sync:', error);
    return { success: false, error: error.message };
  }
};

// Add an item to the sync queue
export const addToSyncQueue = async (type, data) => {
  try {
    // Get current queue
    const queueData = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    const queue = queueData ? JSON.parse(queueData) : [];
    
    // Add new item to queue
    queue.push({
      type,
      data,
      timestamp: new Date().toISOString(),
    });
    
    // Save updated queue
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    
    return true;
  } catch (error) {
    console.error('Error adding to sync queue:', error);
    return false;
  }
};

// Process the sync queue
export const processSyncQueue = async () => {
  try {
    // Get current queue
    const queueData = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    
    if (!queueData) {
      return { success: true, processed: 0 };
    }
    
    const queue = JSON.parse(queueData);
    
    if (queue.length === 0) {
      return { success: true, processed: 0 };
    }
    
    // Process each item in the queue
    // For now, we'll just clear the queue and rely on the full sync
    // In a real app, you would process each item individually
    
    // Clear the queue
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
    
    // Perform a full sync
    await performSync();
    
    return { success: true, processed: queue.length };
  } catch (error) {
    console.error('Error processing sync queue:', error);
    return { success: false, error: error.message };
  }
};

// Start background sync
let syncInterval = null;

export const startBackgroundSync = () => {
  if (syncInterval) {
    clearInterval(syncInterval);
  }
  
  syncInterval = setInterval(async () => {
    console.log('Performing background sync...');
    await performSync();
  }, SYNC_CONFIG.syncInterval);
  
  console.log(`Background sync started with interval: ${SYNC_CONFIG.syncInterval}ms`);
};

export const stopBackgroundSync = () => {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log('Background sync stopped');
  }
};

export default {
  performSync,
  addToSyncQueue,
  processSyncQueue,
  startBackgroundSync,
  stopBackgroundSync,
  STORAGE_KEYS,
};

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  QueryCommand, 
  UpdateCommand, 
  DeleteCommand 
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { AWS_CONFIG, DYNAMODB_TABLES } from './config';

// Initialize the DynamoDB client
const client = new DynamoDBClient(AWS_CONFIG);
const docClient = DynamoDBDocumentClient.from(client);

// Table names
const { USERS_TABLE, CHATS_TABLE, MESSAGES_TABLE } = DYNAMODB_TABLES;

/**
 * User operations
 */

// Create or update a user
export const saveUser = async (userData) => {
  try {
    const params = {
      TableName: USERS_TABLE,
      Item: {
        ...userData,
        updatedAt: new Date().toISOString(),
      },
    };

    await docClient.send(new PutCommand(params));
    return { success: true };
  } catch (error) {
    console.error('Error saving user to DynamoDB:', error);
    return { success: false, error: error.message };
  }
};

// Get a user by ID
export const getUser = async (userId) => {
  try {
    const params = {
      TableName: USERS_TABLE,
      Key: {
        id: userId,
      },
    };

    const { Item } = await docClient.send(new GetCommand(params));
    return Item;
  } catch (error) {
    console.error('Error getting user from DynamoDB:', error);
    return null;
  }
};

/**
 * Chat operations
 */

// Create a new chat
export const createChat = async (chatData) => {
  try {
    const chatId = chatData.id || uuidv4();
    const params = {
      TableName: CHATS_TABLE,
      Item: {
        ...chatData,
        id: chatId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    await docClient.send(new PutCommand(params));
    return { success: true, chatId };
  } catch (error) {
    console.error('Error creating chat in DynamoDB:', error);
    return { success: false, error: error.message };
  }
};

// Update a chat
export const updateChat = async (chatId, chatData) => {
  try {
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    // Build the update expression dynamically
    Object.keys(chatData).forEach((key) => {
      updateExpressions.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = chatData[key];
    });

    // Add updatedAt timestamp
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const params = {
      TableName: CHATS_TABLE,
      Key: {
        id: chatId,
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    };

    const { Attributes } = await docClient.send(new UpdateCommand(params));
    return { success: true, chat: Attributes };
  } catch (error) {
    console.error('Error updating chat in DynamoDB:', error);
    return { success: false, error: error.message };
  }
};

// Delete a chat
export const deleteChat = async (chatId) => {
  try {
    const params = {
      TableName: CHATS_TABLE,
      Key: {
        id: chatId,
      },
    };

    await docClient.send(new DeleteCommand(params));
    return { success: true };
  } catch (error) {
    console.error('Error deleting chat from DynamoDB:', error);
    return { success: false, error: error.message };
  }
};

// Get all chats for a user
export const getUserChats = async (userId) => {
  try {
    const params = {
      TableName: CHATS_TABLE,
      IndexName: 'UserIdIndex', // Assuming you have a GSI on userId
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    };

    const { Items } = await docClient.send(new QueryCommand(params));
    return Items || [];
  } catch (error) {
    console.error('Error getting user chats from DynamoDB:', error);
    return [];
  }
};

/**
 * Message operations
 */

// Create a new message
export const createMessage = async (messageData) => {
  try {
    const messageId = messageData.id || uuidv4();
    const timestamp = new Date().toISOString();
    
    const params = {
      TableName: MESSAGES_TABLE,
      Item: {
        ...messageData,
        id: messageId,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    };

    await docClient.send(new PutCommand(params));
    
    // Update the chat's lastMessage and lastMessageTime
    if (messageData.chatId) {
      await updateChat(messageData.chatId, {
        lastMessage: messageData.text,
        lastMessageTime: timestamp,
      });
    }
    
    return { success: true, messageId };
  } catch (error) {
    console.error('Error creating message in DynamoDB:', error);
    return { success: false, error: error.message };
  }
};

// Get all messages for a chat
export const getChatMessages = async (chatId) => {
  try {
    const params = {
      TableName: MESSAGES_TABLE,
      IndexName: 'ChatIdIndex', // Assuming you have a GSI on chatId
      KeyConditionExpression: 'chatId = :chatId',
      ExpressionAttributeValues: {
        ':chatId': chatId,
      },
      ScanIndexForward: true, // Sort by timestamp ascending (oldest first)
    };

    const { Items } = await docClient.send(new QueryCommand(params));
    return Items || [];
  } catch (error) {
    console.error('Error getting chat messages from DynamoDB:', error);
    return [];
  }
};

// Update message status (e.g., sent, delivered, read)
export const updateMessageStatus = async (messageId, status) => {
  try {
    const params = {
      TableName: MESSAGES_TABLE,
      Key: {
        id: messageId,
      },
      UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
        '#updatedAt': 'updatedAt',
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    };

    const { Attributes } = await docClient.send(new UpdateCommand(params));
    return { success: true, message: Attributes };
  } catch (error) {
    console.error('Error updating message status in DynamoDB:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sync operations
 */

// Sync local data with DynamoDB
export const syncData = async (userId, localChats, localMessages) => {
  try {
    // Get remote chats
    const remoteChats = await getUserChats(userId);
    
    // Sync chats
    const syncedChats = [];
    
    // Process local chats
    for (const localChat of localChats) {
      const remoteChat = remoteChats.find(rc => rc.id === localChat.id);
      
      if (!remoteChat) {
        // Chat exists locally but not remotely - create it
        const { success, chatId } = await createChat({
          ...localChat,
          userId,
        });
        
        if (success) {
          syncedChats.push({ ...localChat, id: chatId });
        }
      } else {
        // Chat exists both locally and remotely
        // Compare timestamps and use the most recent version
        const localUpdatedAt = localChat.updatedAt ? new Date(localChat.updatedAt) : new Date(0);
        const remoteUpdatedAt = remoteChat.updatedAt ? new Date(remoteChat.updatedAt) : new Date(0);
        
        if (localUpdatedAt > remoteUpdatedAt) {
          // Local is newer, update remote
          await updateChat(localChat.id, localChat);
          syncedChats.push(localChat);
        } else {
          // Remote is newer or same, use remote
          syncedChats.push(remoteChat);
        }
      }
    }
    
    // Add remote chats that don't exist locally
    for (const remoteChat of remoteChats) {
      if (!localChats.some(lc => lc.id === remoteChat.id)) {
        syncedChats.push(remoteChat);
      }
    }
    
    // Sync messages for each chat
    const syncedMessages = {};
    
    for (const chat of syncedChats) {
      const chatId = chat.id;
      const localChatMessages = localMessages[chatId] || [];
      const remoteChatMessages = await getChatMessages(chatId);
      
      const chatSyncedMessages = [];
      
      // Process local messages
      for (const localMessage of localChatMessages) {
        const remoteMessage = remoteChatMessages.find(rm => rm.id === localMessage.id);
        
        if (!remoteMessage) {
          // Message exists locally but not remotely - create it
          const { success, messageId } = await createMessage({
            ...localMessage,
            chatId,
            userId,
          });
          
          if (success) {
            chatSyncedMessages.push({ ...localMessage, id: messageId });
          }
        } else {
          // Message exists both locally and remotely
          // For messages, we typically don't update them once created
          // But we might update status
          if (localMessage.status !== remoteMessage.status) {
            await updateMessageStatus(localMessage.id, localMessage.status);
            chatSyncedMessages.push({ ...remoteMessage, status: localMessage.status });
          } else {
            chatSyncedMessages.push(remoteMessage);
          }
        }
      }
      
      // Add remote messages that don't exist locally
      for (const remoteMessage of remoteChatMessages) {
        if (!localChatMessages.some(lm => lm.id === remoteMessage.id)) {
          chatSyncedMessages.push(remoteMessage);
        }
      }
      
      syncedMessages[chatId] = chatSyncedMessages;
    }
    
    return {
      success: true,
      chats: syncedChats,
      messages: syncedMessages,
    };
  } catch (error) {
    console.error('Error syncing data with DynamoDB:', error);
    return { success: false, error: error.message };
  }
};

export default {
  saveUser,
  getUser,
  createChat,
  updateChat,
  deleteChat,
  getUserChats,
  createMessage,
  getChatMessages,
  updateMessageStatus,
  syncData,
};

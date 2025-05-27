// AWS Configuration
export const AWS_CONFIG = {
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'YOUR_ACCESS_KEY_ID',
    secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
  },
};

// DynamoDB Table Names
export const DYNAMODB_TABLES = {
  USERS_TABLE: 'JotUsers',
  CHATS_TABLE: 'JotChats',
  MESSAGES_TABLE: 'JotMessages',
};

// Sync Configuration
export const SYNC_CONFIG = {
  // How often to sync data with DynamoDB (in milliseconds)
  syncInterval: 60000, // 1 minute
  
  // Maximum number of retries for failed sync operations
  maxRetries: 3,
  
  // Delay between retries (in milliseconds)
  retryDelay: 5000, // 5 seconds
};

export default {
  AWS_CONFIG,
  DYNAMODB_TABLES,
  SYNC_CONFIG,
};

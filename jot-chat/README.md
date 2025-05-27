# Jot Chat

A multi-platform chat application similar to WhatsApp, built with React Native and Expo.

## Features

- Cross-platform: Works on iOS, Android, and Web
- User authentication (login/register)
- Chat list view
- Individual chat conversations
- User profiles
- Dark mode support
- Responsive design
- Cloud backup and sync with DynamoDB

## Cloud Backup and Sync

Jot Chat now includes cloud backup and sync functionality using Amazon DynamoDB. This feature allows users to:

- Automatically sync data between devices
- Manually trigger sync from the Profile screen
- Keep chat history and user data backed up in the cloud
- Seamlessly restore data when logging in on a new device

### How It Works

1. **Automatic Background Sync**: Data is automatically synced with the cloud every minute in the background.
2. **Manual Sync**: Users can manually trigger a sync from the Profile screen by tapping "Sync Now" in the Cloud Sync section.
3. **Offline Support**: Changes made while offline are queued and synced when the device reconnects to the internet.
4. **Conflict Resolution**: When conflicts occur between local and cloud data, the most recently updated version is used.

### Implementation Details

The cloud backup and sync functionality is implemented using:

- AWS SDK for JavaScript
- Amazon DynamoDB for data storage
- Local AsyncStorage for offline data persistence
- Background sync service for automatic syncing
- Sync queue for handling offline changes

## Tech Stack

- React Native
- Expo
- React Navigation
- AsyncStorage for local data persistence
- React Context API for state management
- AWS SDK for DynamoDB integration

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- AWS Account with DynamoDB tables set up

### AWS Setup

1. Create the following DynamoDB tables:
   - JotUsers
   - JotChats
   - JotMessages

2. Set up the following Global Secondary Indexes (GSIs):
   - UserIdIndex on JotChats table (indexed on userId)
   - ChatIdIndex on JotMessages table (indexed on chatId)

3. Update the AWS configuration in `src/utils/config.js` with your AWS credentials and region.

### Installation

1. Clone the repository
```
git clone <repository-url>
cd jot-chat
```

2. Install dependencies
```
npm install
```

### Running the App

#### Mobile (iOS/Android)

```
# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

#### Web

```
# Run on Web
npm run web
```

## Project Structure

```
jot-chat/
├── assets/              # Images and assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Application screens
│   ├── navigation/      # Navigation configuration
│   ├── context/         # Context API for state management
│   ├── utils/           # Utility functions
│   │   ├── config.js    # AWS and app configuration
│   │   ├── dynamoDb.js  # DynamoDB operations
│   │   └── syncService.js # Sync functionality
│   └── hooks/           # Custom React hooks
├── web/                 # Web-specific files
├── App.js               # Main application component
└── README.md            # Project documentation
```

## Demo Accounts

For testing purposes, you can use any email and password combination. The app currently uses simulated authentication but will create a unique user ID for cloud sync.

## License

This project is licensed under the MIT License.

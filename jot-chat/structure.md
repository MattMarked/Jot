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

## Tech Stack

- React Native
- Expo
- React Navigation
- AsyncStorage for local data persistence
- React Context API for state management

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI

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
│   └── hooks/           # Custom React hooks
├── web/                 # Web-specific files
├── App.js               # Main application component
└── README.md            # Project documentation
```

## Demo Accounts

For testing purposes, you can use any email and password combination. The app currently uses mock data and simulated authentication.

## License

This project is licensed under the MIT License.

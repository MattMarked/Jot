import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Message = ({ message, isOwn }) => {
  return (
    <View style={[
      styles.container,
      isOwn ? styles.ownMessageContainer : styles.otherMessageContainer
    ]}>
      <View style={[
        styles.bubble,
        isOwn ? styles.ownBubble : styles.otherBubble
      ]}>
        <Text style={styles.messageText}>{message.text}</Text>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{message.time}</Text>
          {isOwn && (
            <Text style={styles.statusText}>
              {message.status === 'read' ? '✓✓' : '✓'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
  },
  ownBubble: {
    backgroundColor: '#DCF8C6', // WhatsApp green for own messages
    borderTopRightRadius: 0,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: '#000000',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  timeText: {
    fontSize: 12,
    color: '#8F8F8F',
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    color: '#8F8F8F',
  },
});

export default Message;

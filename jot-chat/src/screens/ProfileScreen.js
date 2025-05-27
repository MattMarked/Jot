import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Header from '../components/Header';

const ProfileScreen = ({ navigation }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { user, logout, syncWithCloud, lastSyncTime } = useApp();
  
  // Default user data if not logged in
  const userData = user || {
    name: 'Guest User',
    email: 'guest@example.com',
    profilePic: 'https://randomuser.me/api/portraits/men/1.jpg',
    status: 'Available',
    phone: '+1 (555) 123-4567',
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            const result = await logout();
            if (result.success) {
              navigation.navigate('Auth');
            } else {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Header
        title="Profile"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: userData.profilePic }}
            style={styles.profilePic}
          />
          <Text style={styles.name}>{userData.name}</Text>
          <Text style={styles.email}>{userData.email}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="person-outline" size={24} color="#075E54" style={styles.menuIcon} />
            <Text style={styles.menuText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="key-outline" size={24} color="#075E54" style={styles.menuIcon} />
            <Text style={styles.menuText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#075E54" style={styles.menuIcon} />
            <Text style={styles.menuText}>Status</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.valueText}>{userData.status}</Text>
              <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.menuItem}>
            <Ionicons name="moon-outline" size={24} color="#075E54" style={styles.menuIcon} />
            <Text style={styles.menuText}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#CCCCCC', true: '#128C7E' }}
              thumbColor={darkMode ? '#075E54' : '#FFFFFF'}
            />
          </View>
          
          <View style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={24} color="#075E54" style={styles.menuIcon} />
            <Text style={styles.menuText}>Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#CCCCCC', true: '#128C7E' }}
              thumbColor={notifications ? '#075E54' : '#FFFFFF'}
            />
          </View>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="lock-closed-outline" size={24} color="#075E54" style={styles.menuIcon} />
            <Text style={styles.menuText}>Privacy</Text>
            <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={24} color="#075E54" style={styles.menuIcon} />
            <Text style={styles.menuText}>Help</Text>
            <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cloud Sync</Text>
          
          <View style={styles.menuItem}>
            <Ionicons name="cloud-outline" size={24} color="#075E54" style={styles.menuIcon} />
            <Text style={styles.menuText}>Auto Sync</Text>
            <Switch
              value={true}
              trackColor={{ false: '#CCCCCC', true: '#128C7E' }}
              thumbColor={'#075E54'}
              disabled={true}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.menuItem, styles.lastMenuItem]} 
            onPress={async () => {
              if (isSyncing) return;
              
              setIsSyncing(true);
              const result = await syncWithCloud();
              setIsSyncing(false);
              
              if (result.success) {
                Alert.alert('Success', 'Data synced successfully with cloud.');
              } else {
                Alert.alert('Error', result.error || 'Failed to sync data with cloud.');
              }
            }}
            disabled={isSyncing}
          >
            <Ionicons name="sync-outline" size={24} color="#075E54" style={styles.menuIcon} />
            <Text style={styles.menuText}>Sync Now</Text>
            {isSyncing ? (
              <ActivityIndicator size="small" color="#075E54" />
            ) : (
              <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
            )}
          </TouchableOpacity>
          
          {lastSyncTime && (
            <View style={styles.syncInfoContainer}>
              <Text style={styles.syncInfoText}>
                Last synced: {lastSyncTime.toLocaleString()}
              </Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Jot Chat v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#8F8F8F',
  },
  section: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#075E54',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 14,
    color: '#8F8F8F',
    marginRight: 5,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  syncInfoContainer: {
    paddingTop: 10,
    alignItems: 'center',
  },
  syncInfoText: {
    fontSize: 12,
    color: '#8F8F8F',
  },
  logoutButton: {
    margin: 20,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  versionText: {
    color: '#8F8F8F',
    fontSize: 14,
  },
});

export default ProfileScreen;

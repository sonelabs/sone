import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Notification behavior settings
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Register for push notifications
async function registerForPushNotificationsAsync() {
  const { status } = await Notifications.requestPermissionsAsync();
  console.log('Notification permission status:', status);
  if (status !== 'granted') {
    alert('Permission to receive notifications is required!');
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

// Schedule notification
async function scheduleNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "PATIENT UPDATE",
      body: 'LIGHT IS ON 💡',
      data: { data: 'goes here' },
    },
    trigger: { seconds: 1 },
  });
}

export default function App() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <TouchableOpacity  onPress={() => alert('Call button pressed')}>
        {renderGridButton('call', require('./alert-icon.png'))}
        </TouchableOpacity>
      </View>
      
      {/* Main Grid */}
      <View style={styles.gridContainer}>
        {renderGridButton('Ice', require('./ice-icon.png'))}
        {renderGridButton('Food', require('./food-icon.png'))}
        {renderGridButton('Water', require('./water-icon.png'))}
        {renderGridButton('Medication', require('./med-icon.png'))}
        {renderGridButton('Bathroom', require('./toilet-icon.png'), scheduleNotification)}
        {renderGridButton('Lights', require('./light-icon.png'), scheduleNotification)}
      </View>
    </View>
  );
}

// Helper function to render grid buttons
function renderGridButton(label, iconSource, onPress) {
  return (
    <TouchableOpacity style={styles.gridButton} onPress={onPress || (() => {})}>
      <Image source={iconSource} style={styles.icon} />
      <Text style={styles.gridButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: '20%',
    backgroundColor: '#D32F2F', // Red background for sidebar
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonText: {
    color: 'white',
    fontSize: 18,
  },
  gridContainer: {
    flex: 1,
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#121212', // Dark background for the main area
  },
  gridButton: {
    backgroundColor: '#F5F5F5', // Light grey background for buttons
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    borderRadius: 10,
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  gridButtonText: {
    fontSize: 16,
    color: '#000',
  },
});


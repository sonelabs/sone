import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av'; // Import Audio from expo-av

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

// Function to play sound
async function playSound(soundFile) {
  const { sound } = await Audio.Sound.createAsync(soundFile);
  await sound.playAsync();
}

// Function to send a notification
async function sendNotification(title, body) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
    },
    trigger: null, // Send immediately
  });
}

// Function to make a phone call
async function makePhoneCall() {
  // Play sound
  await playSound(require('./call-sound.mp3'));

  // Send notification
  await sendNotification('Calling', 'Initiating phone call...');

  let phoneNumber = '';
  if (Platform.OS === 'android') {
    phoneNumber = 'tel:2024031545'; // Replace with the phone number you want to call
  } else {
    phoneNumber = 'telprompt:2024031545'; // Use 'telprompt:' for iOS
  }

  // Delay slightly to let the sound play before opening the dialer
  setTimeout(() => {
    Linking.openURL(phoneNumber).catch(err => console.error('Failed to make a call:', err));
  }, 500);
}

export default function App() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <View style={styles.container}>
      {/* Sidebar as the Call Button */}
      <TouchableOpacity style={styles.sidebar} onPress={makePhoneCall}>
        <Image source={require('./alert-icon.png')} style={styles.alertIcon} />
        <Text style={styles.alertButtonText}>Call</Text>
      </TouchableOpacity>
      
      {/* Main Grid */}
      <View style={styles.gridContainer}>
        {renderGridButton('Ice', require('./ice-icon.png'), require('./ice-sound.mp3'), 'Ice', 'Ice button was clicked!')}
        {renderGridButton('Food', require('./food-icon.png'), require('./food-sound.mp3'), 'Food', 'Food button was clicked!')}
        {renderGridButton('Water', require('./water-icon.png'), require('./water-sound.mp3'), 'Water', 'Water button was clicked!')}
        {renderGridButton('Medication', require('./med-icon.png'), require('./med-sound.mp3'), 'Medication', 'Medication button was clicked!')}
        {renderGridButton('Bathroom', require('./toilet-icon.png'), require('./toilet-sound.mp3'), 'Bathroom', 'Bathroom button was clicked!')}
        {renderGridButton('Lights', require('./light-icon.png'), require('./light-sound.mp3'), 'Lights', 'Lights button was clicked!')}
      </View>
    </View>
  );
}

// Helper function to render grid buttons
function renderGridButton(label, iconSource, soundFile, notificationTitle, notificationBody, onPress) {
  return (
    <TouchableOpacity
      style={styles.gridButton}
      onPress={async () => {
        // Play sound
        await playSound(soundFile);
        // Send notification
        await sendNotification(notificationTitle, notificationBody);
        // Call the onPress function if provided
        if (onPress) onPress();
      }}
    >
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
    flex: 1, // Fill the entire height of the container
    padding: 5,
  },
  alertIcon: {
    width: 150,
    height: 150,
    marginBottom: 4,
  },
  alertButtonText: {
    fontSize: 30,
    color: '#FFF', // White text for contrast
    fontWeight: 'bold',
  },
  gridContainer: {
    flex: 4, // Adjust to fill the remaining space
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    paddingTop: 90,
    backgroundColor: '#121212', // Dark background for the main area
  },
  gridButton: {
    backgroundColor: '#F5F5F5', // Light grey background for buttons
    width: '26%', // Set width to 26% of the container
    aspectRatio: 1, // This ensures the button is a square
    justifyContent: 'center',
    alignItems: 'center',
    margin: 30, // Margin to space out buttons
    borderRadius: 10,
  },
  icon: {
    width: '60%',
    height: '60%',
    marginBottom: 8,
  },
  gridButtonText: {
    fontSize: 30,
    color: '#000',
    marginRight: 10,
  },
});

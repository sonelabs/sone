import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import { Ionicons  } from '@expo/vector-icons';

// notification handler settings
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// helper functions to register push notifications
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

async function playSound(soundFile) {
  const { sound } = await Audio.Sound.createAsync(soundFile);
  await sound.playAsync();
}

async function sendNotification(title, body) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
    },
    trigger: null,
  });
}

async function makePhoneCall() {
  await playSound(require('@/assets/sounds/call-sound.mp3'));
  await sendNotification('Calling', 'Initiating phone call...');

  let phoneNumber = Platform.OS === 'android' ? 'tel:2024031545' : 'telprompt:2024031545';
  
  setTimeout(() => {
    Linking.openURL(phoneNumber).catch(err => console.error('Failed to make a call:', err));
  }, 500);
}

// main app component
export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsRecording(false);
      console.log('Recording saved at:', uri);
      setRecording(null);
      await sendNotification('Message Recorded', 'Custom message has been saved');
      playRecording(uri);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  }

  async function playRecording(uri) {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
    } catch (err) {
      console.error('Error playing back recording:', err);
    }
  }

  const handleMessagePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <TouchableOpacity style={styles.sidebar} onPress={makePhoneCall}>
        <Image source={require('@/assets/images/alert-icon.png')} style={styles.alertIcon} />
        <Text style={styles.alertButtonText}>Call</Text>
      </TouchableOpacity>
      
      {/* Main content container */}
      <View style={styles.mainContent}>
        {/* Grid Container */}
        <View style={styles.gridContainer}>
          {renderGridButton('Ice', require('@/assets/images/ice-icon.png'), require('@/assets/sounds/ice-sound.mp3'), 'Ice', 'Ice button was clicked!')}
          {renderGridButton('Food', require('@/assets/images/food-icon.png'), require('@/assets/sounds/food-sound.mp3'), 'Food', 'Food button was clicked!')}
          {renderGridButton('Water', require('@/assets/images/water-icon.png'), require('@/assets/sounds/water-sound.mp3'), 'Water', 'Water button was clicked!')}
          {renderGridButton('Medication', require('@/assets/images/med-icon.png'), require('@/assets/sounds/med-sound.mp3'), 'Medication', 'Medication button was clicked!')}
          {renderGridButton('Bathroom', require('@/assets/images/toilet-icon.png'), require('@/assets/sounds/toilet-sound.mp3'), 'Bathroom', 'Bathroom button was clicked!')}
          {renderGridButton('Lights', require('@/assets/images/light-icon.png'), require('@/assets/sounds/light-sound.mp3'), 'Lights', 'Lights button was clicked!')}
        </View>

        {/* Message Bar */}
        <TouchableOpacity 
          style={[styles.messageBar, isRecording && styles.messageBarRecording]} 
          onPress={handleMessagePress}
        >
          <View style={styles.messageBarContent}>
            <Ionicons
              name={isRecording ? "mic" : "mic-outline"}
              size={24}
              color={isRecording ? "#FF0000" : "#000000"}
              style={styles.micIcon}
            />
            <Text style={styles.messageBarText}>
              {isRecording ? 'Recording...' : 'Custom Message'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Helper function for grid buttons remains the same
function renderGridButton(label, iconSource, soundFile, notificationTitle, notificationBody) {
  return (
    <TouchableOpacity
      style={styles.gridButton}
      onPress={async () => {
        await playSound(soundFile);
        await sendNotification(notificationTitle, notificationBody);
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
  mainContent: {
    flex: 4,
    backgroundColor: '#121212',
  },
  sidebar: {
    width: '20%',
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    padding: 5,
  },
  alertIcon: {
    width: 150,
    height: 150,
    marginBottom: 4,
  },
  alertButtonText: {
    fontSize: 30,
    color: '#FFF',
    fontWeight: 'bold',
  },
  gridContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    paddingTop: 90,
  },
  gridButton: {
    backgroundColor: '#F5F5F5',
    width: '26%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 30,
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
  messageBar: {
    backgroundColor: '#FFFFFF',
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  messageBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  messageBarRecording: {
    // backgroundColor: '#FF8A80', // change color of entire button when recording
  },
  messageBarText: {
    fontSize: 32,
    color: '#000000',
    fontWeight: '500',
  },
  micIcon: {
    fontSize: 45,
    marginRight: 10,
  },
});
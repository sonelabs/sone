import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { audioService, notificationService, phoneService, processSpeechToText } from '@/services';
import EyeTrackingCursor from '@/components/EyeTrackingCursor';

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    notificationService.setup().catch(error => {
      console.error('Failed to setup notifications:', error);
    });
  }, []);

  async function startRecording() {
    try {
      const { recording } = await audioService.startRecording();
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      alert('Failed to start recording. Please try again.');
    }
  }

  async function stopRecording() {
    try {
      if (!recording) return;

      setIsProcessing(true);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsRecording(false);
      
      await audioService.playRecording(uri);
      setRecording(null);
      
      await notificationService.sendLocalNotification('Message Recorded', 'Processing speech-to-text...');
      
      const text = await processSpeechToText(uri);
      setTranscription(text);
      
      await notificationService.sendPushNotification('New Voice Message', text);
      await notificationService.sendLocalNotification('New Message', text);
    } catch (err) {
      console.error('Error processing recording:', err);
      alert('Failed to process recording. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }

  const handleMessagePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  function renderGridButton(label, iconSource, soundFile, notificationTitle, notificationBody) {
    return (
      <TouchableOpacity
        style={styles.gridButton}
        onPress={async () => {
          try {
            // Play sound effect
            await audioService.playSound(soundFile);
            
            // Send local notification
            await notificationService.sendLocalNotification(notificationTitle, notificationBody);

            // Send push notification to companion app
            await notificationService.sendPushNotification(
              `${label} Request`,
              `A patient is requesting ${label.toLowerCase()}`
            );
          } catch (error) {
            console.error(`Error handling ${label} button press:`, error);
          }
        }}
      >
        <Image source={iconSource} style={styles.icon} />
        <Text style={styles.gridButtonText}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <EyeTrackingCursor /> {/* Render the eye tracking cursor as an overlay */}
      <TouchableOpacity 
        style={styles.sidebar} 
        onPress={async () => {
          try {
            // Send push notification before making the call
            await notificationService.sendPushNotification(
              'Emergency Call',
              'A patient is attempting to make an emergency call'
            );
            // Make the phone call
            await phoneService.makeCall('2024031545');
          } catch (error) {
            console.error('Error handling emergency call:', error);
          }
        }}
      >
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

        {/* Transcription Display */}
        <View style={styles.transcriptionContainer}>
          <Text style={styles.transcriptionText}>
            {isProcessing ? 'Processing...' : transcription || 'No transcription yet'}
          </Text>
        </View>

        {/* Message Bar */}
        <TouchableOpacity 
          style={[styles.messageBar, isRecording && styles.messageBarRecording]} 
          onPress={handleMessagePress}
          disabled={isProcessing}
        >
          <View style={styles.messageBarContent}>
            <Ionicons
              name={isRecording ? "mic" : "mic-outline"}
              size={24}
              color={isRecording ? "#FF0000" : "#000000"}
              style={styles.micIcon}
            />
            <Text style={styles.messageBarText}>
              {isProcessing ? 'Processing...' : isRecording ? 'Recording...' : 'Custom Message'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
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
    backgroundColor: '#FFE0E0', // change color of entire button when recording
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
  transcriptionContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
  },
  transcriptionText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '400',
  },
});
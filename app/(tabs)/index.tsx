import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { audioService, notificationService, phoneService, processSpeechToText } from '@/services';

import EyeTrackingCursor from '@/components/eye-tracking/EyetrackingCursor';
import GridIcon from '@/components/eye-tracking/GridIcon';
import { CursorProvider } from '@/components/eye-tracking/CursorContext';

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<any>(null);
  const [transcription, setTranscription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    notificationService.setup().catch((error) => {
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

  return (
    <CursorProvider>
      <View style={styles.container}>
        {/* Render the eye-tracking cursor overlay */}
        <EyeTrackingCursor />

        {/* Sidebar (e.g., emergency call) */}
        <TouchableOpacity
          style={styles.sidebar}
          onPress={async () => {
            try {
              await notificationService.sendPushNotification(
                'Emergency Call',
                'A patient is attempting to make an emergency call'
              );
              await phoneService.makeCall('2024031545');
            } catch (error) {
              console.error('Error handling emergency call:', error);
            }
          }}
        >
          <Image source={require('@/assets/images/alert-icon.png')} style={styles.alertIcon} />
          <Text style={styles.alertButtonText}>Call</Text>
        </TouchableOpacity>

        {/* Main content */}
        <View style={styles.mainContent}>
          {/* Grid container using GridIcon with dwell detection */}
          <View style={styles.gridContainer}>
            <GridIcon
              label="Ice"
              iconSource={require('@/assets/images/ice-icon.png')}
              onPress={async () => {
                await audioService.playSound(require('@/assets/sounds/ice-sound.mp3'));
                await notificationService.sendLocalNotification('Ice', 'Ice button was clicked!');
                await notificationService.sendPushNotification('Ice Request', 'A patient is requesting ice.');
              }}
            />
            <GridIcon
              label="Food"
              iconSource={require('@/assets/images/food-icon.png')}
              onPress={async () => {
                await audioService.playSound(require('@/assets/sounds/food-sound.mp3'));
                await notificationService.sendLocalNotification('Food', 'Food button was clicked!');
                await notificationService.sendPushNotification('Food Request', 'A patient is requesting food.');
              }}
            />
            <GridIcon
              label="Water"
              iconSource={require('@/assets/images/water-icon.png')}
              onPress={async () => {
                await audioService.playSound(require('@/assets/sounds/water-sound.mp3'));
                await notificationService.sendLocalNotification('Water', 'Water button was clicked!');
                await notificationService.sendPushNotification('Water Request', 'A patient is requesting water.');
              }}
            />
            <GridIcon
              label="Medication"
              iconSource={require('@/assets/images/med-icon.png')}
              onPress={async () => {
                await audioService.playSound(require('@/assets/sounds/med-sound.mp3'));
                await notificationService.sendLocalNotification('Medication', 'Medication button was clicked!');
                await notificationService.sendPushNotification('Medication Request', 'A patient is requesting medication.');
              }}
            />
            <GridIcon
              label="Bathroom"
              iconSource={require('@/assets/images/toilet-icon.png')}
              onPress={async () => {
                await audioService.playSound(require('@/assets/sounds/toilet-sound.mp3'));
                await notificationService.sendLocalNotification('Bathroom', 'Bathroom button was clicked!');
                await notificationService.sendPushNotification('Bathroom Request', 'A patient is requesting bathroom.');
              }}
            />
            <GridIcon
              label="Lights"
              iconSource={require('@/assets/images/light-icon.png')}
              onPress={async () => {
                await audioService.playSound(require('@/assets/sounds/light-sound.mp3'));
                await notificationService.sendLocalNotification('Lights', 'Lights button was clicked!');
                await notificationService.sendPushNotification('Lights Request', 'A patient is requesting lights.');
              }}
            />
          </View>

          {/* Transcription display */}
          <View style={styles.transcriptionContainer}>
            <Text style={styles.transcriptionText}>
              {isProcessing ? 'Processing...' : transcription || 'No transcription yet'}
            </Text>
          </View>

          {/* Message bar */}
          <TouchableOpacity
            style={[styles.messageBar, isRecording && styles.messageBarRecording]}
            onPress={handleMessagePress}
            disabled={isProcessing}
          >
            <View style={styles.messageBarContent}>
              <Ionicons
                name={isRecording ? 'mic' : 'mic-outline'}
                size={24}
                color={isRecording ? '#FF0000' : '#000000'}
                style={styles.micIcon}
              />
              <Text style={styles.messageBarText}>
                {isProcessing ? 'Processing...' : isRecording ? 'Recording...' : 'Custom Message'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </CursorProvider>
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
    backgroundColor: '#FFE0E0',
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

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const TARGET_PUSH_TOKEN = 'ExponentPushToken[wG11nVHQOvOwCQNs05hSj6]';

export const notificationService = {
  async setup() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      throw new Error('Permission to receive notifications is required!');
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: "ee0651f7-2b31-4460-87b1-3ed78076185a"
    });
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return tokenData.data;
  },

  async sendLocalNotification(title: string, body: string) {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  },

  async sendPushNotification(title: string, body: string) {
    const message = {
      to: TARGET_PUSH_TOKEN,
      sound: 'default',
      title,
      body,
      data: { timestamp: new Date().toISOString() },
    };

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      return await response.json();
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }
};
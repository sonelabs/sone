import { Platform, Linking } from 'react-native';
import { audioService } from './audio';
import { notificationService } from './notifications';

export const phoneService = {
  async makeCall(phoneNumber: string) {
    await audioService.playSound(require('@/assets/sounds/call-sound.mp3'));
    await notificationService.sendLocalNotification('Calling', 'Initiating phone call...');

    const formattedNumber = Platform.OS === 'android' 
      ? `tel:${phoneNumber}` 
      : `telprompt:${phoneNumber}`;
    
    setTimeout(() => {
      Linking.openURL(formattedNumber).catch(err => {
        console.error('Failed to make a call:', err);
        throw err;
      });
    }, 500);
  }
};
import { Audio } from 'expo-av';

export const recordingOptions = {
  android: {
    extension: '.wav',
    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_PCM,
    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 16000,
    linearPCM: true
  },
  ios: {
    extension: '.wav',
    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 16000,
    linearPCM: true,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};

export const audioService = {
  async requestPermissions() {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to record audio is required.');
    }
  },

  async setupRecording() {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
  },

  async startRecording() {
    await this.requestPermissions();
    await this.setupRecording();
    return await Audio.Recording.createAsync(recordingOptions);
  },

  async playSound(soundFile: any) {
    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
  },

  async playRecording(uri: string) {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
    } catch (err) {
      console.error('Error playing back recording:', err);
      throw err;
    }
  }
};
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import * as FileSystem from 'expo-file-system';

const AZURE_SPEECH_KEY = "API HERE";
const AZURE_REGION = 'eastus';

export async function processSpeechToText(audioUri: string): Promise<string> {
  try {
    const audioData = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const binaryString = atob(audioData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const pushStream = SpeechSDK.AudioInputStream.createPushStream();
    pushStream.write(bytes.buffer);
    pushStream.close();

    const audioConfig = SpeechSDK.AudioConfig.fromStreamInput(pushStream);
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_REGION);
    
    speechConfig.speechRecognitionLanguage = "en-US";

    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    return new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        (result) => {
          if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
            resolve(result.text);
          } else {
            reject(new Error(`Speech recognition failed: ${result.reason}`));
          }
          recognizer.close();
        },
        (error) => {
          reject(error);
          recognizer.close();
        }
      );
    });
  } catch (error) {
    console.error('Error in processSpeechToText:', error);
    throw error;
  }
}
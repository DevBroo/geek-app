/**
 * Speech-to-Text Service
 * 
 * This service handles converting audio recordings to text using Google Cloud Speech-to-Text API.
 * Note: In a production app, you would need to set up proper authentication with Google Cloud.
 */

// API endpoint for Google Cloud Speech-to-Text
const SPEECH_TO_TEXT_API_URL = 'https://speech.googleapis.com/v1/speech:recognize';
// Replace with your actual API key
const API_KEY = 'YOUR_GOOGLE_CLOUD_API_KEY';

/**
 * Converts an audio file to text using Google Cloud Speech-to-Text API
 * 
 * @param audioUri - Local URI of the audio file to transcribe
 * @returns Promise with the transcribed text
 */
export const convertSpeechToText = async (audioUri: string): Promise<string> => {
  try {
    // First, we need to read the audio file and convert it to base64
    const response = await fetch(audioUri);
    const blob = await response.blob();
    const base64Audio = await blobToBase64(blob);
    
    // Prepare the request to Google Cloud Speech-to-Text API
    const requestData = {
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US',
        model: 'default',
      },
      audio: {
        content: base64Audio,
      },
    };
    
    // Send the request to the API
    const apiResponse = await fetch(`${SPEECH_TO_TEXT_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    
    // Parse the response
    const data = await apiResponse.json();
    
    // Extract the transcribed text
    if (data.results && data.results.length > 0) {
      return data.results[0].alternatives[0].transcript;
    }
    
    return '';
  } catch (error) {
    console.error('Error converting speech to text:', error);
    throw new Error('Failed to convert speech to text');
  }
};

/**
 * Helper function to convert a Blob to base64 string
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:audio/wav;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Alternative implementation using a mock service for testing
 * Use this when you don't have an API key or for development
 */
export const mockSpeechToText = async (): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return a random search query from this list
  const possibleQueries = [
    'wireless headphones',
    'gaming laptop',
    'smartphone with good camera',
    'mechanical keyboard',
    'smart watch',
    'bluetooth speaker'
  ];
  
  return possibleQueries[Math.floor(Math.random() * possibleQueries.length)];
};
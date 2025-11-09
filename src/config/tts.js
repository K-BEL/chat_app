// TTS Configuration
export const TTS_CONFIG = {
  // Backend API URL for Continue-TTS
  API_URL: import.meta.env.VITE_TTS_API_URL || 'http://localhost:5000',
  
  // Default voice for Continue-TTS
  DEFAULT_VOICE: 'nova',
  
  // Available voices
  VOICES: [
    { id: 'nova', name: 'Nova', gender: 'Female' },
    { id: 'aurora', name: 'Aurora', gender: 'Female' },
    { id: 'stellar', name: 'Stellar', gender: 'Female' },
    { id: 'atlas', name: 'Atlas', gender: 'Male' },
    { id: 'orion', name: 'Orion', gender: 'Male' },
    { id: 'luna', name: 'Luna', gender: 'Female' },
    { id: 'phoenix', name: 'Phoenix', gender: 'Male' },
    { id: 'ember', name: 'Ember', gender: 'Female' }
  ],
  
  // Fallback to browser SpeechSynthesis if API is unavailable
  USE_FALLBACK: true
}


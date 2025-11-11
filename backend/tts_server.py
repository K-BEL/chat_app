"""
Continue-TTS Backend Server
Provides TTS API endpoint using SVECTOR-CORPORATION/Continue-TTS model
"""
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import torch
import wave
import io
import numpy as np
from continue_tts import Continue1Model
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Enable CORS for frontend
CORS(app, resources={
    r"/*": {
        "origins": "*",  # Allow all origins (restrict this in production)
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Global model instance
model = None
model_loaded = False

def load_model():
    """Load the Continue-TTS model"""
    global model, model_loaded
    
    if model_loaded:
        return model
    
    try:
        logger.info("Loading Continue-TTS model...")
        model = Continue1Model(
            model_name="SVECTOR-CORPORATION/Continue-TTS",
            max_model_len=2048
        )
        model_loaded = True
        logger.info("✅ Continue-TTS model loaded successfully!")
        return model
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        raise

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model_loaded
    })

@app.route('/tts/generate', methods=['POST'])
def generate_speech():
    """
    Generate speech from text using Continue-TTS
    
    Request body:
    {
        "text": "Your text here",
        "voice": "nova"  // Optional: nova, aurora, stellar, atlas, orion, luna, phoenix, ember
    }
    
    Returns:
    - Audio file (WAV format) as binary
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Missing "text" field'}), 400
        
        text = data['text']
        voice = data.get('voice', 'nova')  # Default to 'nova'
        
        if not text.strip():
            return jsonify({'error': 'Text cannot be empty'}), 400
        
        # Validate voice
        valid_voices = ['nova', 'aurora', 'stellar', 'atlas', 'orion', 'luna', 'phoenix', 'ember']
        if voice not in valid_voices:
            return jsonify({'error': f'Invalid voice. Must be one of: {", ".join(valid_voices)}'}), 400
        
        logger.info(f"Generating speech: voice={voice}, text_length={len(text)}")
        
        # Load model if not loaded
        if not model_loaded:
            load_model()
        
        # Generate speech
        audio_chunks = model.generate_speech(
            prompt=text,
            voice=voice,
            temperature=0.6,
            top_p=0.8,
            max_tokens=1200,
            repetition_penalty=1.3
        )
        
        # Convert audio chunks to WAV format
        audio_data = b''.join(audio_chunks)
        
        # Create WAV file in memory
        wav_buffer = io.BytesIO()
        with wave.open(wav_buffer, 'wb') as wf:
            wf.setnchannels(1)  # Mono
            wf.setsampwidth(2)  # 16-bit
            wf.setframerate(24000)  # 24kHz sample rate
            wf.writeframes(audio_data)
        
        wav_buffer.seek(0)
        
        logger.info(f"✅ Speech generated successfully ({len(audio_data)} bytes)")
        
        return send_file(
            wav_buffer,
            mimetype='audio/wav',
            as_attachment=False,
            download_name='speech.wav'
        )
        
    except Exception as e:
        logger.error(f"Error generating speech: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/tts/voices', methods=['GET'])
def get_voices():
    """Get list of available voices"""
    return jsonify({
        'voices': [
            {'id': 'nova', 'name': 'Nova', 'gender': 'Female', 'description': 'Conversational and natural'},
            {'id': 'aurora', 'name': 'Aurora', 'gender': 'Female', 'description': 'Warm and friendly'},
            {'id': 'stellar', 'name': 'Stellar', 'gender': 'Female', 'description': 'Energetic and bright'},
            {'id': 'atlas', 'name': 'Atlas', 'gender': 'Male', 'description': 'Deep and authoritative'},
            {'id': 'orion', 'name': 'Orion', 'gender': 'Male', 'description': 'Friendly and casual'},
            {'id': 'luna', 'name': 'Luna', 'gender': 'Female', 'description': 'Soft and gentle'},
            {'id': 'phoenix', 'name': 'Phoenix', 'gender': 'Male', 'description': 'Dynamic and expressive'},
            {'id': 'ember', 'name': 'Ember', 'gender': 'Female', 'description': 'Warm and engaging'}
        ]
    })

if __name__ == '__main__':
    # Check if running in development mode
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting TTS server on port {port}")
    logger.info("Note: Model will be loaded on first request")
    
    app.run(host='0.0.0.0', port=port, debug=debug)


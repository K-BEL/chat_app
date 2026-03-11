#!/bin/bash
# Test TTS generation by calling the cloud server via SSH tunnel
# Saves WAV files to this generate/ folder for playback testing

TTS_URL="${TTS_URL:-http://localhost:8081}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🔍 Checking TTS server at $TTS_URL ..."
HEALTH=$(curl -s "$TTS_URL/health")
echo "Health: $HEALTH"
echo ""

# Test 1: Generate with default voice (nova)
echo "🎤 Test 1: Generating speech with voice=orion ..."
curl -s -X POST "$TTS_URL/tts/generate" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello! This is a test of the cloud TTS server using the Orion voice.", "voice": "orion"}' \
  -o "$SCRIPT_DIR/test_orion.wav"
echo "  → Saved to $SCRIPT_DIR/test_orion.wav ($(wc -c < "$SCRIPT_DIR/test_orion.wav") bytes)"

# Test 2: Generate with nova voice
echo "🎤 Test 2: Generating speech with voice=nova ..."
curl -s -X POST "$TTS_URL/tts/generate" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello! This is a test of the cloud TTS server using the Nova voice.", "voice": "nova"}' \
  -o "$SCRIPT_DIR/test_nova.wav"
echo "  → Saved to $SCRIPT_DIR/test_nova.wav ($(wc -c < "$SCRIPT_DIR/test_nova.wav") bytes)"

# Test 3: Test tone (440Hz sine wave - no model needed)
echo "🎤 Test 3: Generating test tone ..."
curl -s "$TTS_URL/tts/test" -o "$SCRIPT_DIR/test_tone.wav"
echo "  → Saved to $SCRIPT_DIR/test_tone.wav ($(wc -c < "$SCRIPT_DIR/test_tone.wav") bytes)"

echo ""
echo "✅ Done! Play the files to compare:"
echo "  open $SCRIPT_DIR/test_orion.wav"
echo "  open $SCRIPT_DIR/test_nova.wav"
echo "  open $SCRIPT_DIR/test_tone.wav"

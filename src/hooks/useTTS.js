import { useState, useRef, useEffect } from 'react'

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentMessageId, setCurrentMessageId] = useState(null)
  const [audioVolume, setAudioVolume] = useState(0)
  const synthRef = useRef(null)
  const utteranceRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animationFrameRef = useRef(null)
  const volumeSimulationIntervalRef = useRef(null)
  const isCurrentlySpeakingRef = useRef(false)

  useEffect(() => {
    synthRef.current = window.speechSynthesis
    
    // Initialize Web Audio API for volume analysis
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (AudioContext) {
        audioContextRef.current = new AudioContext()
        analyserRef.current = audioContextRef.current.createAnalyser()
        analyserRef.current.fftSize = 256
        analyserRef.current.smoothingTimeConstant = 0.8
      }
    } catch (error) {
      console.warn('Web Audio API not available:', error)
    }
    
    return () => {
      // Cleanup on unmount
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Analyze audio volume in real-time
  const analyzeVolume = () => {
    if (!analyserRef.current || !isSpeaking) {
      setAudioVolume(0)
      return
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    
    // Calculate average volume
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i]
    }
    const average = sum / dataArray.length
    const normalizedVolume = average / 255 // Normalize to 0-1
    
    setAudioVolume(normalizedVolume)

    if (isSpeaking) {
      animationFrameRef.current = requestAnimationFrame(analyzeVolume)
    }
  }

  const speak = (text, messageId) => {
    // Stop any current speech
    stop()
    
    if (!text || !synthRef.current) return

    // Resume audio context if suspended (browser autoplay policy)
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // Since SpeechSynthesis doesn't expose audio stream directly,
    // we'll simulate volume based on speech characteristics
    // For a real implementation, you'd need to use a TTS service that provides audio stream

    const simulateVolume = () => {
      if (!isCurrentlySpeakingRef.current) {
        if (volumeSimulationIntervalRef.current) {
          clearInterval(volumeSimulationIntervalRef.current)
          volumeSimulationIntervalRef.current = null
        }
        return
      }
      
      // Simulate volume based on speech pattern
      // Create a more realistic talking pattern
      const time = Date.now() / 100
      const baseVolume = 0.4
      const variation = Math.sin(time) * 0.3 + Math.random() * 0.3
      const volumeSimulation = Math.max(0.1, Math.min(1.0, baseVolume + variation))
      
      setAudioVolume(volumeSimulation)
    }

    utterance.onstart = () => {
      console.log('🔊 TTS started speaking')
      setIsSpeaking(true)
      setCurrentMessageId(messageId)
      isCurrentlySpeakingRef.current = true
      setAudioVolume(0.5) // Start with medium volume
      
      // Clear any existing interval
      if (volumeSimulationIntervalRef.current) {
        clearInterval(volumeSimulationIntervalRef.current)
      }
      
      // Update volume every 50ms for smooth animation
      volumeSimulationIntervalRef.current = setInterval(simulateVolume, 50)
      console.log('✅ Volume simulation started')
    }

    utterance.onend = () => {
      console.log('🔇 TTS finished speaking')
      isCurrentlySpeakingRef.current = false
      setIsSpeaking(false)
      setCurrentMessageId(null)
      setAudioVolume(0)
      if (volumeSimulationIntervalRef.current) {
        clearInterval(volumeSimulationIntervalRef.current)
        volumeSimulationIntervalRef.current = null
      }
    }

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error)
      isCurrentlySpeakingRef.current = false
      setIsSpeaking(false)
      setCurrentMessageId(null)
      setAudioVolume(0)
      if (volumeSimulationIntervalRef.current) {
        clearInterval(volumeSimulationIntervalRef.current)
        volumeSimulationIntervalRef.current = null
      }
    }

    utteranceRef.current = utterance
    synthRef.current.speak(utterance)
  }

  const stop = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel()
    }
    isCurrentlySpeakingRef.current = false
    setIsSpeaking(false)
    setCurrentMessageId(null)
    setAudioVolume(0)
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    // Clear volume simulation interval
    if (volumeSimulationIntervalRef.current) {
      clearInterval(volumeSimulationIntervalRef.current)
      volumeSimulationIntervalRef.current = null
    }
  }

  return {
    speak,
    stop,
    isSpeaking,
    currentMessageId,
    audioVolume,
  }
}

import { useState, useEffect, useRef } from 'react'
import { useGroq } from '../hooks/useGroq'
import { useTTS } from '../hooks/useTTS'
import { parseMarkdown } from '../utils/markdown'
import Avatar3D from './Avatar3D'
import './ChatBox.css'

function ChatBox({ mode, avatarUrl, useSingleModel = false }) {
  const [input, setInput] = useState('')
  const { messages, sendMessage, isLoading } = useGroq()
  const { speak, stop, isSpeaking, currentMessageId, audioVolume } = useTTS()
  const messagesEndRef = useRef(null)
  const isVoiceMode = mode === 'voice'
  const autoPlayRef = useRef(isVoiceMode) // Auto-play TTS only in voice mode
  
  // Get current emotion from last AI message
  const currentEmotion = messages.length > 0 && messages[messages.length - 1].role === 'assistant'
    ? messages[messages.length - 1].content
    : null

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Auto-play TTS for new AI messages (only in voice mode)
  useEffect(() => {
    if (isVoiceMode && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'assistant' && autoPlayRef.current && !isLoading) {
        const messageId = messages.length - 1
        // Small delay to ensure message is rendered
        const timeoutId = setTimeout(() => {
          console.log('🔊 Auto-playing TTS for message:', lastMessage.content.substring(0, 50) + '...')
          speak(lastMessage.content, messageId)
        }, 300)
        return () => clearTimeout(timeoutId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isLoading, isVoiceMode])

  const textareaRef = useRef(null)

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [input])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      stop() // Stop any current speech
      sendMessage(input)
      setInput('')
    }
  }

  const handleSpeak = (content, messageId) => {
    if (isSpeaking && currentMessageId === messageId) {
      stop()
    } else {
      speak(content, messageId)
    }
  }

  return (
    <div className="chat-container">
      {isVoiceMode && (
        <div className="avatar-panel">
          <Avatar3D 
            isSpeaking={isSpeaking} 
            audioVolume={audioVolume} 
            avatarUrl={avatarUrl}
            currentMessage={currentEmotion}
            useSingleModel={useSingleModel}
          />
        </div>
      )}
      <div className="chat-content">
        <div className="chat-header">
          <div className="header-content">
            <h1>AI Chat - {mode === 'voice' ? 'Voice Mode' : 'Text Mode'}</h1>
            {isVoiceMode && (
              <div className="header-actions">
                <button
                  className="tts-toggle"
                  onClick={() => {
                    autoPlayRef.current = !autoPlayRef.current
                    if (!autoPlayRef.current) stop()
                  }}
                  title={autoPlayRef.current ? 'Disable auto-play' : 'Enable auto-play'}
                >
                  {autoPlayRef.current ? '🔊' : '🔇'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <div className="welcome-icon">💬</div>
            <h2>How can I help you today?</h2>
            <p>Start a conversation with AI</p>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message-wrapper ${message.role === 'user' ? 'user-wrapper' : 'ai-wrapper'}`}
          >
            <div className="message-avatar">
              {message.role === 'user' ? (
                <div className="avatar-user">U</div>
              ) : (
                <div className="avatar-ai">AI</div>
              )}
            </div>
            <div className="message-container">
              <div
                className={`message ${message.role === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <div 
                  className="message-content"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
                />
                {message.role === 'assistant' && message.content && isVoiceMode && (
                  <div className="message-actions">
                    <button
                      className={`tts-button ${isSpeaking && currentMessageId === index ? 'speaking' : ''}`}
                      onClick={() => handleSpeak(message.content, index)}
                      title={isSpeaking && currentMessageId === index ? 'Stop speaking' : 'Read aloud'}
                    >
                      {isSpeaking && currentMessageId === index ? '⏸️' : '🔊'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-wrapper ai-wrapper">
            <div className="message-avatar">
              <div className="avatar-ai">AI</div>
            </div>
            <div className="message-container">
              <div className="message ai-message">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <form className="chat-input-form" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              className="chat-input"
              placeholder="Message AI..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                adjustTextareaHeight()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              disabled={isLoading}
              rows={1}
            />
            <button
              type="submit"
              className="send-button"
              disabled={!input.trim() || isLoading}
              title="Send message"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m22 2-7 20-4-9-9-4Z"/>
                <path d="M22 2 11 13"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  )
}

export default ChatBox

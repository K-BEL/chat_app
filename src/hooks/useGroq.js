import { useState } from 'react'

export function useGroq() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (userMessage) => {
    const userMsg = { role: 'user', content: userMessage }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY
      if (!apiKey) throw new Error('Missing VITE_GROQ_API_KEY')

      // Build conversation history
      const conversationHistory = [...messages, userMsg].map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      // Call Groq API (OpenAI-compatible endpoint)
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile', // Fast and capable model
          messages: conversationHistory,
          temperature: 0.7,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.error?.message || 'Request failed'
        
        // Check for quota/rate limit errors
        if (errorMsg.includes('quota') || errorMsg.includes('rate limit') || errorMsg.includes('429')) {
          let quotaError = '⚠️ Rate limit reached: You\'ve hit the request limit.\n\n'
          quotaError += 'Options:\n'
          quotaError += '• Wait a moment and try again\n'
          quotaError += '• Check your usage: https://console.groq.com/\n'
          quotaError += '• Upgrade your plan if needed'
          throw new Error(quotaError)
        }
        
        throw new Error(errorMsg)
      }

      const aiText = data.choices?.[0]?.message?.content || '(no reply)'

      const aiMsg = { role: 'assistant', content: aiText }
      setMessages(prev => [...prev, aiMsg])

    } catch (err) {
      // Format error message
      const errorContent = err.message.includes('Rate limit') || err.message.includes('quota')
        ? err.message 
        : `❌ Error: ${err.message}`
      
      setMessages(prev => [...prev, { role: 'assistant', content: errorContent }])
    }

    setIsLoading(false)
  }

  return { messages, sendMessage, isLoading }
}


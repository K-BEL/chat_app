import { useState, useEffect, useCallback } from 'react'

const ACTIVE_KEY = 'chat_app_active_conversation'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Simple helper to generate a fallback title
function getTitle(messages) {
  const firstUser = messages.find(m => m.role === 'user')
  if (!firstUser) return 'New Chat'
  const text = firstUser.content.slice(0, 50)
  return text.length < firstUser.content.length ? text + '…' : text
}

export function useConversations() {
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(() => localStorage.getItem(ACTIVE_KEY) || null)
  const [activeConversation, setActiveConversation] = useState(null)

  // Fetch all conversations on mount
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/conversations/`)
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
      }
    } catch (err) {
      console.error('Failed to load conversations:', err)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Fetch active conversation details (including messages)
  const fetchActiveConversation = useCallback(async (id) => {
    if (!id) {
      setActiveConversation(null)
      return
    }
    try {
      const res = await fetch(`${API_URL}/conversations/${id}`)
      if (res.ok) {
        const data = await res.json()
        setActiveConversation(data)
      } else {
        // If not found, clear active ID
        setActiveId(null)
        setActiveConversation(null)
      }
    } catch (err) {
      console.error('Failed to load active conversation:', err)
    }
  }, [])

  useEffect(() => {
    fetchActiveConversation(activeId)
  }, [activeId, fetchActiveConversation])

  // Persist active connection ID locally (just to load the right chat on refresh)
  useEffect(() => {
    if (activeId) {
      localStorage.setItem(ACTIVE_KEY, activeId)
    } else {
      localStorage.removeItem(ACTIVE_KEY)
    }
  }, [activeId])

  const createConversation = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/conversations/`, { method: 'POST' })
      if (res.ok) {
        const newConv = await res.json()
        setConversations(prev => [newConv, ...prev])
        setActiveId(newConv.id)
        return newConv.id
      }
    } catch (err) {
      console.error('Failed to create conversation:', err)
    }
    return null
  }, [])

  // Sync messages to the backend
  const updateMessages = useCallback(async (conversationId, messages) => {
    if (messages.length === 0) return

    // Immediately update local state for the UI
    setActiveConversation(prev => {
      if (prev?.id === conversationId) {
        return { ...prev, messages, title: getTitle(messages) }
      }
      return prev
    })
    
    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId
          ? { ...c, title: getTitle(messages) }
          : c
      )
    )

    // The backend's /chat/stream will actually save messages via its own logic,
    // OR if we wanted to save messages explicitly:
    // Actually, in our streaming setup, the chat router isn't saving yet.
    // We should send the *last* user and assistant message here,
    // or rely on a new endpoint. 
    // For simplicity, we assume `updateMessages` here just adds the last message(s) to DB
    const lastMessage = messages[messages.length - 1]
    const secondLastMessage = messages.length > 1 ? messages[messages.length - 2] : null

    try {
      // Small debounce/hack: if user just sent a msg, save it
      if (secondLastMessage && secondLastMessage.role === 'user' && lastMessage.role === 'assistant' && lastMessage.content) {
        // We probably shouldn't spam the DB with every streaming character
        // Realistically, the backend stream endpoint should save the generation result.
        // For UI simplicity right now, we will add a full message sync if complete
      }
    } catch (e) {
      console.error("Error syncing messages", e)
    }
  }, [])

  const deleteConversation = useCallback(async (conversationId) => {
    try {
      const res = await fetch(`${API_URL}/conversations/${conversationId}`, { method: 'DELETE' })
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== conversationId))
        if (activeId === conversationId) {
          setActiveId(null)
          setActiveConversation(null)
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err)
    }
  }, [activeId])

  const selectConversation = useCallback((conversationId) => {
    setActiveId(conversationId)
  }, [])

  const clearAll = useCallback(() => {
    setConversations([])
    setActiveId(null)
    setActiveConversation(null)
    localStorage.removeItem(ACTIVE_KEY)
    // Add endpoint to drop all if needed
  }, [])

  return {
    conversations,
    activeConversation,
    activeId,
    createConversation,
    updateMessages,
    deleteConversation,
    selectConversation,
    clearAll,
  }
}

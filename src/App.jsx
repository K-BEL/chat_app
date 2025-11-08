import { useState, useEffect } from 'react'
import ChatBox from './components/ChatBox'
import ModeSelection from './components/ModeSelection'
import { AVATAR_CONFIG } from './config/avatar'
import './App.css'

// Avatar storage key
const AVATARS_STORAGE_KEY = 'readyPlayerMeAvatars'
const SELECTED_AVATAR_KEY = 'selectedAvatarId'

function App() {
  const [mode, setMode] = useState(null) // null, 'text', or 'voice'
  const [avatars, setAvatars] = useState(() => {
    // Load avatars from localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(AVATARS_STORAGE_KEY)
        return stored ? JSON.parse(stored) : []
      }
    } catch (error) {
      console.warn('localStorage not available:', error)
    }
    return []
  })
  const [selectedAvatarId, setSelectedAvatarId] = useState(() => {
    // Load selected avatar ID from localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(SELECTED_AVATAR_KEY) || null
      }
    } catch (error) {
      console.warn('localStorage not available:', error)
    }
    return null
  })

  // Save avatars to localStorage whenever they change
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(AVATARS_STORAGE_KEY, JSON.stringify(avatars))
      }
    } catch (error) {
      console.warn('Failed to save avatars:', error)
    }
  }, [avatars])

  // Save selected avatar ID to localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (selectedAvatarId) {
          localStorage.setItem(SELECTED_AVATAR_KEY, selectedAvatarId)
        } else {
          localStorage.removeItem(SELECTED_AVATAR_KEY)
        }
      }
    } catch (error) {
      console.warn('Failed to save selected avatar:', error)
    }
  }, [selectedAvatarId])

  const handleAvatarExported = (url) => {
    // Create new avatar entry
    const newAvatar = {
      id: `avatar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: url,
      name: `Avatar ${avatars.length + 1}`,
      createdAt: new Date().toISOString()
    }
    
    setAvatars(prev => [...prev, newAvatar])
    setSelectedAvatarId(newAvatar.id)
  }

  const handleSelectAvatar = (avatarId) => {
    setSelectedAvatarId(avatarId)
  }

  const handleDeleteAvatar = (avatarId) => {
    setAvatars(prev => prev.filter(avatar => avatar.id !== avatarId))
    // If deleted avatar was selected, clear selection or select first available
    if (selectedAvatarId === avatarId) {
      const remaining = avatars.filter(avatar => avatar.id !== avatarId)
      setSelectedAvatarId(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  const handleRenameAvatar = (avatarId, newName) => {
    setAvatars(prev => prev.map(avatar => 
      avatar.id === avatarId ? { ...avatar, name: newName } : avatar
    ))
  }

  // Get selected avatar URL or use single model
  const selectedAvatar = avatars.find(avatar => avatar.id === selectedAvatarId)
  const avatarUrl = selectedAvatar ? selectedAvatar.url : ''
  
  // If using single model, don't pass avatar URL (will use local model)
  const useSingleModel = AVATAR_CONFIG.USE_SINGLE_MODEL
  const finalAvatarUrl = useSingleModel ? null : avatarUrl

  if (!mode) {
    return (
      <div className="app">
        <ModeSelection 
          onSelectMode={setMode} 
          avatarUrl={finalAvatarUrl}
          avatars={useSingleModel ? [] : avatars}
          selectedAvatarId={selectedAvatarId}
          onAvatarExported={handleAvatarExported}
          onSelectAvatar={handleSelectAvatar}
          onDeleteAvatar={handleDeleteAvatar}
          onRenameAvatar={handleRenameAvatar}
          useSingleModel={useSingleModel}
        />
      </div>
    )
  }

  return (
    <div className="app">
      <ChatBox mode={mode} avatarUrl={finalAvatarUrl} useSingleModel={useSingleModel} />
    </div>
  )
}

export default App


import { useState } from 'react'
import AvatarCreatorComponent from './AvatarCreator'
import AvatarSelector from './AvatarSelector'
import './ModeSelection.css'

import { AVATAR_CONFIG } from '../config/avatar'

function ModeSelection({ onSelectMode, avatarUrl, avatars = [], selectedAvatarId, onAvatarExported, onSelectAvatar, onDeleteAvatar, onRenameAvatar, useSingleModel = false }) {
  const [showAvatarCreator, setShowAvatarCreator] = useState(false)

  if (showAvatarCreator && !useSingleModel) {
    return (
      <AvatarCreatorComponent 
        onAvatarExported={(url) => {
          onAvatarExported(url)
          setShowAvatarCreator(false)
        }}
        onClose={() => setShowAvatarCreator(false)}
      />
    )
  }

  return (
    <div className="mode-selection-container">
      <div className="mode-selection-content">
        <div className="mode-header">
          <h1>Choose Your Mode</h1>
          <p>Select how you want to interact with AI</p>
        </div>

        {/* Avatar Selection - only show if not using single model */}
        {!useSingleModel && (
          <AvatarSelector
            avatars={avatars}
            selectedAvatarId={selectedAvatarId}
            onSelectAvatar={onSelectAvatar}
            onCreateNew={() => setShowAvatarCreator(true)}
            onDeleteAvatar={onDeleteAvatar}
            onRenameAvatar={onRenameAvatar}
          />
        )}
        
        {useSingleModel && (
          <div className="single-model-info">
            <div className="model-info-card">
              <div className="model-info-icon">🎭</div>
              <div className="model-info-content">
                <h3>{AVATAR_CONFIG.MODEL_NAME}</h3>
                <p>Using local 3D model: <code>{AVATAR_CONFIG.MODEL_PATH}</code></p>
                <p className="model-info-hint">
                  Place your GLB model file in the <code>public/models/</code> folder
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mode-options">
          <button
            className="mode-card"
            onClick={() => onSelectMode('text')}
          >
            <div className="mode-icon">💬</div>
            <h2>Text Mode</h2>
            <p>Chat with AI using text only. No voice features.</p>
            <div className="mode-features">
              <span>✓ Text chat</span>
              <span>✓ Fast responses</span>
              <span>✓ No audio</span>
            </div>
          </button>

          <button
            className="mode-card"
            onClick={() => onSelectMode('voice')}
          >
            <div className="mode-icon">🎤</div>
            <h2>Voice Mode</h2>
            <p>AI responses will be read aloud using text-to-speech.</p>
            <div className="mode-features">
              <span>✓ Text chat</span>
              <span>✓ Voice responses</span>
              <span>✓ Auto-play TTS</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModeSelection


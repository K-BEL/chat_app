import { useState } from 'react'
import './AvatarSelector.css'

function AvatarSelector({ avatars, selectedAvatarId, onSelectAvatar, onCreateNew, onDeleteAvatar, onRenameAvatar }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  const handleDelete = (avatarId, e) => {
    e.stopPropagation()
    if (showDeleteConfirm === avatarId) {
      onDeleteAvatar(avatarId)
      setShowDeleteConfirm(null)
    } else {
      setShowDeleteConfirm(avatarId)
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowDeleteConfirm(null), 3000)
    }
  }

  const handleStartEdit = (avatar, e) => {
    e.stopPropagation()
    setEditingId(avatar.id)
    setEditName(avatar.name || '')
  }

  const handleSaveEdit = (avatarId, e) => {
    e.stopPropagation()
    if (onRenameAvatar && editName.trim()) {
      onRenameAvatar(avatarId, editName.trim())
    }
    setEditingId(null)
    setEditName('')
  }

  const handleCancelEdit = (e) => {
    e.stopPropagation()
    setEditingId(null)
    setEditName('')
  }

  return (
    <div className="avatar-selector">
      <div className="avatar-selector-header">
        <h3>Choose Your Avatar</h3>
        <button className="create-new-avatar-btn" onClick={onCreateNew}>
          + Create New
        </button>
      </div>
      
      {avatars.length === 0 ? (
        <div className="no-avatars">
          <p>No avatars created yet</p>
          <button className="create-first-avatar-btn" onClick={onCreateNew}>
            🎭 Create Your First Avatar
          </button>
        </div>
      ) : (
        <div className="avatar-grid">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className={`avatar-card ${selectedAvatarId === avatar.id ? 'selected' : ''}`}
              onClick={() => onSelectAvatar(avatar.id)}
            >
              <div className="avatar-card-image">
                <img src={avatar.url} alt={avatar.name || 'Avatar'} />
                {selectedAvatarId === avatar.id && (
                  <div className="selected-badge">✓ Selected</div>
                )}
              </div>
              <div className="avatar-card-info">
                {editingId === avatar.id ? (
                  <div className="avatar-edit-form">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(avatar.id, e)
                        if (e.key === 'Escape') handleCancelEdit(e)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="avatar-name-input"
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button
                        onClick={(e) => handleSaveEdit(avatar.id, e)}
                        className="save-btn"
                        title="Save (Enter)"
                      >
                        ✓
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="cancel-btn"
                        title="Cancel (Esc)"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h4 
                      onDoubleClick={(e) => handleStartEdit(avatar, e)}
                      title="Double-click to rename"
                    >
                      {avatar.name || 'Unnamed Avatar'}
                    </h4>
                    <p className="avatar-date">
                      {new Date(avatar.createdAt).toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>
              <button
                className="delete-avatar-btn"
                onClick={(e) => handleDelete(avatar.id, e)}
                title={showDeleteConfirm === avatar.id ? 'Click again to confirm' : 'Delete avatar'}
              >
                {showDeleteConfirm === avatar.id ? '⚠️ Confirm' : '🗑️'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AvatarSelector


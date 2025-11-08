import { AvatarCreator } from '@readyplayerme/react-avatar-creator'
import './AvatarCreator.css'

function AvatarCreatorComponent({ onAvatarExported, onClose }) {
  const config = {
    clearCache: true,
    bodyType: 'fullbody',
    quickStart: false,
    language: 'en',
  }

  const style = { 
    width: '100%', 
    height: '100vh', 
    border: 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 1000
  }

  const handleOnAvatarExported = (event) => {
    console.log(`Avatar URL is: ${event.data.url}`)
    onAvatarExported(event.data.url)
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className="avatar-creator-wrapper">
      <div className="avatar-creator-header">
        <h2>Create Your Avatar</h2>
        {onClose && (
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        )}
      </div>
      <AvatarCreator 
        subdomain="https://3d-cht-app.readyplayer.me/avatar" 
        config={config} 
        style={style} 
        onAvatarExported={handleOnAvatarExported} 
      />
    </div>
  )
}

export default AvatarCreatorComponent


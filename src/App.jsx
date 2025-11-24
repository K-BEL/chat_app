import { useState } from 'react'
import ChatBox from './components/ChatBox'
import './App.css'

function App() {
  const [mode, setMode] = useState('text') // 'text' or 'voice'

  return (
    <div className="app">
      <ChatBox mode={mode} onModeChange={setMode} />
    </div>
  )
}

export default App

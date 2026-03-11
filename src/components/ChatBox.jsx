import { useState, useEffect, useRef } from 'react'
import { useChatModel } from '../hooks/useChatModel'
import { useTTS } from '../hooks/useTTS'
import { parseMarkdown } from '../utils/markdown'
import { PROVIDERS, MODELS } from '../config/models'
import { 
  Settings, Mic, MessageSquare, Image as ImageIcon, Paperclip, 
  Send, User, Bot, Zap, Code, FileText, Lightbulb, Pause, Menu
} from 'lucide-react'

// Brand colors for subtle glows
const brandStyles = {
  groq: 'from-orange-500/20 to-red-500/20 text-orange-400 border-orange-500/30',
  openai: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
  anthropic: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
  local: 'from-blue-500/20 to-purple-500/20 text-blue-400 border-blue-500/30'
}

function ChatBox({ mode, onModeChange, activeConversation, onMessagesChange, onFirstMessage, onToggleSidebar }) {
  const [input, setInput] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [localModels, setLocalModels] = useState(MODELS.local || [])
  
  const { 
    messages, sendMessage, loadMessages, isLoading,
    activeProvider, setActiveProvider,
    activeModel, setActiveModel 
  } = useChatModel('groq', 'llama-3.3-70b-versatile', {
    initialMessages: activeConversation?.messages || [],
    onMessagesChange,
  })

  // Load messages when switching conversations
  const prevConvIdRef = useRef(activeConversation?.id)
  useEffect(() => {
    if (activeConversation?.id !== prevConvIdRef.current) {
      prevConvIdRef.current = activeConversation?.id
      loadMessages(activeConversation?.messages || [])
    }
  }, [activeConversation?.id, activeConversation?.messages, loadMessages])
  
  const { speak, stop, isSpeaking, currentMessageId, selectedVoice, setSelectedVoice, voices } = useTTS()
  const messagesEndRef = useRef(null)
  const isVoiceMode = mode === 'voice'
  const autoPlayRef = useRef(isVoiceMode)
  const textareaRef = useRef(null)

  // Fetch local models
  useEffect(() => {
    const fetchLocalModels = async () => {
      try {
        const response = await fetch('http://localhost:11434/api/tags');
        if (response.ok) {
          const data = await response.json();
          if (data.models && data.models.length > 0) {
            setLocalModels(data.models.map(m => ({ id: m.name, name: `${m.name} (Local)` })));
          }
        }
      } catch (err) {
        console.warn('Could not fetch local models from Ollama:', err);
      }
    };
    fetchLocalModels();
  }, [])

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Voice effect sync
  useEffect(() => {
    autoPlayRef.current = isVoiceMode
  }, [isVoiceMode])

  useEffect(() => {
    if (isVoiceMode && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'assistant' && autoPlayRef.current && !isLoading) {
        const messageId = messages.length - 1
        const timeoutId = setTimeout(() => {
          speak(lastMessage.content, messageId, selectedVoice)
        }, 300)
        return () => clearTimeout(timeoutId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isLoading, isVoiceMode])

  // Textarea auto-resize
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [input])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      stop()
      // Auto-create conversation on first message
      if (!activeConversation) {
        onFirstMessage()
      }
      sendMessage(input)
      setInput('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleSpeak = (content, messageId) => {
    if (isSpeaking && currentMessageId === messageId) {
      stop()
    } else {
      speak(content, messageId, selectedVoice)
    }
  }

  const toggleMode = () => {
    const newMode = mode === 'text' ? 'voice' : 'text'
    onModeChange(newMode)
    if (newMode === 'text') stop()
  }

  const handleProviderChange = (e) => {
    const provider = e.target.value
    setActiveProvider(provider)
    const providerModels = provider === 'local' ? localModels : MODELS[provider]
    if (providerModels && providerModels.length > 0) {
      setActiveModel(providerModels[0].id)
    }
  }

  const providerStyle = brandStyles[activeProvider] || brandStyles.openai

  const quickStartCards = [
    { icon: <Code className="w-5 h-5"/>, title: "Analyze Code", desc: "Review, debug or refactor." },
    { icon: <FileText className="w-5 h-5"/>, title: "Draft Content", desc: "Write emails, docs & articles." },
    { icon: <Zap className="w-5 h-5"/>, title: "Summarize", desc: "Condense long text into basics." },
    { icon: <Lightbulb className="w-5 h-5"/>, title: "Brainstorm", desc: "Generate ideas & concepts." },
  ]

  const activeModelsList = activeProvider === 'local' ? localModels : MODELS[activeProvider]

  return (
    <div className="relative flex flex-col items-center justify-between w-full max-w-5xl mx-auto h-screen p-4 md:p-6 overflow-hidden bg-[#0a0a0a]">
      {/* Dynamic Background Glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b ${providerStyle} opacity-30 blur-[120px] pointer-events-none rounded-full`} />

      {/* Modern Top Nav / Settings Pill */}
      <div className="relative z-20 w-full flex flex-col items-center mt-2">
        <div className="glass-panel flex items-center justify-between gap-4 px-4 py-2 rounded-full ring-1 ring-white/10 transition-all shadow-xl">
          <div className="flex items-center gap-2 border-r border-white/10 pr-4">
            <button
              onClick={onToggleSidebar}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-gray-200 transition-colors"
              title="Toggle sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className={`flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 ${providerStyle.split(' ')[2]}`}>
              <Bot className="w-4 h-4" />
            </span>
            <span className="font-semibold tracking-wide text-sm text-gray-200">
              {PROVIDERS[activeProvider]?.name}
            </span>
          </div>

          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors text-sm text-gray-300"
          >
            <span className="truncate max-w-[150px] md:max-w-xs">{activeModelsList?.find(m => m.id === activeModel)?.name || 'Select Model'}</span>
            <Settings className={`w-4 h-4 transition-transform duration-300 ${showSettings ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Retractable Settings Menu */}
        <div className={`mt-4 absolute top-14 left-1/2 -translate-x-1/2 glass-panel p-5 rounded-2xl w-[90%] md:w-[600px] transition-all duration-300 origin-top transform ${showSettings ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 -translate-y-4 pointer-events-none'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Provider</label>
              <select 
                value={activeProvider} 
                onChange={handleProviderChange}
                className="bg-black/50 border border-white/10 text-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none transition-all cursor-pointer"
              >
                {Object.values(PROVIDERS).map(provider => (
                  <option key={provider.id} value={provider.id}>{provider.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Model</label>
              <select 
                value={activeModel} 
                onChange={(e) => setActiveModel(e.target.value)}
                className="bg-black/50 border border-white/10 text-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none transition-all cursor-pointer"
              >
                {activeModelsList?.map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Voice</label>
              <select 
                value={selectedVoice} 
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="bg-black/50 border border-white/10 text-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none transition-all cursor-pointer"
              >
                {voices.map(voice => (
                  <option key={voice.id} value={voice.id}>{voice.name} ({voice.gender})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 w-full overflow-y-auto scrollbar-hide my-6 pb-32">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center pt-10">
            <div className={`p-4 rounded-3xl bg-white/5 border border-white/10 mb-8 animate-pulse ${providerStyle.split(' ')[2]}`}>
              <Bot className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-500 mb-2">
              How can I help you today?
            </h2>
            <p className="text-gray-400 mb-12">Start a conversation or pick an option below.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {quickStartCards.map((card, i) => (
                <button 
                  key={i} 
                  onClick={() => setInput(`I want to ${card.title.toLowerCase()}: `)}
                  className="flex flex-col items-start p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all text-left group"
                >
                  <div className={`p-2 rounded-lg bg-black/40 mb-3 text-gray-400 group-hover:${providerStyle.split(' ')[2]}`}>
                    {card.icon}
                  </div>
                  <h3 className="text-gray-200 font-semibold mb-1">{card.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{card.desc}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div key={index} className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mr-3 mt-1 bg-white/10 border border-white/20 ${providerStyle.split(' ')[2]}`}>
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                
                <div className={`max-w-[85%] md:max-w-[75%] px-5 py-4 rounded-2xl group ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-400/20 text-indigo-50 rounded-tr-sm' 
                    : 'glass-panel text-gray-200 rounded-tl-sm'
                }`}>
                  <div 
                    className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
                  />
                  
                  {message.role === 'assistant' && (
                    <div className="mt-3 flex options-bar opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleSpeak(message.content, index)}
                        className={`p-1.5 rounded-lg border flex items-center gap-2 text-xs transition-colors ${
                          isSpeaking && currentMessageId === index 
                            ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' 
                            : 'bg-black/40 border-white/10 text-gray-400 hover:text-gray-200 hover:bg-white/10'
                        }`}
                      >
                        {isSpeaking && currentMessageId === index ? <><Pause className="w-3 h-3"/> Stop</> : <><Mic className="w-3 h-3"/> Read</>}
                      </button>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full shrink-0 ml-3 mt-1 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border border-white/20">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
               <div className="flex w-full justify-start">
                  <div className={`w-8 h-8 rounded-full shrink-0 mr-3 mt-1 flex items-center justify-center bg-white/10 border border-white/20 ${providerStyle.split(' ')[2]}`}>
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="glass-panel px-5 py-5 rounded-2xl rounded-tl-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
               </div>
            )}
          </div>
        )}
      </div>

      {/* Futuristic Input Area */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[95%] md:w-[760px] z-30">
        <form onSubmit={handleSubmit} className="relative w-full">
          <div className="glass-panel p-2 pl-4 rounded-3xl flex items-end gap-3 ring-1 ring-white/10 shadow-2xl shadow-indigo-500/10 focus-within:ring-white/30 transition-shadow duration-300">
            
            {/* Action Buttons */}
            <div className="flex gap-1.5 pb-1">
              <button type="button" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
              <button type="button" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors hidden sm:block">
                <ImageIcon className="w-4 h-4" />
              </button>
            </div>

            <textarea
              ref={textareaRef}
              className="flex-1 bg-transparent border-none outline-none text-gray-100 placeholder-gray-500 text-[15px] resize-none py-3 min-h-[44px] max-h-[150px] scrollbar-hide leading-relaxed"
              placeholder="Ask anything or tap a shortcut..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              disabled={isLoading}
              rows={1}
            />

            <div className="flex items-center gap-2 pb-1 pr-1">
              <button 
                type="button" 
                onClick={toggleMode}
                className={`p-2.5 rounded-full transition-colors ${mode === 'voice' ? 'bg-indigo-500/30 text-indigo-400' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200'}`}
                title="Voice Mode"
              >
                {mode === 'voice' ? <Mic className="w-4 h-4 animate-pulse" /> : <MessageSquare className="w-4 h-4" />}
              </button>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`p-2.5 rounded-full transition-all duration-300 ${
                  !input.trim() || isLoading 
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                    : 'bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/20 scale-105'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="text-center mt-3 text-xs text-gray-500">
            Powered by {PROVIDERS[activeProvider]?.name}. AI can make mistakes.
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatBox

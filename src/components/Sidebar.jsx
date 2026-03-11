import { Plus, MessageSquare, Trash2, X } from 'lucide-react'

function Sidebar({ conversations, activeId, onSelect, onCreate, onDelete, isOpen, onClose }) {
  const sortedConversations = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt)

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <div className={`
        fixed z-50 top-0 left-0 h-full w-72
        glass-panel border-r border-white/10
        flex flex-col
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Chats</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onCreate}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-1">
          {sortedConversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No conversations yet</p>
              <p className="text-gray-600 text-xs mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            sortedConversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`
                  group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer
                  transition-all duration-200
                  ${activeId === conv.id
                    ? 'bg-white/10 border border-white/15 shadow-lg shadow-indigo-500/5'
                    : 'hover:bg-white/5 border border-transparent'
                  }
                `}
              >
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                  ${activeId === conv.id 
                    ? 'bg-indigo-500/20 text-indigo-400' 
                    : 'bg-white/5 text-gray-500'
                  }
                `}>
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${activeId === conv.id ? 'text-gray-200' : 'text-gray-400'}`}>
                    {conv.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {conv.messages.length} msgs · {formatDate(conv.updatedAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {conversations.length > 0 && (
          <div className="p-3 border-t border-white/10">
            <p className="text-xs text-gray-600 text-center">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} · Stored locally
            </p>
          </div>
        )}
      </div>
    </>
  )
}

export default Sidebar

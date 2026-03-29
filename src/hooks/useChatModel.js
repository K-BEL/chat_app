import { useState, useEffect, useRef } from 'react';
import { PROVIDERS, MODELS } from '../config/models';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function useChatModel(initialProvider = 'groq', initialModel = 'llama-3.3-70b-versatile', { initialMessages = [], onMessagesChange, activeConversationId = null } = {}) {
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  
  const [activeProvider, setActiveProvider] = useState(initialProvider);
  const [activeModel, setActiveModel] = useState(initialModel);
  const onMessagesChangeRef = useRef(onMessagesChange);
  
  useEffect(() => {
    onMessagesChangeRef.current = onMessagesChange;
  }, [onMessagesChange]);

  // Notify parent when messages change
  useEffect(() => {
    if (onMessagesChangeRef.current) {
      onMessagesChangeRef.current(messages);
    }
  }, [messages]);

  const loadMessages = (newMessages) => {
    setMessages(newMessages);
  };

  const sendMessage = async (userMessage) => {
    const userMsg = { role: 'user', content: userMessage };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: activeProvider,
          model: activeModel,
          messages: newMessages,
          conversation_id: activeConversationId
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      // Initialize the assistant message with empty content
      const aiMsg = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, aiMsg]);
      setIsLoading(false); // We got response headers, stop the "spinner"

      // Process Server-Sent Events (SSE) from the response body stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let aiContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              // we can send raw strings or JSON. If the backend sends raw strings per chunk:
              // we just append it. If it sends JSON, we parse it.
              // Based on our FastAPI backend implementation, we are sending raw chunks exactly inside 'data: ' events
              let parsedData = dataStr;
              try {
                  parsedData = JSON.parse(dataStr);
              } catch (_) { } // Not JSON, just append raw string
              
              aiContent += parsedData;
              // Update state by updating the last message
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: aiContent };
                return updated;
              });
            } catch (e) {
              console.error('Error parsing SSE data line:', line, e);
            }
          }
        }
      }

    } catch (err) {
      setIsLoading(false);
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${err.message}` }]);
    }
  };

  return {
    messages,
    sendMessage,
    loadMessages,
    isLoading,
    activeProvider,
    setActiveProvider,
    activeModel,
    setActiveModel
  };
}

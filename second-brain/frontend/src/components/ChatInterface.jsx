import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, User, Bot, Loader2, FileText, Globe, Mic, Clock } from 'lucide-react'
import axios from 'axios'

const typeIcons = { document: FileText, web: Globe, audio: Mic, text: FileText, image: FileText }

function ChatInterface() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setStreamingContent('')

    try {
      const response = await fetch('/api/query/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input, limit: 5 })
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      let sources = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '))

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'sources') sources = data.data
            else if (data.type === 'token') {
              fullContent += data.data
              setStreamingContent(fullContent)
            } else if (data.type === 'done') {
              setMessages(prev => [...prev, { role: 'assistant', content: fullContent, sources, timestamp: new Date() }])
              setStreamingContent('')
            }
          } catch {}
        }
      }
    } catch (err) {
      try {
        const res = await axios.post('/api/query', { query: input, limit: 5 })
        setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer, sources: res.data.sources, timestamp: new Date() }])
      } catch {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please make sure the backend is running and your OpenAI API key is configured.', sources: [], timestamp: new Date() }])
      }
    }
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 mb-6 rounded-full glass flex items-center justify-center glow">
              <Sparkles className="w-12 h-12 text-neon-cyan" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 gradient-text">Your Second Brain Awaits</h2>
            <p className="text-midnight-300 max-w-md">Ask me anything about your documents, notes, and web content.</p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
              {["What were the key points from my last meeting?", "Summarize the article about AI I saved", "What did I work on last week?", "Find notes about project planning"].map((suggestion, i) => (
                <button key={i} onClick={() => setInput(suggestion)} className="p-3 text-left text-sm rounded-xl glass hover:border-neon-cyan/50 transition-all">{suggestion}</button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
            {isLoading && streamingContent && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full glass flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-neon-cyan" /></div>
                <div className="flex-1 glass rounded-2xl rounded-tl-sm p-4">
                  <p className="whitespace-pre-wrap">{streamingContent}</p>
                  <span className="inline-block w-2 h-4 bg-neon-cyan animate-pulse ml-1" />
                </div>
              </div>
            )}
            {isLoading && !streamingContent && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full glass flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-neon-cyan" /></div>
                <div className="glass rounded-2xl rounded-tl-sm p-4">
                  <div className="typing-indicator flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-neon-cyan" />
                    <span className="w-2 h-2 rounded-full bg-neon-purple" />
                    <span className="w-2 h-2 rounded-full bg-neon-pink" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="p-4 glass border-t border-midnight-700/50">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative flex items-center">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask your second brain anything..." className="w-full px-5 py-4 pr-14 rounded-2xl bg-midnight-800/80 border border-midnight-600 focus:border-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-cyan/20 transition-all placeholder:text-midnight-400" disabled={isLoading} />
            <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-2 p-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-neon-cyan/20 transition-all">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const Icon = isUser ? User : Bot

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-10 h-10 rounded-full glass flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-neon-purple/20' : ''}`}>
        <Icon className={`w-5 h-5 ${isUser ? 'text-neon-purple' : 'text-neon-cyan'}`} />
      </div>
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block glass rounded-2xl p-4 ${isUser ? 'rounded-tr-sm bg-neon-purple/10' : 'rounded-tl-sm'}`}>
          <p className="whitespace-pre-wrap text-left">{message.content}</p>
        </div>
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-midnight-400 flex items-center gap-1"><FileText size={12} /> Sources</p>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source, i) => {
                const TypeIcon = typeIcons[source.contentType] || FileText
                return (
                  <div key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-xs hover:border-neon-cyan/50 transition-colors cursor-pointer" title={source.excerpt}>
                    <TypeIcon size={14} className="text-neon-cyan" />
                    <span className="max-w-[150px] truncate">{source.title}</span>
                    <span className="text-midnight-400">{Math.round(source.relevance * 100)}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        <div className="mt-1 text-xs text-midnight-500 flex items-center gap-1">
          <Clock size={10} />
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}

export default ChatInterface


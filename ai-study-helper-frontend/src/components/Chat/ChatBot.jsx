import React, { useState, useEffect, useRef } from 'react'
import { X, Send, MessageCircle, Brain, Trash2, RefreshCw } from 'lucide-react'
import Button from '../UI/Button'
import MessageBubble from './MessageBubble'
import LoadingSpinner from '../UI/LoadingSpinner'
import { api } from '../../services/api'
import { handleApiError } from '../../utils/helpers'

const ChatBot = ({ sessionId, onClose }) => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [error, setError] = useState('')
  const [scope, setScope] = useState('session')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    loadChatHistory()
    // Focus input when chat opens
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [sessionId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatHistory = async () => {
    try {
      setIsLoadingHistory(true)
      const response = await api.get(`/chat/history/${sessionId}`)
      setMessages(response.data.data || [])
    } catch (err) {
      console.error('Failed to load chat history:', err)
      setError(handleApiError(err))
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const sendMessage = async () => {
    const trimmedMessage = inputMessage.trim()
    if (!trimmedMessage || isLoading) return

    // Add user message immediately
    const userMessage = {
      id: Date.now(),
      message: trimmedMessage,
      response: '',
      timestamp: new Date().toISOString(),
      isUser: true
    }

    try {
      setIsLoading(true)
      setError('')

      setMessages(prev => [...prev, userMessage])
      setInputMessage('')

      // Send to API
      const response = await api.post(`/chat/message/${sessionId}`, {
        message: trimmedMessage,
        scope
      })

      // Replace user message with complete response
      const completeMessage = response.data.data
      setMessages(prev =>
        prev.map(msg =>
          msg.id === userMessage.id
            ? {
                ...completeMessage,
                isUser: false
              }
            : msg
        )
      )

    } catch (err) {
      console.error('Failed to send message:', err)
      setError(handleApiError(err))

      // Remove failed message
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id))

      // Restore input
      setInputMessage(trimmedMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = async () => {
    if (!window.confirm('Are you sure you want to clear the chat history?')) return

    try {
      await api.delete(`/chat/history/${sessionId}`)
      setMessages([])
    } catch (err) {
      console.error('Failed to clear chat:', err)
      setError(handleApiError(err))
    }
  }

  const suggestedQuestions = [
    "Can you explain the key concepts?",
    "Generate a mind map for this content",
    "What are the most important points?",
    "Create additional quiz questions",
    "Summarize this in simpler terms"
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-black">Chat Assistant</h3>
            <span className="text-xs text-gray-500">
              Ask questions about your uploaded content
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              icon={Trash2}
              disabled={messages.length === 0}
            >
              Clear
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={loadChatHistory}
              icon={RefreshCw}
            >
              Refresh
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon={X}
            >
              Close
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoadingHistory ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" text="Loading chat history..." />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-700 mb-2">
                Start a conversation
              </h4>
              <p className="text-gray-500 mb-6">
                Ask questions about your uploaded content and get detailed answers
              </p>

              {/* Suggested Questions */}
              <div className="max-w-md mx-auto space-y-2">
                <p className="text-sm font-medium text-gray-600 mb-3">
                  Try asking:
                </p>
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(question)}
                    className="block w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id || index}
                  message={message}
                />
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl p-4 max-w-xs">
                    <LoadingSpinner size="sm" text="Thinking..." />
                  </div>
                </div>
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-2 border-t border-gray-200 bg-red-50">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          {/* Search scope for RAG retrieval */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-500">Search in:</span>
            {[
              { value: 'session', label: 'This session' },
              { value: 'all', label: 'All my notes' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setScope(option.value)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  scope === option.value
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about your uploaded content..."
                rows={1}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                disabled={isLoading}
                style={{
                  minHeight: '48px',
                  maxHeight: '120px'
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
              />
            </div>

            <Button
              variant="primary"
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              icon={Send}
              className="px-4 h-12"
            >
              Send
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChatBot
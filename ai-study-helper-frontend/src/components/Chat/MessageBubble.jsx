import React, { useState } from 'react'
import { User, Bot, Copy, Brain, Clock, BookOpen } from 'lucide-react'
import Button from '../UI/Button'
import { copyToClipboard, formatDate } from '../../utils/helpers'

const MessageBubble = ({ message }) => {
  const [copySuccess, setCopySuccess] = useState('')
  const [showSources, setShowSources] = useState(false)

  const handleCopy = async (text, type) => {
    try {
      await copyToClipboard(text)
      setCopySuccess(type)
      setTimeout(() => setCopySuccess(''), 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  const isUser = message.isUser || false
  const hasResponse = message.response && message.response.trim()
  const hasMindMap = message.mindMap && message.mindMap.trim()
  const sources = message.sources || []

  return (
    <div className="space-y-3">
      {/* User Message */}
      <div className="flex justify-end">
        <div className="flex items-start gap-3 max-w-3xl">
          <div className="chat-message chat-user rounded-2xl px-4 py-3">
            <p className="whitespace-pre-wrap break-words">
              {message.message}
            </p>
          </div>
          <div className="flex-shrink-0 w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Bot Response */}
      {hasResponse && (
        <div className="flex justify-start">
          <div className="flex items-start gap-3 max-w-4xl w-full">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-gray-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="chat-message chat-bot rounded-2xl px-4 py-3">
                <div className="whitespace-pre-wrap break-words leading-relaxed">
                  {message.response}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-2 ml-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(message.response, 'response')}
                  className="text-xs px-2 py-1"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  {copySuccess === 'response' ? 'Copied!' : 'Copy'}
                </Button>

                {sources.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSources(prev => !prev)}
                    className="text-xs px-2 py-1"
                  >
                    <BookOpen className="w-3 h-3 mr-1" />
                    {showSources ? 'Hide sources' : `Sources (${sources.length})`}
                  </Button>
                )}

                {message.timestamp && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(message.timestamp)}</span>
                  </div>
                )}
              </div>

              {/* Retrieved Sources (RAG) */}
              {showSources && (
                <div className="mt-2 space-y-2">
                  {sources.map((source, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span className="font-medium text-gray-700">
                          [{index + 1}] {source.sessionTitle} · {source.source}
                        </span>
                        <span>{Math.round(source.score * 100)}% match</span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                        {source.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mind Map */}
      {hasMindMap && (
        <div className="flex justify-start">
          <div className="flex items-start gap-3 max-w-4xl w-full">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-purple-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="bg-purple-50 border border-purple-200 rounded-2xl">
                {/* Mind Map Header */}
                <div className="flex items-center justify-between p-3 border-b border-purple-200">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-900 text-sm">
                      Generated Mind Map
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(message.mindMap, 'mindmap')}
                    className="text-xs px-2 py-1 text-purple-700 hover:text-purple-900"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    {copySuccess === 'mindmap' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>

                {/* Mind Map Content */}
                <div className="p-3">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-purple-800 leading-relaxed">
                    {message.mindMap}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MessageBubble
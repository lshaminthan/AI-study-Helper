import React, { useState } from 'react'
import { Brain, Download, RefreshCw, Eye, Copy } from 'lucide-react'
import Button from '../UI/Button'
import { api } from '../../services/api'
import { copyToClipboard, handleApiError } from '../../utils/helpers'

const MindMapSection = ({ mindMap, sessionId }) => {
  const [currentMindMap, setCurrentMindMap] = useState(mindMap || '')
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState('formatted') // formatted, raw
  const [copySuccess, setCopySuccess] = useState(false)

  const generateMindMap = async () => {
    if (!sessionId) return

    try {
      setLoading(true)
      const response = await api.get(`/analysis/mindmap/${sessionId}`)
      setCurrentMindMap(response.data.data.mindMap)
    } catch (error) {
      console.error('Failed to generate mind map:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await copyToClipboard(currentMindMap)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy mind map:', error)
    }
  }

  const downloadMindMap = () => {
    if (!currentMindMap) return

    const blob = new Blob([currentMindMap], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'mind-map.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const formatMindMapForDisplay = (text) => {
    if (!text) return ''

    // Split into lines and process each line
    const lines = text.split('\n')
    return lines.map((line, index) => {
      const trimmedLine = line.trim()
      if (!trimmedLine) return { content: '', level: 0, type: 'empty' }

      // Detect indentation level
      const indent = line.length - trimmedLine.length
      const level = Math.floor(indent / 2)

      // Detect different types of content
      let type = 'text'
      let content = trimmedLine

      if (content.match(/^[#]+\s/)) {
        type = 'heading'
        content = content.replace(/^[#]+\s/, '')
      } else if (content.match(/^[-*•]\s/)) {
        type = 'bullet'
        content = content.replace(/^[-*•]\s/, '')
      } else if (content.match(/^\d+\.\s/)) {
        type = 'numbered'
        content = content.replace(/^\d+\.\s/, '')
      }

      return { content, level, type, original: line }
    })
  }

  const renderFormattedMindMap = () => {
    const formattedLines = formatMindMapForDisplay(currentMindMap)

    return (
      <div className="space-y-1 font-mono text-sm">
        {formattedLines.map((line, index) => {
          if (line.type === 'empty') {
            return <div key={index} className="h-2" />
          }

          const leftPadding = `${line.level * 1.5}rem`

          let className = 'transition-colors duration-200 hover:bg-gray-50 rounded px-2 py-1 '

          switch (line.type) {
            case 'heading':
              className += 'font-bold text-lg text-black border-l-4 border-black'
              break
            case 'bullet':
              className += 'text-gray-800 border-l-2 border-gray-300'
              break
            case 'numbered':
              className += 'text-gray-800 font-medium border-l-2 border-blue-300'
              break
            default:
              className += 'text-gray-700'
          }

          return (
            <div
              key={index}
              className={className}
              style={{ paddingLeft: leftPadding }}
            >
              {line.type === 'bullet' && (
                <span className="text-gray-500 mr-2">•</span>
              )}
              {line.content}
            </div>
          )
        })}
      </div>
    )
  }

  if (!currentMindMap && !sessionId) {
    return (
      <div className="text-center py-12">
        <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No Mind Map Available
        </h3>
        <p className="text-gray-500">
          The analysis didn't generate a mind map for this content.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-black">Mind Map</h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode(viewMode === 'formatted' ? 'raw' : 'formatted')}
            icon={Eye}
          >
            {viewMode === 'formatted' ? 'Raw View' : 'Formatted View'}
          </Button>

          {currentMindMap && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                icon={Copy}
              >
                {copySuccess ? 'Copied!' : 'Copy'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={downloadMindMap}
                icon={Download}
              >
                Download
              </Button>
            </>
          )}

          {sessionId && (
            <Button
              variant="secondary"
              size="sm"
              onClick={generateMindMap}
              loading={loading}
              icon={RefreshCw}
            >
              {currentMindMap ? 'Regenerate' : 'Generate'}
            </Button>
          )}
        </div>
      </div>

      {/* Mind Map Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-gray-200 border-t-black rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Generating mind map...</p>
          </div>
        </div>
      ) : currentMindMap ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* View Toggle */}
          <div className="border-b border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">View Mode:</span>
                <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                  <button
                    onClick={() => setViewMode('formatted')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === 'formatted'
                        ? 'bg-black text-white'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    Formatted
                  </button>
                  <button
                    onClick={() => setViewMode('raw')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === 'raw'
                        ? 'bg-black text-white'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    Raw Text
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                {currentMindMap.split('\n').length} lines • {currentMindMap.length} characters
              </div>
            </div>
          </div>

          {/* Mind Map Display */}
          <div className="p-6">
            {viewMode === 'formatted' ? (
              <div className="max-h-[600px] overflow-y-auto">
                {renderFormattedMindMap()}
              </div>
            ) : (
              <pre className="mind-map max-h-[600px] overflow-y-auto whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                {currentMindMap}
              </pre>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-700 mb-2">
            No Mind Map Generated Yet
          </h3>
          <p className="text-gray-500 mb-6">
            Click the generate button to create a mind map for this content
          </p>
          <Button
            variant="primary"
            onClick={generateMindMap}
            loading={loading}
            icon={Brain}
          >
            Generate Mind Map
          </Button>
        </div>
      )}

      {/* Tips */}
      {currentMindMap && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Mind Map Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use the formatted view for better readability</li>
            <li>• Copy the mind map to use in other applications</li>
            <li>• Download as a text file for offline access</li>
            <li>• Regenerate for a fresh perspective on the content</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default MindMapSection
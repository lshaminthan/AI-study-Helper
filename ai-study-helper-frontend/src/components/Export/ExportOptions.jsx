import React, { useState } from 'react'
import { Download, FileText, File, Check, AlertCircle } from 'lucide-react'
import Button from '../UI/Button'
import Modal from '../UI/Modal'
import LoadingSpinner from '../UI/LoadingSpinner'
import { uploadService } from '../../services/uploadService'
import { handleApiError } from '../../utils/helpers'

const ExportOptions = ({ session, onClose }) => {
  const [exportType, setExportType] = useState('pdf')
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState(null) // null, 'success', 'error'
  const [error, setError] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')

  const exportOptions = [
    {
      id: 'pdf',
      name: 'PDF Export',
      description: 'Complete study notes with summaries, quiz questions, and flashcards',
      icon: FileText,
      format: '.pdf'
    },
    {
      id: 'json',
      name: 'JSON Export',
      description: 'Raw data export for use in other applications',
      icon: File,
      format: '.json'
    }
  ]

  const handleExport = async () => {
    try {
      setIsExporting(true)
      setError('')
      setExportStatus(null)

      let result
      if (exportType === 'pdf') {
        result = await uploadService.exportToPdf(session._id)
        setDownloadUrl(result.data.downloadUrl)

        // Auto-download the file
        await uploadService.downloadFile(result.data.fileName)
      } else if (exportType === 'json') {
        // For JSON export, we'll create a direct download
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
        const jsonUrl = `${baseUrl}/export/json/${session._id}`

        // Create temporary link for JSON download
        const link = document.createElement('a')
        link.href = jsonUrl
        link.setAttribute('download', `study-session-${session._id}.json`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        result = { success: true, message: 'JSON export completed' }
      }

      if (result.success) {
        setExportStatus('success')
      }
    } catch (err) {
      console.error('Export failed:', err)
      setError(handleApiError(err))
      setExportStatus('error')
    } finally {
      setIsExporting(false)
    }
  }

  const getExportContent = () => {
    const analysis = session.analysis
    const items = []

    if (analysis.summary) items.push('Summary')
    if (analysis.explanations) items.push('Explanations')
    if (analysis.quizQuestions?.length > 0) items.push(`${analysis.quizQuestions.length} Quiz Questions`)
    if (analysis.flashcards?.length > 0) items.push(`${analysis.flashcards.length} Flashcards`)
    if (analysis.mindMap) items.push('Mind Map')
    if (analysis.youtubeVideos?.length > 0) items.push(`${analysis.youtubeVideos.length} Video Recommendations`)

    return items
  }

  const contentItems = getExportContent()

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Export Study Session"
      size="lg"
    >
      <div className="space-y-6">
        {/* Session Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-black mb-2">{session.title}</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Type: <span className="capitalize">{session.imageType}</span></p>
            <p>Created: {new Date(session.createdAt).toLocaleDateString()}</p>
            <p>Content: {contentItems.join(', ')}</p>
          </div>
        </div>

        {/* Export Format Selection */}
        <div className="space-y-4">
          <h4 className="font-medium text-black">Choose Export Format</h4>

          <div className="grid gap-3">
            {exportOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setExportType(option.id)}
                className={`
                  p-4 border-2 rounded-lg text-left transition-all duration-200
                  ${exportType === option.id
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${exportType === option.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}
                  `}>
                    <option.icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-black">{option.name}</h5>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {option.format}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {option.description}
                    </p>
                  </div>

                  {exportType === option.id && (
                    <Check className="w-5 h-5 text-black" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Export Status */}
        {exportStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Export Successful!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Your study session has been exported successfully. The download should start automatically.
            </p>
          </div>
        )}

        {exportStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">Export Failed</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Export Button */}
        {isExporting ? (
          <div className="text-center py-6">
            <LoadingSpinner size="lg" text={`Preparing ${exportType.toUpperCase()} export...`} />
          </div>
        ) : (
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-500">
              {exportType === 'pdf' && 'PDF will include all content with formatting'}
              {exportType === 'json' && 'JSON will contain raw data for developers'}
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isExporting}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                onClick={handleExport}
                loading={isExporting}
                icon={Download}
              >
                Export {exportType.toUpperCase()}
              </Button>
            </div>
          </div>
        )}

        {/* Export Preview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2">What's Included:</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            {contentItems.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                {item}
              </li>
            ))}
          </ul>

          {contentItems.length === 0 && (
            <p className="text-sm text-blue-700">
              No content available for export in this session.
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default ExportOptions
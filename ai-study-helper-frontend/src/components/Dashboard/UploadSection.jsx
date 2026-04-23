import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import Button from '../UI/Button'
import LoadingSpinner from '../UI/LoadingSpinner'
import { useStudySessions } from '../../hooks/useStudySessions'
import { validateFile, getImagePreviewUrl, formatFileSize, handleApiError } from '../../utils/helpers'
import { UI_MESSAGES } from '../../utils/constants'

const UploadSection = ({ onSuccess, onCancel }) => {
  const navigate = useNavigate()
  const { uploadAndAnalyze } = useStudySessions()
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    setError('')

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(UI_MESSAGES.error.fileSize)
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError(UI_MESSAGES.error.fileType)
      } else {
        setError('Invalid file. Please try again.')
      }
      return
    }

    const file = acceptedFiles[0]
    if (!file) return

    // Validate file
    const validationErrors = validateFile(file)
    if (validationErrors.length > 0) {
      setError(validationErrors[0])
      return
    }

    try {
      setSelectedFile(file)
      const previewUrl = await getImagePreviewUrl(file)
      setPreview(previewUrl)
    } catch (error) {
      console.error('Failed to generate preview:', error)
      setError('Failed to process file. Please try again.')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.tiff', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  })

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreview(null)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedFile) {
      setError('Please select a file to upload')
      return
    }

    if (!prompt.trim()) {
      setError('Please provide a description of what you want to analyze')
      return
    }

    try {
      setIsUploading(true)
      setError('')
      setUploadProgress(0)

      const result = await uploadAndAnalyze(selectedFile, prompt.trim())

      if (result) {
        // Success! Navigate to analysis view
        navigate(`/analysis/${result._id}`)
        if (onSuccess) onSuccess()
      }
    } catch (error) {
      console.error('Upload failed:', error)
      setError(handleApiError(error))
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const suggestedPrompts = [
    'Analyze this content and provide a summary with quiz questions',
    'Explain the key concepts and create flashcards',
    'Generate a mind map and provide detailed explanations',
    'Create study notes with important points highlighted'
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload Area */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-black">
          Upload Image
        </label>

        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-200
              ${isDragActive
                ? 'border-black bg-gray-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-black mb-2">
              {isDragActive ? 'Drop your image here' : 'Upload study material'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Drag and drop an image here, or click to browse
            </p>
            <p className="text-xs text-gray-400">
              Supports: JPEG, PNG, GIF, BMP, TIFF, WebP (max 10MB)
            </p>
          </div>
        ) : (
          <div className="relative bg-gray-50 rounded-xl p-4">
            <button
              type="button"
              onClick={handleRemoveFile}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            <div className="flex items-center gap-4">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-medium text-black truncate">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                <p className="text-xs text-gray-400 capitalize">{selectedFile.type}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prompt Input */}
      <div className="space-y-4">
        <label htmlFor="prompt" className="block text-sm font-medium text-black">
          What would you like to analyze?
        </label>

        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to analyze about this image..."
          rows={4}
          className="textarea-field"
          disabled={isUploading}
        />

        {/* Suggested Prompts */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Suggested prompts:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setPrompt(suggestion)}
                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200 text-gray-700"
                disabled={isUploading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-gray-600">
              Analyzing your image...
            </span>
          </div>
          {uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-black h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          loading={isUploading}
          disabled={!selectedFile || !prompt.trim() || isUploading}
          className="flex-1"
        >
          {isUploading ? 'Analyzing...' : 'Analyze Image'}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

export default UploadSection
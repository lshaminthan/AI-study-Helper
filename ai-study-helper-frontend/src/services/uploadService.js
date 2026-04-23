import { api } from './api'

class UploadService {
  async uploadAndAnalyze(file, prompt, onProgress) {
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('prompt', prompt)

      const response = await api.post('/upload/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            onProgress(percentCompleted)
          }
        },
      })

      return response.data
    } catch (error) {
      console.error('Upload and analyze failed:', error)
      throw error
    }
  }

  async getStudySessions() {
    try {
      const response = await api.get('/upload/sessions')
      return response.data
    } catch (error) {
      console.error('Get study sessions failed:', error)
      throw error
    }
  }

  async getStudySession(sessionId) {
    try {
      const response = await api.get(`/upload/sessions/${sessionId}`)
      return response.data
    } catch (error) {
      console.error('Get study session failed:', error)
      throw error
    }
  }

  async deleteStudySession(sessionId) {
    try {
      const response = await api.delete(`/upload/sessions/${sessionId}`)
      return response.data
    } catch (error) {
      console.error('Delete study session failed:', error)
      throw error
    }
  }

  async regenerateAnalysis(sessionId, newPrompt) {
    try {
      const response = await api.post(`/analysis/regenerate/${sessionId}`, {
        prompt: newPrompt
      })
      return response.data
    } catch (error) {
      console.error('Regenerate analysis failed:', error)
      throw error
    }
  }

  async generateQuiz(sessionId, questionType = 'multiple-choice', count = 5) {
    try {
      const response = await api.post(`/analysis/generate-quiz/${sessionId}`, {
        questionType,
        count
      })
      return response.data
    } catch (error) {
      console.error('Generate quiz failed:', error)
      throw error
    }
  }

  async exportToPdf(sessionId) {
    try {
      const response = await api.get(`/export/pdf/${sessionId}`)
      return response.data
    } catch (error) {
      console.error('Export to PDF failed:', error)
      throw error
    }
  }

  async downloadFile(fileName) {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
      const downloadUrl = `${baseUrl}/export/download/${fileName}`

      // Create temporary link and trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download file failed:', error)
      throw error
    }
  }

  // Validate file before upload
  validateFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload an image file (JPEG, PNG, GIF, BMP, TIFF, WebP)')
    }

    if (file.size > maxSize) {
      throw new Error('File size too large. Please upload an image smaller than 10MB')
    }

    return true
  }

  // Get image preview URL
  getImagePreviewUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
}

export const uploadService = new UploadService()
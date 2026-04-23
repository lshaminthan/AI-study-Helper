import { FILE_CONSTRAINTS } from './constants'

// Format file size in human readable format
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Validate uploaded file
export const validateFile = (file) => {
  const errors = []

  if (!file) {
    errors.push('No file selected')
    return errors
  }

  // Check file size
  if (file.size > FILE_CONSTRAINTS.maxSize) {
    errors.push(`File size too large. Maximum size is ${formatFileSize(FILE_CONSTRAINTS.maxSize)}`)
  }

  // Check file type
  if (!FILE_CONSTRAINTS.allowedTypes.includes(file.type)) {
    errors.push('Invalid file type. Please upload an image file (JPEG, PNG, GIF, BMP, TIFF, WebP)')
  }

  return errors
}

// Generate preview URL for image file
export const getImagePreviewUrl = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// Format date to readable string
export const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Format time duration
export const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Truncate text to specified length
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

// Clean text for display (remove extra whitespace, etc.)
export const cleanText = (text) => {
  if (!text) return ''
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .trim()
}

// Extract key concepts from text
export const extractKeyConcepts = (text, maxConcepts = 5) => {
  if (!text) return []

  // Simple concept extraction based on capitalized words
  const words = text.split(/\s+/)
  const concepts = []

  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '')
    if (cleanWord.length > 3 && /^[A-Z]/.test(cleanWord)) {
      if (!concepts.includes(cleanWord) && concepts.length < maxConcepts) {
        concepts.push(cleanWord)
      }
    }
  })

  return concepts
}

// Generate unique ID
export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle
  return function () {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Copy text to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
      return true
    } catch (err) {
      console.error('Failed to copy text:', err)
      return false
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

// Download file from URL
export const downloadFile = (url, filename) => {
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Check if device is mobile
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Get YouTube video ID from URL
export const getYouTubeVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

// Format YouTube view count
export const formatViewCount = (viewCount) => {
  const count = parseInt(viewCount)
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M views'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K views'
  } else {
    return count + ' views'
  }
}

// Convert markdown to plain text
export const markdownToText = (markdown) => {
  if (!markdown) return ''

  return markdown
    .replace(/[#*_`]/g, '') // Remove markdown characters
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
    .replace(/\n+/g, ' ') // Replace line breaks with spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

// Handle API errors consistently
export const handleApiError = (error) => {
  console.error('API Error:', error)

  if (error.response?.data?.message) {
    return error.response.data.message
  } else if (error.message) {
    return error.message
  } else {
    return 'An unexpected error occurred. Please try again.'
  }
}

// Local storage helpers
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (err) {
      console.error('Failed to get from localStorage:', err)
      return null
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (err) {
      console.error('Failed to set to localStorage:', err)
      return false
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (err) {
      console.error('Failed to remove from localStorage:', err)
      return false
    }
  },

  clear: () => {
    try {
      localStorage.clear()
      return true
    } catch (err) {
      console.error('Failed to clear localStorage:', err)
      return false
    }
  }
}
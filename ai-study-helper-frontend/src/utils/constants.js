export const APP_CONFIG = {
  name: 'AI Study Helper',
  version: '1.0.0',
  description: 'Transform your notes with AI',
}

export const API_ENDPOINTS = {
  auth: {
    status: '/auth/status',
    user: '/auth/user',
    logout: '/auth/logout',
    google: '/auth/google',
  },
  upload: {
    analyze: '/upload/analyze',
    sessions: '/upload/sessions',
    session: (id) => `/upload/sessions/${id}`,
  },
  analysis: {
    regenerate: (id) => `/analysis/regenerate/${id}`,
    quiz: (id) => `/analysis/generate-quiz/${id}`,
    mindmap: (id) => `/analysis/mindmap/${id}`,
    youtube: '/analysis/youtube-search',
  },
  chat: {
    message: (id) => `/chat/message/${id}`,
    history: (id) => `/chat/history/${id}`,
    mindmap: '/chat/mindmap',
  },
  export: {
    pdf: (id) => `/export/pdf/${id}`,
    download: (fileName) => `/export/download/${fileName}`,
    json: (id) => `/export/json/${id}`,
    stats: '/export/stats',
  },
}

export const IMAGE_TYPES = {
  HANDWRITTEN: 'handwritten',
  TEXTBOOK: 'textbook',
  DIAGRAM: 'diagram',
}

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple-choice',
  SHORT_ANSWER: 'short-answer',
  TRUE_FALSE: 'true-false',
}

export const FILE_CONSTRAINTS = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'],
}

export const UI_MESSAGES = {
  loading: {
    analyzing: 'Analyzing your image...',
    uploading: 'Uploading file...',
    generating: 'Generating content...',
    exporting: 'Preparing export...',
  },
  success: {
    uploaded: 'Image uploaded successfully!',
    analyzed: 'Analysis completed!',
    exported: 'Export completed!',
    deleted: 'Session deleted successfully!',
  },
  error: {
    upload: 'Failed to upload image. Please try again.',
    analysis: 'Failed to analyze image. Please try again.',
    network: 'Network error. Please check your connection.',
    fileSize: 'File size too large. Maximum size is 10MB.',
    fileType: 'Invalid file type. Please upload an image file.',
    generic: 'Something went wrong. Please try again.',
  },
  prompts: {
    default: 'Please analyze this image and provide a summary, explanations, and generate quiz questions.',
    summary: 'Provide a concise summary of the main concepts in this image.',
    quiz: 'Generate quiz questions based on the content in this image.',
    explain: 'Explain the concepts shown in this image in simple terms.',
  },
}

export const VOICE_CONFIG = {
  defaultRate: 0.9,
  defaultPitch: 1.0,
  defaultVolume: 1.0,
  languages: [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
  ],
}

export const YOUTUBE_CONFIG = {
  maxResults: 6,
  defaultQuery: 'educational tutorial',
  embedBaseUrl: 'https://www.youtube.com/embed/',
  watchBaseUrl: 'https://www.youtube.com/watch?v=',
}

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
}

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}
import { useState, useEffect, useRef } from 'react'

export const useVoice = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentText, setCurrentText] = useState('')
  const [progress, setProgress] = useState(0)
  const [isSupported, setIsSupported] = useState(false)
  const utteranceRef = useRef(null)
  const textRef = useRef('')

  useEffect(() => {
    // Check if speech synthesis is supported
    setIsSupported('speechSynthesis' in window)
  }, [])

  const speak = (text, options = {}) => {
    if (!isSupported || !text.trim()) return

    // Stop any current speech
    stop()

    const utterance = new SpeechSynthesisUtterance(text)

    // Configure utterance
    utterance.rate = options.rate || 0.9
    utterance.pitch = options.pitch || 1
    utterance.volume = options.volume || 1
    utterance.voice = options.voice || null

    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true)
      setIsPaused(false)
      setCurrentText(text)
      textRef.current = text
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
      setProgress(0)
      setCurrentText('')
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error)
      setIsPlaying(false)
      setIsPaused(false)
      setProgress(0)
    }

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const progressPercent = (event.charIndex / text.length) * 100
        setProgress(Math.min(progressPercent, 100))
      }
    }

    utteranceRef.current = utterance
    speechSynthesis.speak(utterance)
  }

  const pause = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause()
      setIsPaused(true)
    }
  }

  const resume = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume()
      setIsPaused(false)
    }
  }

  const stop = () => {
    speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
    setProgress(0)
    setCurrentText('')
    utteranceRef.current = null
  }

  const toggle = () => {
    if (isPlaying) {
      if (isPaused) {
        resume()
      } else {
        pause()
      }
    } else if (textRef.current) {
      speak(textRef.current)
    }
  }

  const getVoices = () => {
    return speechSynthesis.getVoices()
  }

  const cleanTextForSpeech = (text) => {
    // Remove markdown, HTML tags, and special characters
    return text
      .replace(/[#*_`]/g, '') // Remove markdown
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\n+/g, '. ') // Replace line breaks with periods
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
  }

  return {
    isPlaying,
    isPaused,
    currentText,
    progress,
    isSupported,
    speak,
    pause,
    resume,
    stop,
    toggle,
    getVoices,
    cleanTextForSpeech
  }
}
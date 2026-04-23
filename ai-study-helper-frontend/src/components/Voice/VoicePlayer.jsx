import React, { useState, useEffect } from 'react'
import { Play, Pause, Square, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { useVoice } from '../../hooks/useVoice'
import Button from '../UI/Button'

const VoicePlayer = ({ text, title = "Text to Speech" }) => {
  const {
    isPlaying,
    isPaused,
    progress,
    isSupported,
    speak,
    pause,
    resume,
    stop,
    cleanTextForSpeech
  } = useVoice()

  const [rate, setRate] = useState(0.9)
  const [volume, setVolume] = useState(1.0)
  const [currentText, setCurrentText] = useState('')

  useEffect(() => {
    if (text) {
      const cleanedText = cleanTextForSpeech(text)
      setCurrentText(cleanedText)
    }
  }, [text, cleanTextForSpeech])

  const handlePlay = () => {
    if (!currentText.trim()) return

    if (isPlaying && isPaused) {
      resume()
    } else if (!isPlaying) {
      speak(currentText, { rate, volume })
    } else {
      pause()
    }
  }

  const handleStop = () => {
    stop()
  }

  const handleRewind = () => {
    if (isPlaying) {
      stop()
      setTimeout(() => {
        speak(currentText, { rate, volume })
      }, 100)
    }
  }

  const handleForward = () => {
    // For simplicity, we'll just restart the speech
    // In a more advanced implementation, you could track word positions
    handleRewind()
  }

  if (!isSupported) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-gray-500">
          <VolumeX className="w-5 h-5" />
          <span className="text-sm">Text-to-speech is not supported in your browser</span>
        </div>
      </div>
    )
  }

  if (!currentText.trim()) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-gray-500">
          <Volume2 className="w-5 h-5" />
          <span className="text-sm">No text available for speech</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Volume2 className="w-5 h-5 text-gray-600" />
        <h3 className="font-medium text-black">{title}</h3>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-black h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRewind}
          icon={SkipBack}
          disabled={!currentText}
        />

        <Button
          variant={isPlaying && !isPaused ? "secondary" : "primary"}
          size="md"
          onClick={handlePlay}
          disabled={!currentText}
          className="px-6"
        >
          {isPlaying && !isPaused ? (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              {isPaused ? 'Resume' : 'Play'}
            </>
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleStop}
          icon={Square}
          disabled={!isPlaying}
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={handleForward}
          icon={SkipForward}
          disabled={!currentText}
        />
      </div>

      {/* Advanced Controls */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
        {/* Speed Control */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Speed: {rate}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            disabled={isPlaying}
          />
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Volume: {Math.round(volume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Status */}
      {isPlaying && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            {isPaused ? 'Paused' : 'Playing'} • {currentText.length} characters
          </p>
        </div>
      )}
    </div>
  )
}

export default VoicePlayer
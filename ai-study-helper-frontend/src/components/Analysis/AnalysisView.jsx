import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MessageCircle, Download, RefreshCw, Volume2 } from 'lucide-react'
import Navbar from '../UI/Navbar'
import LoadingSpinner from '../UI/LoadingSpinner'
import Button from '../UI/Button'
import SummarySection from './SummarySection'
import QuizSection from './QuizSection'
import FlashcardsSection from './FlashcardsSection'
import MindMapSection from './MindMapSection'
import ChatBot from '../Chat/ChatBot'
import YouTubeSection from '../YouTube/YouTubeSection'
import VoicePlayer from '../Voice/VoicePlayer'
import ExportOptions from '../Export/ExportOptions'
import { useStudySessions } from '../../hooks/useStudySessions'
import { uploadService } from '../../services/uploadService'
import { handleApiError } from '../../utils/helpers'

const AnalysisView = () => {
  const { sessionId } = useParams()
  const { getSession } = useStudySessions()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('summary')
  const [showChat, setShowChat] = useState(false)
  const [showVoice, setShowVoice] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    loadSession()
  }, [sessionId])

  const loadSession = async () => {
    try {
      setLoading(true)
      setError('')
      const sessionData = await getSession(sessionId)
      setSession(sessionData)
    } catch (err) {
      console.error('Failed to load session:', err)
      setError(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerateAnalysis = async () => {
    if (!session) return

    try {
      setRegenerating(true)
      const result = await uploadService.regenerateAnalysis(sessionId, session.userPrompt)
      setSession(result.data)
    } catch (err) {
      console.error('Failed to regenerate analysis:', err)
      setError(handleApiError(err))
    } finally {
      setRegenerating(false)
    }
  }

  const tabs = [
    { id: 'summary', label: 'Summary', icon: '📝' },
    { id: 'quiz', label: 'Quiz', icon: '❓' },
    { id: 'flashcards', label: 'Flashcards', icon: '🗂️' },
    { id: 'mindmap', label: 'Mind Map', icon: '🧠' },
    { id: 'videos', label: 'Videos', icon: '📺' }
  ]

  const getVoiceText = () => {
    if (!session?.analysis) return ''

    let text = ''
    if (session.analysis.summary) {
      text += `Summary: ${session.analysis.summary}\n\n`
    }
    if (session.analysis.explanations) {
      text += `Explanations: ${session.analysis.explanations}\n\n`
    }
    return text
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" text="Loading analysis..." />
          </div>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">{error || 'Session not found'}</p>
            <Link to="/dashboard">
              <Button variant="primary">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const baseUrl = import.meta.env.DEV ? '' : (import.meta.env.VITE_UPLOADS_BASE_URL || 'http://localhost:3001')
  const imageUrl = session.imageUrl ? `${baseUrl}${session.imageUrl}` : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" icon={ArrowLeft}>
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-black">{session.title}</h1>
              <p className="text-gray-600">
                {session.imageType} • {new Date(session.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVoice(!showVoice)}
              icon={Volume2}
            >
              Voice
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChat(!showChat)}
              icon={MessageCircle}
            >
              Chat
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExport(!showExport)}
              icon={Download}
            >
              Export
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRegenerateAnalysis}
              loading={regenerating}
              icon={RefreshCw}
            >
              Regenerate
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Image and Voice */}
          <div className="lg:col-span-1 space-y-6">
            {/* Original Image */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-black">Original Image</h3>
              </div>
              <div className="aspect-square bg-gray-100">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={session.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No image available
                  </div>
                )}
              </div>
            </div>

            {/* Voice Player */}
            {showVoice && (
              <VoicePlayer
                text={getVoiceText()}
                title="Listen to Analysis"
              />
            )}

            {/* User Prompt */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-black mb-2">Your Request</h3>
              <p className="text-gray-600 text-sm">{session.userPrompt}</p>
            </div>
          </div>

          {/* Right Column - Analysis Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                        ${activeTab === tab.id
                          ? 'border-black text-black'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'summary' && (
                  <SummarySection analysis={session.analysis} />
                )}
                {activeTab === 'quiz' && (
                  <QuizSection
                    questions={session.analysis.quizQuestions}
                    sessionId={session._id}
                  />
                )}
                {activeTab === 'flashcards' && (
                  <FlashcardsSection flashcards={session.analysis.flashcards} />
                )}
                {activeTab === 'mindmap' && (
                  <MindMapSection
                    mindMap={session.analysis.mindMap}
                    sessionId={session._id}
                  />
                )}
                {activeTab === 'videos' && (
                  <YouTubeSection videos={session.analysis.youtubeVideos} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Bot */}
      {showChat && (
        <ChatBot
          sessionId={session._id}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* Export Modal */}
      {showExport && (
        <ExportOptions
          session={session}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}

export default AnalysisView
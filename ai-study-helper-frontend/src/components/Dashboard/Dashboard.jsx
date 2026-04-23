import React, { useState } from 'react'
import { Plus, BookOpen, Clock, TrendingUp } from 'lucide-react'
import Navbar from '../UI/Navbar'
import UploadSection from './UploadSection'
import SessionCard from './SessionCard'
import Modal from '../UI/Modal'
import Button from '../UI/Button'
import LoadingSpinner from '../UI/LoadingSpinner'
import { useStudySessions } from '../../hooks/useStudySessions'
import { useAuth } from '../../hooks/useAuth'

const Dashboard = () => {
  const { user } = useAuth()
  const { sessions, loading, error, deleteSession } = useStudySessions()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [deletingSessionId, setDeletingSessionId] = useState(null)

  const handleDeleteSession = async (sessionId) => {
    try {
      setDeletingSessionId(sessionId)
      await deleteSession(sessionId)
    } catch (error) {
      console.error('Failed to delete session:', error)
    } finally {
      setDeletingSessionId(null)
    }
  }

  const getStatsData = () => {
    const totalSessions = sessions.length
    const recentSessions = sessions.filter(session => {
      const sessionDate = new Date(session.createdAt)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return sessionDate >= weekAgo
    }).length

    const typeDistribution = sessions.reduce((acc, session) => {
      acc[session.imageType] = (acc[session.imageType] || 0) + 1
      return acc
    }, {})

    return {
      totalSessions,
      recentSessions,
      typeDistribution
    }
  }

  const stats = getStatsData()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">
            Transform your study materials with AI-powered analysis
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-black">{stats.totalSessions}</p>
              </div>
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-black">{stats.recentSessions}</p>
              </div>
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Most Used</p>
                <p className="text-2xl font-bold text-black capitalize">
                  {Object.keys(stats.typeDistribution).reduce((a, b) =>
                    stats.typeDistribution[a] > stats.typeDistribution[b] ? a : b, 'None'
                  )}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowUploadModal(true)}
            icon={Plus}
            className="w-full sm:w-auto"
          >
            Upload New Material
          </Button>
        </div>

        {/* Study Sessions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black">Recent Study Sessions</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Loading your study sessions..." />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No study sessions yet
              </h3>
              <p className="text-gray-500 mb-6">
                Upload your first image to get started with AI-powered analysis
              </p>
              <Button
                variant="primary"
                onClick={() => setShowUploadModal(true)}
                icon={Plus}
              >
                Upload First Material
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session) => (
                <SessionCard
                  key={session._id}
                  session={session}
                  onDelete={() => handleDeleteSession(session._id)}
                  isDeleting={deletingSessionId === session._id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Study Material"
        size="lg"
      >
        <UploadSection
          onSuccess={() => setShowUploadModal(false)}
          onCancel={() => setShowUploadModal(false)}
        />
      </Modal>
    </div>
  )
}

export default Dashboard
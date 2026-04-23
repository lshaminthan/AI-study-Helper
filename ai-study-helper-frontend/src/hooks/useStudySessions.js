import { useState, useEffect } from 'react'
import { api } from '../services/api'

export const useStudySessions = () => {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchSessions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/upload/sessions')
      setSessions(response.data.data || [])
    } catch (err) {
      setError(err.message)
      console.error('Failed to fetch study sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  const getSession = async (sessionId) => {
    try {
      const response = await api.get(`/upload/sessions/${sessionId}`)
      return response.data.data
    } catch (err) {
      console.error('Failed to fetch session:', err)
      throw err
    }
  }

  const deleteSession = async (sessionId) => {
    try {
      await api.delete(`/upload/sessions/${sessionId}`)
      setSessions(prev => prev.filter(session => session._id !== sessionId))
    } catch (err) {
      console.error('Failed to delete session:', err)
      throw err
    }
  }

  const uploadAndAnalyze = async (file, prompt) => {
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('image', file)
      formData.append('prompt', prompt)

      const response = await api.post('/upload/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const newSession = response.data.data
      setSessions(prev => [newSession, ...prev])
      return newSession
    } catch (err) {
      console.error('Upload and analyze failed:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    getSession,
    deleteSession,
    uploadAndAnalyze
  }
}
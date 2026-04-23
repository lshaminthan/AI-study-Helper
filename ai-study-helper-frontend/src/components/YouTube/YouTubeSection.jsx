import React, { useState } from 'react'
import { Youtube, Play, Search, ExternalLink } from 'lucide-react'
import VideoCard from './VideoCard'
import VideoPlayer from './VideoPlayer'
import Button from '../UI/Button'
import { api } from '../../services/api'
import { handleApiError } from '../../utils/helpers'

const YouTubeSection = ({ videos = [] }) => {
  const [currentVideos, setCurrentVideos] = useState(videos)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')

  const handleVideoSelect = (video) => {
    setSelectedVideo(video)
  }

  const handleClosePlayer = () => {
    setSelectedVideo(null)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      setIsSearching(true)
      setError('')

      const response = await api.post('/analysis/youtube-search', {
        searchTerms: [searchQuery.trim()],
        maxResults: 8
      })

      setCurrentVideos(response.data.data || [])
    } catch (err) {
      console.error('YouTube search failed:', err)
      setError(handleApiError(err))
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const openInYouTube = (video) => {
    const url = video.url || `https://youtube.com/watch?v=${video.videoId}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (!currentVideos || currentVideos.length === 0) {
    return (
      <div className="space-y-6">
        {/* Search Section */}
        <div className="flex items-center gap-2 mb-6">
          <Youtube className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-black">Related Videos</h2>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for educational videos..."
              className="input-field"
              disabled={isSearching}
            />
          </div>
          <Button
            variant="primary"
            onClick={handleSearch}
            loading={isSearching}
            icon={Search}
            disabled={!searchQuery.trim()}
          >
            Search
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="text-center py-12">
          <Youtube className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No Videos Found
          </h3>
          <p className="text-gray-500 mb-6">
            Search for educational videos related to your content
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-black">
              Educational Videos ({currentVideos.length})
            </h2>
          </div>

          <div className="text-sm text-gray-500">
            Sorted by popularity
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for more videos..."
              className="input-field"
              disabled={isSearching}
            />
          </div>
          <Button
            variant="secondary"
            onClick={handleSearch}
            loading={isSearching}
            icon={Search}
            disabled={!searchQuery.trim()}
          >
            Search
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentVideos.map((video, index) => (
          <VideoCard
            key={video.videoId || index}
            video={video}
            onPlay={() => handleVideoSelect(video)}
            onOpenInYouTube={() => openInYouTube(video)}
          />
        ))}
      </div>

      {/* Embedded Video Player */}
      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={handleClosePlayer}
        />
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Video Learning Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click on any video to watch it embedded in this page</li>
          <li>• Use the external link button to open videos in YouTube</li>
          <li>• Videos are sorted by view count for quality content</li>
          <li>• Search for specific topics to find more relevant content</li>
        </ul>
      </div>
    </div>
  )
}

export default YouTubeSection
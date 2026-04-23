import React, { useState } from 'react'
import { Play, ExternalLink, Eye, User } from 'lucide-react'
import Button from '../UI/Button'
import { truncateText } from '../../utils/helpers'

const VideoCard = ({ video, onPlay, onOpenInYouTube }) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const getThumbnailUrl = () => {
    if (video.thumbnail) return video.thumbnail
    if (video.videoId) return `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`
    return null
  }

  const getYouTubeUrl = () => {
    if (video.url) return video.url
    if (video.videoId) return `https://youtube.com/watch?v=${video.videoId}`
    return '#'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {!imageError && getThumbnailUrl() ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full" />
              </div>
            )}
            <img
              src={getThumbnailUrl()}
              alt={video.title}
              className={`w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Play className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={onPlay}
            icon={Play}
            className="shadow-lg"
          >
            Play
          </Button>
        </div>

        {/* Duration/Views Badge */}
        {video.views && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {video.views}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-black mb-2 leading-snug">
          <span title={video.title}>
            {truncateText(video.title, 80)}
          </span>
        </h3>

        {/* Channel */}
        {video.channelTitle && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <User className="w-4 h-4" />
            <span>{truncateText(video.channelTitle, 40)}</span>
          </div>
        )}

        {/* Description */}
        {video.description && (
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
            {truncateText(video.description, 120)}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          {video.views && (
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{video.views}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            <span>YouTube</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onPlay}
            icon={Play}
            className="flex-1"
          >
            Watch Here
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenInYouTube}
            icon={ExternalLink}
            title="Open in YouTube"
          />
        </div>
      </div>
    </div>
  )
}

export default VideoCard
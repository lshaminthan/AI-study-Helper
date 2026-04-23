import React, { useEffect } from 'react'
import { X, ExternalLink, User, Eye } from 'lucide-react'
import Button from '../UI/Button'
import Modal from '../UI/Modal'
import { getYouTubeVideoId } from '../../utils/helpers'

const VideoPlayer = ({ video, onClose }) => {
  const videoId = video.videoId || getYouTubeVideoId(video.url)

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleOpenInYouTube = () => {
    const url = video.url || `https://youtube.com/watch?v=${videoId}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
    : null

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      size="full"
      showCloseButton={false}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-xl font-bold text-black mb-2 leading-tight">
              {video.title}
            </h2>

            {video.channelTitle && (
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <User className="w-4 h-4" />
                <span className="font-medium">{video.channelTitle}</span>
              </div>
            )}

            {video.views && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Eye className="w-4 h-4" />
                <span>{video.views}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleOpenInYouTube}
              icon={ExternalLink}
            >
              Open in YouTube
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon={X}
            >
              Close
            </Button>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative">
          {embedUrl ? (
            <div className="youtube-embed">
              <iframe
                src={embedUrl}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full rounded-lg"
                style={{ minHeight: '480px' }}
              />
            </div>
          ) : (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">▶</span>
                </div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Unable to Load Video
                </h3>
                <p className="text-gray-500 mb-4">
                  The video cannot be embedded. Please watch it on YouTube.
                </p>
                <Button
                  variant="primary"
                  onClick={handleOpenInYouTube}
                  icon={ExternalLink}
                >
                  Watch on YouTube
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {video.description && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-black mb-2">Description</h4>
            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {video.description.length > 500
                ? `${video.description.substring(0, 500)}...`
                : video.description
              }
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-sm">💡</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 mb-2">Learning Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Take notes while watching to reinforce learning</li>
                <li>• Pause and rewind sections you want to review</li>
                <li>• Use the speed controls to adjust playback speed</li>
                <li>• Enable captions if available for better comprehension</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Press Esc to close player
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleOpenInYouTube}
              icon={ExternalLink}
            >
              Watch on YouTube
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={onClose}
            >
              Close Player
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default VideoPlayer
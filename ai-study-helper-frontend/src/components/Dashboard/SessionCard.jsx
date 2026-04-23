import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { MoreVertical, Eye, Download, Trash2, FileText, Brain, Book } from 'lucide-react'
import Button from '../UI/Button'
import Modal from '../UI/Modal'
import { formatDate, truncateText } from '../../utils/helpers'

const SessionCard = ({ session, onDelete, isDeleting }) => {
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const getImageTypeIcon = (type) => {
    switch (type) {
      case 'handwritten':
        return <FileText className="w-5 h-5" />
      case 'textbook':
        return <Book className="w-5 h-5" />
      case 'diagram':
        return <Brain className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getImageTypeColor = (type) => {
    switch (type) {
      case 'handwritten':
        return 'bg-blue-100 text-blue-800'
      case 'textbook':
        return 'bg-green-100 text-green-800'
      case 'diagram':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDeleteConfirm = () => {
    onDelete(session._id)
    setShowDeleteConfirm(false)
  }

  const baseUrl = import.meta.env.DEV ? '' : (import.meta.env.VITE_UPLOADS_BASE_URL || 'http://localhost:3001')
  const imageUrl = session.imageUrl ? `${baseUrl}${session.imageUrl}` : null

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
        {/* Image Preview */}
        <div className="aspect-video bg-gray-100 relative overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={session.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="w-12 h-12 text-gray-300" />
            </div>
          )}

          {/* Overlay with actions - visible on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <Link to={`/analysis/${session._id}`}>
              <Button variant="secondary" size="sm" icon={Eye}>
                View Analysis
              </Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-black truncate mb-1">
                {session.title}
              </h3>
              <p className="text-sm text-gray-500">
                {formatDate(session.createdAt)}
              </p>
            </div>

            {/* Menu Button */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                  <Link
                    to={`/analysis/${session._id}`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowMenu(false)}
                  >
                    <Eye className="w-4 h-4" />
                    View Analysis
                  </Link>
                  <button
                    onClick={() => {
                      // Handle export functionality
                      setShowMenu(false)
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" />
                    Export PDF
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true)
                      setShowMenu(false)
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Image Type Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getImageTypeColor(session.imageType)}`}>
              {getImageTypeIcon(session.imageType)}
              {session.imageType}
            </span>
          </div>

          {/* Prompt Preview */}
          {session.userPrompt && (
            <div className="mb-3">
              <p className="text-sm text-gray-600">
                {truncateText(session.userPrompt, 100)}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {session.analysis?.quizQuestions?.length || 0} questions
            </span>
            <span>
              {session.analysis?.flashcards?.length || 0} flashcards
            </span>
            <span>
              {session.chatMessages?.length || 0} chats
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Study Session"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{session.title}"? This action cannot be undone.
          </p>

          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              loading={isDeleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Backdrop to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-[5]"
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
  )
}

export default SessionCard
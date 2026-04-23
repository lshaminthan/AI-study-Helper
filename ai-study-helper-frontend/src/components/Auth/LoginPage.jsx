import React, { useState } from 'react'
import { Brain, Upload, MessageCircle, FileText, Volume2, Youtube } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../UI/Button'
import { APP_CONFIG } from '../../utils/constants'

const LoginPage = () => {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      await login()
    } catch (error) {
      console.error('Login failed:', error)
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: Upload,
      title: 'Upload & Analyze',
      description: 'Upload handwritten notes, textbook pages, or diagrams for AI analysis'
    },
    {
      icon: FileText,
      title: 'Generate Summaries',
      description: 'Get concise summaries and explanations of your study materials'
    },
    {
      icon: MessageCircle,
      title: 'Interactive Chat',
      description: 'Ask questions about your uploaded content with our AI chatbot'
    },
    {
      icon: Youtube,
      title: 'Video Suggestions',
      description: 'Get relevant YouTube videos ordered by popularity and views'
    },
    {
      icon: Volume2,
      title: 'Voice Output',
      description: 'Listen to your study materials with text-to-speech functionality'
    },
    {
      icon: Brain,
      title: 'Mind Maps',
      description: 'Generate visual mind maps to better understand concepts'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="text-center">
            {/* Logo and Brand */}
            <div className="flex justify-center items-center gap-3 mb-8">
              <Brain className="w-16 h-16 text-black" />
              <h1 className="text-4xl lg:text-6xl font-bold text-black">
                {APP_CONFIG.name}
              </h1>
            </div>

            {/* Tagline */}
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your handwritten notes, textbook pages, and diagrams into interactive learning materials with the power of AI
            </p>

            {/* CTA Button */}
            <div className="mb-16">
              <Button
                variant="primary"
                size="xl"
                onClick={handleGoogleLogin}
                loading={isLoading}
                className="text-xl px-12 py-4"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                Sign in with your Google account to get started
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
              Everything you need to study smarter
            </h2>
            <p className="text-xl text-gray-600">
              Powered by advanced AI to enhance your learning experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to transform your study materials
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">
                Upload Your Content
              </h3>
              <p className="text-gray-600">
                Take a photo or upload images of handwritten notes, textbook pages, or diagrams
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">
                AI Analysis
              </h3>
              <p className="text-gray-600">
                Our AI extracts text, analyzes content, and generates summaries, explanations, and quiz questions
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">
                Study & Learn
              </h3>
              <p className="text-gray-600">
                Use interactive features like chat, voice output, and mind maps to enhance your learning
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Brain className="w-6 h-6" />
            <span className="font-semibold">{APP_CONFIG.name}</span>
          </div>
          <p className="text-gray-400">
            {APP_CONFIG.description} - Version {APP_CONFIG.version}
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
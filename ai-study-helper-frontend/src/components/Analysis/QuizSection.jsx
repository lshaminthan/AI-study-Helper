import React, { useState } from 'react'
import { HelpCircle, CheckCircle, XCircle, RefreshCw, Plus } from 'lucide-react'
import Button from '../UI/Button'
import { uploadService } from '../../services/uploadService'
import { handleApiError } from '../../utils/helpers'

const QuizSection = ({ questions = [], sessionId }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatingMore, setGeneratingMore] = useState(false)
  const [additionalQuestions, setAdditionalQuestions] = useState([])

  const allQuestions = [...questions, ...additionalQuestions]

  const handleAnswerSelect = (questionIndex, answer) => {
    if (quizCompleted) return

    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }))
  }

  const handleSubmitQuiz = () => {
    setShowResults(true)
    setQuizCompleted(true)
  }

  const handleResetQuiz = () => {
    setSelectedAnswers({})
    setShowResults(false)
    setQuizCompleted(false)
    setCurrentQuestion(0)
  }

  const handleGenerateMoreQuestions = async () => {
    try {
      setGeneratingMore(true)
      const result = await uploadService.generateQuiz(sessionId, 'multiple-choice', 3)
      setAdditionalQuestions(prev => [...prev, ...result.data])
    } catch (error) {
      console.error('Failed to generate more questions:', error)
    } finally {
      setGeneratingMore(false)
    }
  }

  const getScore = () => {
    let correct = 0
    allQuestions.forEach((question, index) => {
      const userAnswer = selectedAnswers[index]
      if (userAnswer === question.correctAnswer) {
        correct++
      }
    })
    return { correct, total: allQuestions.length }
  }

  const getAnswerStatus = (questionIndex, option) => {
    const question = allQuestions[questionIndex]
    const userAnswer = selectedAnswers[questionIndex]

    if (!showResults) {
      return userAnswer === option ? 'selected' : 'default'
    }

    if (option === question.correctAnswer) {
      return 'correct'
    } else if (option === userAnswer && option !== question.correctAnswer) {
      return 'incorrect'
    }

    return 'default'
  }

  const score = getScore()

  if (!allQuestions || allQuestions.length === 0) {
    return (
      <div className="text-center py-12">
        <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No Quiz Questions Available
        </h3>
        <p className="text-gray-500 mb-6">
          The analysis didn't generate any quiz questions for this content.
        </p>
        <Button
          variant="primary"
          onClick={handleGenerateMoreQuestions}
          loading={generatingMore}
          icon={Plus}
        >
          Generate Quiz Questions
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-black">
            Quiz Questions ({allQuestions.length})
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {showResults && (
            <div className="text-sm text-gray-600">
              Score: {score.correct}/{score.total} ({Math.round((score.correct / score.total) * 100)}%)
            </div>
          )}

          {quizCompleted ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetQuiz}
              icon={RefreshCw}
            >
              Retake Quiz
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitQuiz}
              disabled={Object.keys(selectedAnswers).length !== allQuestions.length}
            >
              Submit Quiz
            </Button>
          )}
        </div>
      </div>

      {/* Quiz Navigation */}
      {allQuestions.length > 1 && !showResults && (
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {allQuestions.length}
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentQuestion(Math.min(allQuestions.length - 1, currentQuestion + 1))}
              disabled={currentQuestion === allQuestions.length - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-8">
        {showResults ? (
          // Show all questions with results
          allQuestions.map((question, questionIndex) => (
            <div key={questionIndex} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                  {questionIndex + 1}
                </div>
                <h3 className="font-medium text-black flex-1">
                  {question.question}
                </h3>
                {selectedAnswers[questionIndex] === question.correctAnswer ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>

              {question.options && question.options.length > 0 ? (
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => {
                    const status = getAnswerStatus(questionIndex, option)
                    return (
                      <div
                        key={optionIndex}
                        className={`
                          quiz-option
                          ${status === 'correct' ? 'quiz-option correct' : ''}
                          ${status === 'incorrect' ? 'quiz-option incorrect' : ''}
                          ${status === 'selected' && !showResults ? 'quiz-option selected' : ''}
                        `}
                      >
                        {option}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Your Answer:</p>
                  <p className="font-medium">
                    {selectedAnswers[questionIndex] || 'Not answered'}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Correct Answer:</p>
                  <p className="font-medium text-green-600">
                    {question.correctAnswer}
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          // Show current question only
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-6">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                {currentQuestion + 1}
              </div>
              <h3 className="font-medium text-black flex-1 text-lg">
                {allQuestions[currentQuestion]?.question}
              </h3>
            </div>

            {allQuestions[currentQuestion]?.options && allQuestions[currentQuestion].options.length > 0 ? (
              <div className="space-y-3">
                {allQuestions[currentQuestion].options.map((option, optionIndex) => (
                  <button
                    key={optionIndex}
                    onClick={() => handleAnswerSelect(currentQuestion, option)}
                    className={`
                      quiz-option w-full text-left
                      ${selectedAnswers[currentQuestion] === option ? 'quiz-option selected' : ''}
                    `}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Your Answer:
                </label>
                <textarea
                  value={selectedAnswers[currentQuestion] || ''}
                  onChange={(e) => handleAnswerSelect(currentQuestion, e.target.value)}
                  placeholder="Type your answer here..."
                  rows={3}
                  className="textarea-field"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generate More Questions */}
      {sessionId && (
        <div className="text-center pt-6 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={handleGenerateMoreQuestions}
            loading={generatingMore}
            icon={Plus}
          >
            Generate More Questions
          </Button>
        </div>
      )}

      {/* Quiz Summary */}
      {showResults && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-black mb-4">Quiz Summary</h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{score.correct}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{score.total - score.correct}</div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((score.correct / score.total) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuizSection
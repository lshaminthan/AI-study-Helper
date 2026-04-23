import React, { useState } from 'react'
import { CreditCard, ChevronLeft, ChevronRight, RotateCcw, Shuffle } from 'lucide-react'
import Button from '../UI/Button'

const FlashcardsSection = ({ flashcards = [] }) => {
  const [currentCard, setCurrentCard] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [studyMode, setStudyMode] = useState('sequential') // sequential, random
  const [cardOrder, setCardOrder] = useState(() =>
    flashcards.map((_, index) => index)
  )
  const [studiedCards, setStudiedCards] = useState(new Set())

  const shuffleCards = () => {
    const shuffled = [...cardOrder].sort(() => Math.random() - 0.5)
    setCardOrder(shuffled)
    setCurrentCard(0)
    setIsFlipped(false)
    setStudyMode('random')
  }

  const resetOrder = () => {
    setCardOrder(flashcards.map((_, index) => index))
    setCurrentCard(0)
    setIsFlipped(false)
    setStudyMode('sequential')
    setStudiedCards(new Set())
  }

  const flipCard = () => {
    setIsFlipped(!isFlipped)
    if (!isFlipped) {
      // Mark as studied when flipping to see the back
      setStudiedCards(prev => new Set(prev).add(cardOrder[currentCard]))
    }
  }

  const nextCard = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1)
      setIsFlipped(false)
    }
  }

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1)
      setIsFlipped(false)
    }
  }

  const goToCard = (index) => {
    setCurrentCard(index)
    setIsFlipped(false)
  }

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No Flashcards Available
        </h3>
        <p className="text-gray-500">
          The analysis didn't generate any flashcards for this content.
        </p>
      </div>
    )
  }

  const currentCardData = flashcards[cardOrder[currentCard]]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-black">
            Flashcards ({flashcards.length})
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={shuffleCards}
            icon={Shuffle}
          >
            Shuffle
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetOrder}
            icon={RotateCcw}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            Card {currentCard + 1} of {flashcards.length} •
            {studyMode === 'random' ? ' Random Mode' : ' Sequential Mode'}
          </span>
          <span>
            Studied: {studiedCards.size}/{flashcards.length}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-black h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentCard + 1) / flashcards.length) * 100}%` }}
          />
        </div>

        <div className="w-full bg-gray-200 rounded-full h-1">
          <div
            className="bg-green-600 h-1 rounded-full transition-all duration-300"
            style={{ width: `${(studiedCards.size / flashcards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Flashcard */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-2xl">
          <div
            className={`flashcard ${isFlipped ? 'flipped' : ''}`}
            onClick={flipCard}
          >
            <div className="flashcard-inner cursor-pointer">
              {/* Front of card */}
              <div className="flashcard-front bg-white border-2 border-gray-200 hover:border-gray-300 transition-colors">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-2">Question</div>
                  <div className="text-lg font-medium text-black">
                    {currentCardData?.front || 'No front content'}
                  </div>
                  <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                    Click to flip
                  </div>
                </div>
              </div>

              {/* Back of card */}
              <div className="flashcard-back bg-gray-50 border-2 border-gray-200">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-2">Answer</div>
                  <div className="text-lg font-medium text-black">
                    {currentCardData?.back || 'No back content'}
                  </div>
                  <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                    Click to flip
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          size="lg"
          onClick={prevCard}
          disabled={currentCard === 0}
          icon={ChevronLeft}
        >
          Previous
        </Button>

        <Button
          variant={isFlipped ? "secondary" : "primary"}
          size="lg"
          onClick={flipCard}
          className="px-8"
        >
          {isFlipped ? 'Flip to Question' : 'Flip to Answer'}
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={nextCard}
          disabled={currentCard === flashcards.length - 1}
          icon={ChevronRight}
        >
          Next
        </Button>
      </div>

      {/* Card Navigation Dots */}
      {flashcards.length > 1 && (
        <div className="flex justify-center gap-2">
          {flashcards.map((_, index) => {
            const actualIndex = cardOrder[index]
            const isStudied = studiedCards.has(actualIndex)
            return (
              <button
                key={index}
                onClick={() => goToCard(index)}
                className={`
                  w-3 h-3 rounded-full transition-all duration-200
                  ${index === currentCard
                    ? 'bg-black scale-125'
                    : isStudied
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }
                `}
                title={`Card ${index + 1}${isStudied ? ' (Studied)' : ''}`}
              />
            )
          })}
        </div>
      )}

      {/* Study Statistics */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-black mb-4">Study Progress</h3>
        <div className="grid md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{flashcards.length}</div>
            <div className="text-sm text-gray-600">Total Cards</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{studiedCards.size}</div>
            <div className="text-sm text-gray-600">Studied</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{flashcards.length - studiedCards.size}</div>
            <div className="text-sm text-gray-600">Remaining</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {flashcards.length > 0 ? Math.round((studiedCards.size / flashcards.length) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Complete</div>
          </div>
        </div>
      </div>

      {/* All Cards List (Collapsed by default) */}
      <details className="bg-white border border-gray-200 rounded-lg">
        <summary className="p-4 cursor-pointer hover:bg-gray-50 font-medium text-black">
          View All Cards ({flashcards.length})
        </summary>
        <div className="border-t border-gray-200 p-4 space-y-4">
          {flashcards.map((card, index) => {
            const isStudied = studiedCards.has(index)
            return (
              <div
                key={index}
                className={`
                  border rounded-lg p-4 cursor-pointer transition-all duration-200
                  ${isStudied ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-gray-300'}
                `}
                onClick={() => goToCard(cardOrder.indexOf(index))}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="font-medium text-black mb-2">
                      {card.front}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {card.back}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isStudied && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Studied
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      #{index + 1}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </details>
    </div>
  )
}

export default FlashcardsSection
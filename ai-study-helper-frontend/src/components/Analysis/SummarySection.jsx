import React from 'react'
import { FileText, BookOpen } from 'lucide-react'

const SummarySection = ({ analysis }) => {
  if (!analysis?.summary && !analysis?.explanations) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No Summary Available
        </h3>
        <p className="text-gray-500">
          The analysis didn't generate a summary for this content.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Summary */}
      {analysis.summary && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-black">Summary</h2>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">
              {analysis.summary}
            </p>
          </div>
        </div>
      )}

      {/* Detailed Explanations */}
      {analysis.explanations && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-black">Detailed Explanations</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="prose prose-sm max-w-none">
              <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                {analysis.explanations}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Points */}
      {(analysis.summary || analysis.explanations) && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-xs">•</span>
            </div>
            <h2 className="text-xl font-semibold text-black">Key Points</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Summary Points */}
            {analysis.summary && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Main Concepts</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  {analysis.summary
                    .split(/[.!?]+/)
                    .filter(sentence => sentence.trim().length > 20)
                    .slice(0, 3)
                    .map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <span>{point.trim()}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Explanation Points */}
            {analysis.explanations && (
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">Important Details</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  {analysis.explanations
                    .split(/[.!?]+/)
                    .filter(sentence => sentence.trim().length > 20)
                    .slice(0, 3)
                    .map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                        <span>{point.trim()}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reading Time Estimate */}
      {(analysis.summary || analysis.explanations) && (
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Estimated reading time:</span>
            <span className="font-medium">
              {Math.ceil(
                ((analysis.summary || '').length + (analysis.explanations || '').length) / 200
              )} min
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SummarySection
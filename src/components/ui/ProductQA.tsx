// ─────────────────────────────────────────────────────────────
// PRODUCT Q&A COMPONENT
// ─────────────────────────────────────────────────────────────
// Product questions and answers section
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { cn } from "../../lib/utils/cn";

interface Question {
  id: string;
  question: string;
  answer?: string;
  author: string;
  createdAt: string;
  upvotes: number;
}

interface ProductQAProps {
  questions: Question[];
  onAskQuestion: (question: string) => void;
  onUpvote: (questionId: string) => void;
  className?: string;
}

export function ProductQA({ questions, onAskQuestion, onUpvote, className }: ProductQAProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setIsSubmitting(true);
    try {
      await onAskQuestion(newQuestion);
      setNewQuestion("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedQuestions = isExpanded ? questions : questions.slice(0, 3);

  return (
    <div className={cn("py-8 border-t", className)}>
      <h2 className="text-2xl font-bold mb-6">Questions & Answers</h2>

      {/* Ask Question Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Ask a question about this product..."
          className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <button
          type="submit"
          disabled={isSubmitting || !newQuestion.trim()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Submitting..." : "Ask Question"}
        </button>
      </form>

      {/* Questions List */}
      <div className="space-y-4">
        {displayedQuestions.map((question) => (
          <div key={question.id} className="border-b pb-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium">{question.question}</h3>
              <button
                onClick={() => onUpvote(question.id)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                {question.upvotes}
              </button>
            </div>
            {question.answer ? (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">{question.answer}</p>
                <p className="text-xs text-gray-500 mt-2">Answered by seller</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No answer yet</p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Asked by {question.author} • {new Date(question.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* Show More/Less */}
      {questions.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          {isExpanded ? "Show Less" : `Show All (${questions.length})`}
        </button>
      )}
    </div>
  );
}

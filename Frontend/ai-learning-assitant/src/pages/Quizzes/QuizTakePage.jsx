import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import quizService from '../../services/quizService';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';

const QuizTakePage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch Quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await quizService.getQuizById(quizId);
        setQuiz(response.data);
      } catch (error) {
        toast.error('Failed to fetch quiz.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  // Handle Option Change
  const handleOptionChange = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // Next Question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Previous Question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Submit Quiz
  const handleSubmitQuiz = async () => {
    setSubmitting(true);

    try {
      const formattedAnswers = Object.keys(selectedAnswers).map(
        (questionId) => {
          const question = quiz.questions.find(
            (q) => q._id === questionId
          );

          const questionIndex = quiz.questions.findIndex(
            (q) => q._id === questionId
          );

          const optionIndex = selectedAnswers[questionId];

          const selectedAnswer = question.options[optionIndex];

          return {
            questionIndex,
            selectedAnswer,
          };
        }
      );

      await quizService.submitQuiz(quizId, formattedAnswers);

      toast.success('Quiz submitted successfully!');

      navigate(`/quizzes/${quizId}/results`);
    } catch (error) {
      toast.error(error.message || 'Failed to submit quiz.');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading State
  if (loading) {
    return <Spinner />;
  }

  // Quiz Not Found
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div>
        <PageHeader title="Quiz" />

        <div className="flex items-center justify-center min-h-[300px]">
          <p className="text-lg text-slate-600">
            Quiz not found or has no questions.
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const isAnswered = Object.prototype.hasOwnProperty.call(
    selectedAnswers,
    currentQuestion._id
  );

  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div>
      <PageHeader title={quiz.title || 'Take Quiz'} />

      <div className="space-y-6">

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">
              Question {currentQuestionIndex + 1} of{' '}
              {quiz.questions.length}
            </span>

            <span className="text-sm font-medium text-slate-500">
              {answeredCount} answered
            </span>
          </div>

          <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) /
                    quiz.questions.length) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-6 mb-8">

          {/* Question Number */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl mb-6">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>

            <span className="text-sm font-semibold text-emerald-700">
              Question {currentQuestionIndex + 1}
            </span>
          </div>

          {/* Question */}
          <h3 className="text-lg font-semibold text-slate-900 mb-6 leading-relaxed">
            {currentQuestion.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected =
                selectedAnswers[currentQuestion._id] === index;

              return (
                <label
                  key={index}
                  className={`group relative flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white hover:shadow-md'
                  }`}
                >
                  {/* Radio Input */}
                  <input
                    type="radio"
                    name={`question-${currentQuestion._id}`}
                    value={index}
                    checked={isSelected}
                    onChange={() =>
                      handleOptionChange(
                        currentQuestion._id,
                        index
                      )
                    }
                    className="sr-only"
                  />

                  {/* Custom Radio Button */}
                  <div
                    className={`shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-slate-300 bg-white group-hover:border-emerald-400'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1"></div>
                    )}
                  </div>

                  {/* Option Text */}
                  <span
                    className={`ml-4 text-sm font-medium transition-colors duration-200 ${
                      isSelected
                        ? 'text-emerald-900'
                        : 'text-slate-700 group-hover:text-slate-900'
                    }`}
                  >
                    {option}
                  </span>

                  {/* Selected Checkmark */}
                  {isSelected && (
                    <CheckCircle2
                      className="ml-auto w-5 h-5 text-emerald-500"
                      strokeWidth={2.5}
                    />
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">

          {/* Previous */}
          <Button
            type="button"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0 || submitting}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {/* Next / Submit */}
          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <Button
              type="button"
              onClick={handleSubmitQuiz}
              disabled={submitting}
            >
              {submitting ? (
                'Submitting...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Submit Quiz
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNextQuestion}
              disabled={submitting}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Question Navigation */}
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {quiz.questions.map((question, index) => {
            const isCurrent = index === currentQuestionIndex;

            const isAnsweredQuestion =
              Object.prototype.hasOwnProperty.call(
                selectedAnswers,
                question._id
              );

            return (
              <button
                key={question._id || index}
                type="button"
                onClick={() => setCurrentQuestionIndex(index)}
                disabled={submitting}
                className={`w-8 h-8 rounded-lg font-semibold text-xs transition-all duration-200 ${
                  isCurrent
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                    : isAnsweredQuestion
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizTakePage;
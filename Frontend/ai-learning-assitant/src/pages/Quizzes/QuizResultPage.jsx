import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import quizService from "../../services/quizService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  Target,
  BookOpen,
} from "lucide-react";

const QuizResultPage = () => {
  const { quizId } = useParams();

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await quizService.getQuizResults(quizId);
        setResults(data);
      } catch (error) {
        toast.error("Failed to fetch quiz results.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizId]);

  // Loading
  if (loading) {
    return <Spinner />;
  }

  // No results
  if (!results || !results.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
          <XCircle
            className="w-8 h-8 text-rose-500"
            strokeWidth={2}
          />
        </div>

        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          Quiz Results Not Found
        </h2>

        <p className="text-sm text-slate-500">
          We could not find the results for this quiz.
        </p>
      </div>
    );
  }

  const {
    data: { quiz, results: detailedResults },
  } = results;

  const score = quiz.score || 0;

  const totalQuestions = detailedResults.length;

  const correctAnswers = detailedResults.filter(
    (result) => result.isCorrect
  ).length;

  const incorrectAnswers = totalQuestions - correctAnswers;

  // Score Color
  const getScoreColor = (score) => {
    if (score >= 80) {
      return "from-emerald-500 to-teal-500";
    }

    if (score >= 60) {
      return "from-amber-500 to-orange-500";
    }

    return "from-rose-500 to-red-500";
  };

  // Score Message
  const getScoreMessage = (score) => {
    if (score >= 90) return "Outstanding!";
    if (score >= 80) return "Great job!";
    if (score >= 70) return "Good work!";
    if (score >= 60) return "Not bad!";
    return "Keep practicing!";
  };

  return (
    <div className="space-y-8">

      {/* Back Button */}
      <Link
        to={`/documents/${quiz.document?._id}`}
        className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors duration-200"
      >
        <ArrowLeft
          className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200"
          strokeWidth={2}
        />
        Back to Document
      </Link>

      {/* Page Header */}
      <PageHeader
        title={`${quiz.title || "Quiz"} Results`}
      />

      {/* Score Card */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-200/50">

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

          {/* Score */}
          <div className="text-center lg:text-left">
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
              Your Score
            </p>

            <div
              className={`inline-block text-5xl font-bold bg-gradient-to-r ${getScoreColor(
                score
              )} bg-clip-text text-transparent mb-2`}
            >
              {score}%
            </div>

            <p className="text-lg font-medium text-slate-700">
              {getScoreMessage(score)}
            </p>
          </div>

          {/* Trophy */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 flex items-center justify-center">
            <Trophy
              className="w-10 h-10 text-emerald-500"
              strokeWidth={2}
            />
          </div>

        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-200">

          {/* Total Questions */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <BookOpen
                className="w-5 h-5 text-blue-600"
                strokeWidth={2}
              />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Total Questions
              </p>

              <p className="text-lg font-bold text-slate-900">
                {totalQuestions}
              </p>
            </div>
          </div>

          {/* Correct */}
          <div className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle2
                className="w-5 h-5 text-emerald-600"
                strokeWidth={2}
              />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Correct Answers
              </p>

              <p className="text-lg font-bold text-emerald-700">
                {correctAnswers}
              </p>
            </div>
          </div>

          {/* Incorrect */}
          <div className="flex items-center gap-3 p-4 bg-rose-50/50 rounded-xl border border-rose-200">
            <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
              <XCircle
                className="w-5 h-5 text-rose-600"
                strokeWidth={2}
              />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Incorrect Answers
              </p>

              <p className="text-lg font-bold text-rose-700">
                {incorrectAnswers}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Questions Review */}
      <div className="space-y-5">

        <div>
          <h3 className="text-xl font-semibold text-slate-900">
            Questions Review
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Review your answers and correct solutions.
          </p>
        </div>

        {detailedResults.map((result, index) => {

          // Find user's selected answer
          const userAnswerIndex = result.options.findIndex(
            (option) => option === result.selectedAnswer
          );

          // Find correct answer
          const correctAnswerIndex = result.options.findIndex(
            (option) => option === result.correctAnswer
          );

          const isCorrect = result.isCorrect;

          return (
            <div
              key={result._id || index}
              className="bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-2xl p-6 shadow-lg shadow-slate-200/50"
            >

              {/* Question Header */}
              <div className="flex items-start justify-between gap-4 mb-5">

                <div className="flex-1">

                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg mb-3">
                    <span className="text-xs font-semibold text-slate-600">
                      Question {index + 1}
                    </span>
                  </div>

                  <h4 className="text-base font-semibold text-slate-900 leading-relaxed">
                    {result.question}
                  </h4>

                </div>

                {/* Correct / Incorrect Icon */}
                <div
                  className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    isCorrect
                      ? "bg-emerald-50 border-2 border-emerald-200"
                      : "bg-rose-50 border-2 border-rose-200"
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2
                      className="w-5 h-5 text-emerald-600"
                      strokeWidth={2.5}
                    />
                  ) : (
                    <XCircle
                      className="w-5 h-5 text-rose-600"
                      strokeWidth={2.5}
                    />
                  )}
                </div>

              </div>

              {/* Options */}
              <div className="space-y-3 mb-5">

                {result.options.map((option, optionIndex) => {

                  const isCorrectOption =
                    optionIndex === correctAnswerIndex;

                  const isUserAnswer =
                    optionIndex === userAnswerIndex;

                  const isWrongAnswer =
                    isUserAnswer && !isCorrect;

                  return (
                    <div
                      key={optionIndex}
                      className={`flex items-center justify-between gap-3 p-4 rounded-xl border-2 transition-all ${
                        isCorrectOption
                          ? "bg-emerald-50 border-emerald-300"
                          : isWrongAnswer
                          ? "bg-rose-50 border-rose-300"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >

                      <div className="flex items-center gap-3">

                        {/* Option Number */}
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isCorrectOption
                              ? "bg-emerald-100 text-emerald-700"
                              : isWrongAnswer
                              ? "bg-rose-100 text-rose-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {String.fromCharCode(65 + optionIndex)}
                        </div>

                        <span
                          className={`text-sm font-medium ${
                            isCorrectOption
                              ? "text-emerald-900"
                              : isWrongAnswer
                              ? "text-rose-900"
                              : "text-slate-700"
                          }`}
                        >
                          {option}
                        </span>

                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2">

                        {isCorrectOption && (
                          <span className="text-xs font-semibold text-emerald-700">
                            Correct Answer
                          </span>
                        )}

                        {isWrongAnswer && (
                          <span className="text-xs font-semibold text-rose-700">
                            Your Answer
                          </span>
                        )}

                        {isUserAnswer && isCorrect && (
                          <span className="text-xs font-semibold text-emerald-700">
                            Your Answer
                          </span>
                        )}

                      </div>

                    </div>
                  );
                })}

              </div>

              {/* Explanation */}
              {result.explanation && (
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl">

                  <div className="flex items-center gap-2 mb-2">
                    <Target
                      className="w-4 h-4 text-blue-600"
                      strokeWidth={2}
                    />

                    <span className="text-sm font-semibold text-blue-900">
                      Explanation
                    </span>
                  </div>

                  <p className="text-sm text-blue-800 leading-relaxed">
                    {result.explanation}
                  </p>

                </div>
              )}

            </div>
          );
        })}

      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-4">

        <Link
          to={`/documents/${quiz.document?._id}`}
          className="inline-flex items-center gap-2 px-6 h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25"
        >
          <ArrowLeft
            className="w-4 h-4"
            strokeWidth={2.5}
          />

          Back to Document
        </Link>

      </div>

    </div>
  );
};

export default QuizResultPage;
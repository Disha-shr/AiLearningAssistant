import React, { useState, useEffect } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArrowLeft,
  Brain,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";

import flashcardService from "../../services/flashcardService";
import aiService from "../../services/aiService";
import Spinner from "../common/Spinner";
import Modal from "../common/Modal";
import Flashcard from "./Flashcard";

const FlashcardManager = ({ documentId }) => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [setToDelete, setSetToDelete] = useState(null);

  // Fetch Flashcard Sets
  const fetchFlashcardSets = async () => {
    setLoading(true);

    try {
      const response =
        await flashcardService.getFlashcardsForDocument(documentId);

      setFlashcardSets(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch flashcard sets.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch flashcards when documentId changes
  useEffect(() => {
    if (documentId) {
      fetchFlashcardSets();
    }
  }, [documentId]);

  // Generate Flashcards
  const handleGenerateFlashcards = async () => {
    setGenerating(true);

    try {
      await aiService.generateFlashcards(documentId);

      toast.success("Flashcards generated successfully!");

      await fetchFlashcardSets();
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate flashcards.");
    } finally {
      setGenerating(false);
    }
  };

  // Next Card
  const handleNextCard = () => {
    if (selectedSet && selectedSet.cards.length > 0) {
      handleReview(currentCardIndex);

      setCurrentCardIndex(
        (prevIndex) =>
          (prevIndex + 1) % selectedSet.cards.length
      );
    }
  };

  // Previous Card
  const handlePrevCard = () => {
    if (selectedSet && selectedSet.cards.length > 0) {
      handleReview(currentCardIndex);

      setCurrentCardIndex(
        (prevIndex) =>
          (prevIndex - 1 + selectedSet.cards.length) %
          selectedSet.cards.length
      );
    }
  };

  // Review Flashcard
  const handleReview = async (index) => {
    const currentCard = selectedSet?.cards[index];

    if (!currentCard) return;

    try {
      await flashcardService.reviewFlashcard(
        currentCard._id,
        index
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to review flashcard.");
    }
  };

  // Toggle Star
  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId);

      const updatedSets = flashcardSets.map((set) => {
        if (set._id === selectedSet?._id) {
          const updatedCards = set.cards.map((card) =>
            card._id === cardId
              ? {
                  ...card,
                  isStarred: !card.isStarred,
                }
              : card
          );

          return {
            ...set,
            cards: updatedCards,
          };
        }

        return set;
      });

      setFlashcardSets(updatedSets);

      const updatedSelectedSet = updatedSets.find(
        (set) => set._id === selectedSet?._id
      );

      setSelectedSet(updatedSelectedSet);

      toast.success("Flashcard starred status updated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update star status.");
    }
  };

  // Ask for delete confirmation
  const handleDeleteRequest = (e, set) => {
    e.stopPropagation();

    setSetToDelete(set);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!setToDelete) return;

    setDeleting(true);

    try {
      await flashcardService.deleteFlashcardSet(setToDelete._id);

      toast.success("Flashcard set deleted successfully!");

      setIsDeleteModalOpen(false);
      setSetToDelete(null);

      // If deleted set was selected, go back to list
      if (selectedSet?._id === setToDelete._id) {
        setSelectedSet(null);
      }

      await fetchFlashcardSets();
    } catch (error) {
      console.error(error);
      toast.error(
        error.message || "Failed to delete flashcard set."
      );
    } finally {
      setDeleting(false);
    }
  };

  // Select Flashcard Set
  const handleSelectSet = (set) => {
    setSelectedSet(set);
    setCurrentCardIndex(0);
  };

  // Render Flashcard Viewer
  const renderFlashcardViewer = () => {
    const currentCard = selectedSet?.cards[currentCardIndex];

    if (!currentCard) {
      return null;
    }

    return (
      <div className="space-y-8">

        {/* Back Button */}
        <button
          type="button"
          onClick={() => setSelectedSet(null)}
          className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors duration-200"
        >
          <ArrowLeft
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200"
            strokeWidth={2}
          />
          Back to Sets
        </button>

        {/* Flashcard Display */}
        <div className="flex flex-col items-center space-y-8">

          <div className="w-full max-w-2xl">
            <Flashcard
              flashcard={currentCard}
              onToggleStar={handleToggleStar}
            />
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-6">

            {/* Previous */}
            <button
              type="button"
              onClick={handlePrevCard}
              disabled={selectedSet.cards.length <= 1}
              className="group flex items-center gap-2 px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft
                className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200"
                strokeWidth={2.5}
              />
              Previous
            </button>

            {/* Card Number */}
            <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-sm font-semibold text-slate-700">
                {currentCardIndex + 1}
                <span className="text-slate-400 font-normal">
                  {" "}
                  /{" "}
                </span>
                {selectedSet.cards.length}
              </span>
            </div>

            {/* Next */}
            <button
              type="button"
              onClick={handleNextCard}
              disabled={selectedSet.cards.length <= 1}
              className="group flex items-center gap-2 px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next

              <ChevronRight
                className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200"
                strokeWidth={2.5}
              />
            </button>

          </div>
        </div>
      </div>
    );
  };

  // Render Flashcard Sets
  const renderSetList = () => {
    // Loading
    if (loading) {
      return <Spinner />;
    }

    // No Flashcards
    if (flashcardSets.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">

          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5">
            <Brain
              className="w-8 h-8 text-emerald-500"
              strokeWidth={2}
            />
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No Flashcards Yet
          </h3>

          <p className="text-sm text-slate-500 max-w-md mb-6">
            Generate flashcards from your document to start learning
            and reinforce your knowledge.
          </p>

          <button
            type="button"
            onClick={handleGenerateFlashcards}
            disabled={generating}
            className="inline-flex items-center gap-2 px-5 h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus
                  className="w-4 h-4"
                  strokeWidth={2.5}
                />
                Generate Flashcards
              </>
            )}
          </button>

        </div>
      );
    }

    return (
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">

          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Your Flashcard Sets
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              {flashcardSets.length}{" "}
              {flashcardSets.length === 1 ? "set" : "sets"} available
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateFlashcards}
            disabled={generating}
            className="group inline-flex items-center gap-2 px-5 h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus
                  className="w-4 h-4"
                  strokeWidth={2.5}
                />
                Generate New Set
              </>
            )}
          </button>

        </div>

        {/* Flashcard Sets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {flashcardSets.map((set) => (
            <div
              key={set._id}
              onClick={() => handleSelectSet(set)}
              className="group relative bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-emerald-300 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-emerald-100"
            >

              {/* Delete Button */}
              <button
                type="button"
                onClick={(e) => handleDeleteRequest(e, set)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <Trash2
                  className="w-4 h-4"
                  strokeWidth={2}
                />
              </button>

              {/* Set Content */}
              <div className="space-y-4">

                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100">
                  <Brain
                    className="w-6 h-6 text-emerald-600"
                    strokeWidth={2}
                  />
                </div>

                <div>
                  <h4 className="text-base font-semibold text-slate-900 mb-1">
                    Flashcard Set
                  </h4>

                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Created{" "}
                    {moment(set.createdAt).format("MMM D, YYYY")}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <span className="text-sm font-semibold text-emerald-700">
                      {set.cards.length}{" "}
                      {set.cards.length === 1 ? "card" : "cards"}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          ))}

        </div>
      </div>
    );
  };

  return (
    <>
      {selectedSet
        ? renderFlashcardViewer()
        : renderSetList()}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Flashcard Set?"
      >
        <div className="space-y-6">

          <p className="text-sm text-slate-600">
            Are you sure you want to delete this flashcard set?
            This action cannot be undone and all cards will be
            permanently removed.
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
              className="px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="px-5 h-11 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-rose-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete Set"
              )}
            </button>

          </div>
        </div>
      </Modal>
    </>
  );
};

export default FlashcardManager;

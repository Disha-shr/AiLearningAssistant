export const BASE_URL = "http://localhost:8000";

export const API_PATHS ={
    AUTH : {
        REGISTER: "/api/auth/register",
        LOGIN: "/api/auth/login",
        GET_PROFILE: "/api/auth/profile",
        CHANGE_PASSWORD: "/api/auth/change-password",
    },

    DOCUMENTS: {
        UPLOAD: "/api/documents/upload",
        GET_DOCUMENTS: "/api/document",
        GET_DOCUMENT_BY_ID: (id) => `/api/documents/$(id)`,
        UPDATE_DOCUMENT: (id) => `/api/doucments/$(id)`,
        DELETE_DOCUMENT: (id) => `/api/documents/$(id)`,
    },

    AI: {
        GENRATE_FLASHCARDS: "/api/ai/generate-flashcards",
        GENERATE_QUIZ: "/api/ai/generate-quiz",
        GENERATE_SUMMARY: "/api/ai/generate-summary",
        CHAT: "/api/ai/chat",
        EXPLAIN_CONCEPT: "/api/ai/explain-concept",
        GET_CHAT_HISTORY: (documentID) => `/api/ai/chat-history/$(documentId)`,
    },

    FLASHCARDS: {
        GET_ALL_FLASHCARDS_SETS: "/api/flashcards",
        GET_FLASHCARDS_FOR_DOC: (documentId) => `/api/ai/chat-history/${documentId}`,
        REVIEW_FLASHCARDS: (cardId) => `/api/flashcards/$(cardId)/review`,
        TOGGLE_STAR: (cardId) => `/api/flashcards/${cardId}/star`,
        DELETE_FLASHCARD_SET: (id) => `/api/flashcards/${id}`,
    },

    Quizzes: {
        GET_QUIZZES_FOR_DOC: (documentId) => `/api/quizzes/${documentId}`,
        GET_QUIZ_BY_ID: (id) => `/api/quizzes/${id}/submit`,
        GET_QUIZ_RESUKTS: (id) => `/api/quizzes/${id}/results`,
        DELETE_QUIZ: (id) => `/api/quizzes/${id}`,
    },

    PROGRESS: {
        GET_DASHBIARD: "/api/progress/dashboard",
    },
};
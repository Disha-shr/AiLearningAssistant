import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import { ArrowLeft, ExternalLink } from "lucide-react";
import PageHeader from "../../components/common/pageHeader";
import Tabs from "../../components/common/Tabs";

import ChatInterface from "../../components/chat/ChatInterface";
import AIActions from "../../components/ai/AIActions";
import FlashcardManager from "../../components/flashcards/FlashcardManager";
import QuizManager from "../../components/quizzes/QuizManager";

const DocumentsDetailsPage = () => {
    const { id } = useParams();

    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Content");

    useEffect(() => {
        const fetchDocumentDetails = async () => {
            try {
                const data = await documentService.getDocumentById(id);

                console.log("Document details:", data);

                setDocument(data);
            } catch (error) {
                console.error("Failed to fetch document details:", error);
                toast.error("Failed to fetch document details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchDocumentDetails();
        }
    }, [id]);

    // Get the PDF URL
    const getPdfUrl = () => {
        // Support both possible response structures
        const filePath =
            document?.filePath || document?.data?.filePath;

        console.log("PDF filePath:", filePath);

        if (!filePath) {
            return null;
        }

        // Backend already returns complete URL
        if (
            filePath.startsWith("http://") ||
            filePath.startsWith("https://")
        ) {
            return filePath;
        }

        const baseUrl =
            import.meta.env.VITE_API_URL || "http://localhost:8000";

        return `${baseUrl}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
    };

    const renderContent = () => {
        if (loading) {
            return <Spinner />;
        }

        const pdfUrl = getPdfUrl();

        if (!pdfUrl) {
            return (
                <div className="text-center p-8">
                    PDF not available
                </div>
            );
        }

        return (
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-300">
                    <span className="text-sm font-medium text-gray-700">
                        Document Viewer
                    </span>

                    <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                        <ExternalLink size={16} />
                        Open in new tab
                    </a>
                </div>

                <div className="bg-gray-100 p-1">
                    <iframe
                        src={pdfUrl}
                        className="w-full h-[70vh] bg-white rounded border border-gray-300"
                        title="PDF Viewer"
                        frameBorder="0"
                        style={{
                            colorScheme: "light",
                        }}
                    />
                </div>
            </div>
        );
    };

    const renderChat = () => {
        return <ChatInterface />;
    };

   const renderAIActions = () => {
  return <AIActions documentId={id} />;
};

    const renderFlashcardsTab = () => {
        return <FlashcardManager documentId={id} />;
    };

    const renderQuizzesTab = () => {
        return <QuizManager documentId={id} />;
    };

    const tabs = [
        {
            name: "Content",
            label: "Content",
            content: renderContent(),
        },
        {
            name: "Chat",
            label: "Chat",
            content: renderChat(),
        },
        {
            name: "AI Actions",
            label: "AI Actions",
            content: renderAIActions(),
        },
        {
            name: "Flashcards",
            label: "Flashcards",
            content: renderFlashcardsTab(),
        },
        {
            name: "Quizzes",
            label: "Quizzes",
            content: renderQuizzesTab(),
        },
    ];

    if (loading) {
        return <Spinner />;
    }

    if (!document) {
        return (
            <div className="text-center p-8">
                Document not found.
            </div>
        );
    }

    return (
        <div>
            <div className="mb-4">
                <Link
                    to="/documents"
                    className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Documents
                </Link>
            </div>

            <PageHeader
                title={document?.title || document?.data?.title}
            />

            <Tabs
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
        </div>
    );
};

export default DocumentsDetailsPage;
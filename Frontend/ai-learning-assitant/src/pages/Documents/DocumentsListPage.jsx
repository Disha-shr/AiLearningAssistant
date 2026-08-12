import React, { useState, useEffect } from "react";
import { Plus, Upload, Trash2, FileText, X } from "lucide-react";
import toast from "react-hot-toast";

import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/button";
import DocumentCard from "../../components/documents/DocumentCard";

const DocumentListPage = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Upload modal state
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadTitle, setUploadTitle] = useState("");
    const [uploading, setUploading] = useState(false);

    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Fetch documents
    const fetchDocuments = async () => {
        try {
            const data = await documentService.getDocuments();
            setDocuments(data);
        } catch (error) {
            toast.error("Failed to fetch documents.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    // File select
    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setUploadFile(file);
            setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
    };

    // Upload document
    const handleUpload = async (e) => {
        e.preventDefault();

        if (!uploadFile || !uploadTitle) {
            toast.error("Please provide a title and select a file");
            return;
        }

        setUploading(true);

        const formData = new FormData();
        formData.append("file", uploadFile);
        formData.append("title", uploadTitle);

        try {
            await documentService.uploadDocument(formData);

            toast.success("Document uploaded successfully!");

            setIsUploadModalOpen(false);
            setUploadFile(null);
            setUploadTitle("");

            setLoading(true);
            await fetchDocuments();
        } catch (error) {
            toast.error(error.message || "Failed to upload document.");
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    // Open delete modal
    const handleDeleteRequest = (document) => {
        setSelectedDoc(document);
        setIsDeleteModalOpen(true);
    };

    // Confirm delete
    const handleConfirmDelete = async () => {
        if (!selectedDoc) {
            return;
        }

        setDeleting(true);

        try {
            await documentService.deleteDocument(selectedDoc._id);

            toast.success("Document deleted successfully!");

            setDocuments((prevDocuments) =>
                prevDocuments.filter(
                    (doc) => doc._id !== selectedDoc._id
                )
            );

            setIsDeleteModalOpen(false);
            setSelectedDoc(null);
        } catch (error) {
            toast.error(error.message || "Failed to delete document.");
            console.error(error);
        } finally {
            setDeleting(false);
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center min-h-[400px]">
                    <Spinner />
                </div>
            );
        }

        if (documents.length === 0) {
            return (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center max-w-md">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 shadow-lg shadow-slate-200/50 mb-6">
                            <FileText
                                className="w-10 h-10 text-slate-400"
                                strokeWidth={1.5}
                            />
                        </div>

                        <h3 className="text-xl font-medium text-slate-900 mb-2">
                            No Documents Yet
                        </h3>

                        <p className="text-sm text-slate-500 mb-6">
                            Get started by uploading your first PDF
                            document to begin learning.
                        </p>

                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-[0.98]"
                        >
                            <Plus
                                className="w-4 h-4"
                                strokeWidth={2.5}
                            />
                            Upload Document
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {documents.map((doc) => (
                    <DocumentCard
                        key={doc._id}
                        document={doc}
                        onDelete={handleDeleteRequest}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen">
            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

            <div className="relative max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">
                            My Documents
                        </h1>

                        <p className="text-slate-500 text-sm">
                            Manage and organize your learning materials
                        </p>
                    </div>

                    {documents.length > 0 && (
                        <Button
                            onClick={() => setIsUploadModalOpen(true)}
                        >
                            <Plus
                                className="w-4 h-4"
                                strokeWidth={2.5}
                            />
                            Upload Document
                        </Button>
                    )}
                </div>

                {renderContent()}
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-2xl p-8">

                        <button
                            onClick={() =>
                                setIsUploadModalOpen(false)
                            }
                            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-xl font-medium text-slate-900">
                                Upload New Document
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Add a PDF document to your library
                            </p>
                        </div>

                        <form
                            onSubmit={handleUpload}
                            className="space-y-5"
                        >
                            {/* Title */}
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                    Document Title
                                </label>

                                <input
                                    type="text"
                                    value={uploadTitle}
                                    onChange={(e) =>
                                        setUploadTitle(e.target.value)
                                    }
                                    required
                                    className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white"
                                    placeholder="e.g., React Interview Prep"
                                />
                            </div>

                            {/* File */}
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                    PDF File
                                </label>

                                <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50">
                                    <input
                                        id="file-upload"
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={handleFileChange}
                                        accept=".pdf"
                                    />

                                    <div className="flex flex-col items-center justify-center py-10 px-6">
                                        <div className="w-14 h-14 rounded-xl bg-linear-to-r from-emerald-100 to-teal-100 flex items-center justify-center mb-4">
                                            <Upload
                                                className="w-7 h-7 text-emerald-600"
                                                strokeWidth={2}
                                            />
                                        </div>

                                        <p className="text-sm font-medium text-slate-700 mb-1">
                                            {uploadFile ? (
                                                <span className="text-emerald-600">
                                                    {uploadFile.name}
                                                </span>
                                            ) : (
                                                <>
                                                    <span className="text-emerald-600">
                                                        Click to upload
                                                    </span>{" "}
                                                    or drag and drop
                                                </>
                                            )}
                                        </p>

                                        <p className="text-xs text-slate-500">
                                            PDF up to 10MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsUploadModalOpen(false)
                                    }
                                    disabled={uploading}
                                    className="flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 h-11 px-4 bg-linear-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-xl shadow-lg disabled:opacity-50"
                                >
                                    {uploading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Uploading...
                                        </span>
                                    ) : (
                                        "Upload"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-2xl p-8">

                        <button
                            onClick={() => {
                                setIsDeleteModalOpen(false);
                                setSelectedDoc(null);
                            }}
                            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6">
                            <div className="w-12 h-12 rounded-xl bg-linear-to-r from-red-100 to-red-200 flex items-center justify-center mb-4">
                                <Trash2
                                    className="w-6 h-6 text-red-600"
                                    strokeWidth={2}
                                />
                            </div>

                            <h2 className="text-xl font-medium text-slate-900">
                                Confirm Deletion
                            </h2>
                        </div>

                        <p className="text-sm text-slate-600 mb-6">
                            Are you sure you want to delete the document:{" "}
                            <span className="font-semibold text-slate-900">
                                {selectedDoc?.title}
                            </span>
                            ? This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSelectedDoc(null);
                                }}
                                disabled={deleting}
                                className="flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                                className="flex-1 h-11 px-4 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl shadow-lg disabled:opacity-50"
                            >
                                {deleting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Deleting...
                                    </span>
                                ) : (
                                    "Delete"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentListPage;
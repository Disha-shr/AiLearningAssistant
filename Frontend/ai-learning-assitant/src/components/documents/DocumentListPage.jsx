import React, { useState, useEffect } from "react";
import { Plus, Upload, Trash2, FileText, X} from "lucide-react";
import toast from "react-hot-toast";

import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";
import Button from "../common/button";
import DocumentCard from "./DocumentCard";

const DocumentListPage = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    // State for upload model
    const [isUploadModelOpen, setIsUploadOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadTitle, setUploadTitle] = useState("");
    const [uploading, setUploading] = useState(null);

    const fetchDocuments = async() => {
        try{
            const data = await documentService.getDocuments();
            setDocuments(data);
        }catch(error) {
            toast.error("Failed to fetch documents.");
            console.error(error);
        }finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if(file) {
            setUploadFile(file);
            setUploadTitle(file.name.replace(/\.[^/.]+$/,""));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if(!uploadFile || !uploadTitle) {
            toast.error("Please provide a title and select a file");
            return;
        }
        setUploading(true);
        const formData = new FormData();
        formData.append("file",uploadFile);

        try{
            await documentService.uploadDocument(formData);
            toast.success("Document uploaded successfully!");
            setISIploadModalOpen(false);
            setUploadFile(null);
            setUploadTitle("");
            setLoading(true);
            fetchDocuments();
        }catch(error) {
            toast.error(error.message || "Failed to delete document.");
        }finally{
            setDeleting(false);
        }
    };

    const renderContent = () => {
      if(loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner/>
            </div>
        );
      }  

      if(documents.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 shadow-lg shadow-slate-200/50 mb-6">
                        <FileText
                        className="w-10 h-10 text-slate-400"
                        strokeWidth={1.5}
                        />
                    </div>
                    <h3 className="text-xl font-slate-500 mb-6">
                        No Documents Yet
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">
                        Get started by uploading your first PDF document to begin learning.
                    </p>
                    <button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-50/30 active:scale-[0.98]"
                    >
                        <Plus className="w-4 h-4" strokeWidth={2.5} />
                        Upload Document
                    </button>
                </div>
            </div>
        );
      }

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {documents?.map((doc) => (
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
            {/* Subtle background pattern */ }
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px, transparent_1px,transparent_1px)] bg-size-[16px_16px] opacity-30 pointer-events-none"/>
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
                    {documents.length> 0 && (
                        <Button onClick={() => setIsUploadModalOpen(true)}>
                            <Plus className="w-4 h-4" strokeWidth={2.5} />
                            Upload Document
                        </Button>
                    )}
                </div>

                    {renderContent()}
            </div>

            <div className="">
                <div className="">
                    {/* }
                </div>
            </div>


        </div>
    )
}
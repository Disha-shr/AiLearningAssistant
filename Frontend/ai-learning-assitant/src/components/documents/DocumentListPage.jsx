import React, { useState, useEffect } from "react";
import { Plus, Upload, Trash2, FileText, X} from "lucide-react";
import toast from "react-hot-toast";

import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";

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
        return <div> renderContent </div>
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

        </div>
    )
}
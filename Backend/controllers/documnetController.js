import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import fs from 'fs/promises';
import mongoose from 'mongoose';

//desc Upload PDF document
// @route POST /api/doucment/upload
//@access Private

export const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a PDF file',
                statusCode: 400
            });
        }

        const { title } = req.body;

        if (!title) {
            //Delete uploaded file if no title provided
            await fs.unlink(req.file.path);

            return res.status(400).json({
                success: false,
                error: 'Please provide a document title',
                statusCode: 400
            });
        }

        // construct the url for the uploaded file
        const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
        const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

        //create document record
        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath: fileUrl, //store the URL instead of the local path
            fileSize: req.file.size,
            status: 'processing'
        });

        //process PDF in background (in production, use a queue like Bull)
        processPDF(document._id, req.file.path).catch(err => {
            console.error('PDF processing error:', err);
        });

        res.status(201).json({
            success: true,
            data: document,
            message: 'Document uploaded successfully. Processing in progress...'
        });

    } catch (error) {

        // clean up file on error
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => {});
        }

        next(error);
    }
};

// Helper function to process PDF

const processPDF = async (documentId, filePath) => {

    try {

        const { text } = await extractTextFromPDF(filePath);

        // Create chunks
        const chunks = chunkText(text, 500, 50);

        // update document
        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            chunks: chunks,
            status: 'ready'
        });

        console.log(`Document ${documentId} processed successfully`);

    } catch (error) {

        console.error(`Error processing document ${documentId}:`, error);

        await Document.findByIdAndUpdate(documentId, {
            status: 'failed'
        });
    }
};


//@desc Get all user documents
//@route Get/api/documents
//@access Private

export const getDocuments = async (req, res, next) => {

    try {

        const documents = await Document.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                $lookup: {
                    from: 'flashcards',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'flashcardSets'
                }
            },
            {
                $lookup: {
                    from: 'quizzes',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'quizzes'
                }
            },
            {
                $addFields: {
                    flashcardCount: { $size: '$flashcardSets' },
                    quizCount: { $size: '$quizzes' }
                }
            },
            {
                $project: {
                    extractedText: 0,
                    chunks: 0,
                    flashcardSets: 0,
                    quizzes: 0
                }
            },
            {
                $sort: { uploadDate: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });

    } catch (error) {
        next(error);
    }
};

//@desc get single document with chunks
// @route get/api/docuemnts/:id
//@access privat

export const getDocument = async (req, res, next) => {

    try {

    } catch (error) {
        next(error);
    }
};

//@desc delete document
//@route delete/api/docuents/:id
//@access privat

export const deleteDocument = async (req, res, next) => {

    try {

    } catch (error) {
        next(error);
    }
};

//@desc update document
//@route put/api/docuents/:id
//@access privat

export const updateDocument = async (req, res, next) => {

    try {

    } catch (error) {
        next(error);
    }
};
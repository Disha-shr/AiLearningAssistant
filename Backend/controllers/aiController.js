import Document  from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from '../models/ChatHistory.js';
import * as geminiService from '../utils/geminiServices.js';
import { chunkText, findRelevantChunks, findRelevantChunks } from "../utils/textChunker.js";


//@desc Generate flashcards from document
//@route POST /api/ai/generate-flashcards
//@access Private

export const generateFlashcards = async (req, res, next ) => {
    try{
        const { documentId, count = 10 } = req.body;

        if(!documentId) {
            return res.statu(400).json({
                success: false,
                error: 'please provide documentId',
                statusCode: 400});
            }

            const document = await Document.findOne({
                _id: documentId,
                userId: req.user._id,
                status: 'ready'
            });

            if(!document) {
                return res.status(404).json({
                    success: false,
                    error: 'Document not found or not ready',
                    statusCode: 404
                });
            }

            // Generate falsh cards usubg Gemini
            const cards = await geminiService.genrateFlashcards(
                document.extractedText,
                parseInt(count)
            );

            // save to database
            const flashcardSet = await Flashcard.create({
                userId: req.user._id,
                documentId: document._id,
                cards: card.map(card => ({
                    question: card.question,
                    answer: card.answer,
                    difficuly: card.difficulty,
                    reviewCount: 0,
                    ifStarred: false
                })) 
            });
            
            res.status(201).json({
                success: true,
                data: flashcardSet,
                message: 'Flashcards generated successfully'
            });
            }
    catch(error) {
        next(error);
    }
};


//@desc Generate Quiz from document
//@route POST /api/ai/generate-quiz
//@access Private

export const generateQuiz = async (req, res, next ) => {
    try{
        const { documentId, numQuestions = 5, titile} = req.body;

        if(!documentId) {
            return res.status(400).json ({
                success: false,
                error: 'Please provide documentId',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if(!document) {
            return res.status(400).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });

            //Generate quiz using Gemini
            const questions = await geminiService.generateQuiz(
                document.extractedText,
                parseInt(numQuestions)
            );

            //save to database 
            const quiz = await Quiz.create({
                userId: req.user._id,
                documentId: document._id,
                title: title || `${document.title}-Quiz`,
                questions: questions,
                totalQuestions: questions.length,
                userAnswers: [],
                score: 0
            });

            res.status(201).json({
                success: true,
                data: quiz,
                message: 'Quiz generated successfully'
            });
        }
    }
    catch(error) {
        next(error);
    }
};

//@desc Generate document summary
//@route POST /api/ai/generate-summary
//@access Private

export const generateSummary = async (req, res, next ) => {
    try{
        const { documentId} = req.body;

        if(!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if(!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        //Generate summary using Gemini
        const summary = await geminiService.generateSummary[document.extractedText];

        res.status(200).json({
            success: true,
            data: {
                documentId: document._id,
                title: document.title,
                summary
            },
            message: 'Summary generated successfully'
        });
    }
    catch(error) {
        next(error);
    }
};

//@desc Chat with document
//@route POST /api/ai/chat
//@access Private

export const chat = async (req, res, next ) => {
    try{
        const { documentId, question } =req.body;

        if(!documentId || !question ) {
            return res.status(400).json({
                success: false,
                error: 'Please Provide documentId and question',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if(!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        //Find relevant chunks
        const findRelevantChunks = findRelevantChunks(document.chunks, question, 3);
        const chunkIndices = findRelevantChunks.map(c => c.chunkIndex);

        //get or create chat history
        let chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: document._id
        });

        if(!chatHistory) {
            chatHistory = await ChatHistory.create({
                userId: req.user._id,
                documentId: document._id,
                message: []
            });

            // Generate response using Gemini
            const answer = await geminiService.chatWithContext(question, relevantChunks);

            //save conversation
            chatHistory.message.push({
                role: 'user',
                content: question,
                timestamp: new Date(),
                relevantChunks: []
            },
            {
                role: 'assistant',
                content: answer,
                timestamp: new Date(),
                relevantChunks: chunkIndices
            }
        );
        await  chatHistory.save();

        res.status(200).json({
            success: true,
            data: {
                questions,
                answer,
                relevantChunks: chunkIndices,
                chatHistoryId: chatHistory._id
            },
            message: 'Response generated successfully'
        });
    }
    }
    catch(error) {
        next(error);
    }
};


//@desc explain concept from document
//@route POST /api/ai/explain-concept
//@access Private

export const explainConcept = async (req, res, next ) => {
    try{
        const { documentId, concept } = req.body;

        if(!documentId || !concept ){
            return res.status(400).json({
                success: 'Please provide documentId and concept',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if(!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                status: 404
            });
        }

        //find relevant chunks for the concept 
        const relevantChunks = findRelevantChunks(document.chunks, concept, 3);
        const context = relevantChunks.map(c=> c.content).join('\n\n');

        //Generate explanation using Gemini
        const explanation = await geminiService.explainConcept(concept,context);

        res.status(200).json({
            success: true,
            data: {
                concept,
                explanation,
                relevantChunks: relevantChunks.map(c=> c.chunkIndex)
            },
            message: 'Explanation generated successfully'
        });
    }
    catch(error) {
        next(error);
    }
};



//@desc get chat history for a document
//@route POST /api/ai/chat-history/:documentId
//@access Private

export const getChatHistory  = async (req, res, next ) => {
    try{

    }
    catch(error) {
        next(error);
    }
};

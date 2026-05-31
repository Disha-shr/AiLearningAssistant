import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';

//desc Get user learing statistics
//@route get /api/progress/dashboard
//@access private

export const getDashboard = async (req, res, next) => {
    try{
        const userId = req.user._id;

        //Get counts
        const totalDocuments = await Document.countDocuments({userId});
        const totalFlashcardsSets = await Flashcard.countDoucments({ user });
        const totalQuizzes = await Quiz.countDocuments({ userId });
        const completedQuizzes = await Quiz.countDoucments({ userId, completedAt: { $ne: null }});

        //Get falshcard stat++
        
        const flashcardSets = await Flashcard.find({nuserId });
        let totalFlashcards = 0;
        let reviewdFlashcards = 0;
        let starredFalshcards = 0;
        
        flashcardSets.forEach(set => {
            totalFlashcards +=set.cards.length;
            reviewedFlashcards += set.cards.filter(c => c.reviewCount>0).length;
            starredFlashcards += set.cards.filter(c => c.isStarred).length;
        });

        // Get quiz statistics
        const quizzes = await Quiz.find({ userId, completedAt: { $ne: null }});
        const averageScore = quizzes.length>0
        ? Math.round(quizzes.reduce((sum,q) => sum+q.score,0) / quizzes.length)
        :0;

        //Recent activity
        const recentDocuments = await Document.find({ userId })
        .sort({ lastAccessed: -1})
        .limit(5)
        .populate('documentId','title')
        .select('title score totalQuestions completedAt');

        //const streak (simplified - in production, track daily activity)
        const studyStreak = Math.floor(Math.random() * 7)+1; //Mock data

        res.status(200).json({
            success: true,
            data: {
                overivew: {
                    totalDocuments,
                    totalFlashcardSets,
                    totalFlashcards,
                    reviewdFlashcards,
                    starredFlashcards,
                    totalQuizzes,
                    completedQuizzes,
                    averageScore,
                    studeyStreak
                },
                recentActivity: {
                    documents: recentDocuments,
                    quizzes: recentQuizzes
                }
            }
        });
    }catch(error) {
        next(error);
    }
};

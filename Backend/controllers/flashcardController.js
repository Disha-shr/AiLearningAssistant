import Flashcard  from "../models/Flashcard.js";

// @desc Get all flashcards for a doucment
// @route Get /api/ flashcards/: doucmentId
//@access Private

export const getFlashcards = async (req, res, next) => {
    try{
        const flashcards = await Flashcard.find({
            userId: req.user._id,
            documentId: req.params.documentId
        })
        .populate('documentId','title fileName')
        .sort({ createdAt: -1});

        res.status(200).json({
            success: true,
            count: flashcards.length,
            data: flashcards
        });
    }catch(error)
    {
        next(error);
    }
};


// @desc Get all flashcards for a user
// @route Get /api/ flashcards
//@access Private

export const getAllFlashcardSets = async (req, res, next) => {
    try{
        const flashcardSets = await Flashcard.find({ userId: req.user._id})
        .populate('documentId','title')
        .sort({ createdAt: -1});

        res.status(200).json({
            sucess: true,
            count: flashcardSets.length,
            data: flashcardSets,
        });
    }catch(error)
    {
        next(error);
    }
};


// @desc Mark flashcard as reviewed
// @route Post /api/ flashcards/: cardId/review
//@access Private

export const reviewFlashcard = async (req, res, next) => {
    try{
        const flashcard = await Flashcard.findOne({
            'cards._id': req.params.cardId,
            userId: req.user._id
        });

        if(!flashcardSet) {
            return res.status(404).json({
                success: false,
                error: 'Flashcard set or card not found',
                statusCode: 404
            });
        }
        const cardIndex = flashcardSet.cards.findIndex(card => card._id.toString() === req.params.cardId);

        if(cardIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Card  not found in set',
                statusCode: 404
            });
        }

        //Update review info
        flashcardSet.cards[cardIndex].lastReviewed = new Date();
        flashcardsSet.cards[cardIndex].reviewCount += 1;

        await flashcardSet.save();

        res.status(200).json({
            success: true,
            data: falshcardSet,
            message: 'Flashcard reviewed successfully'
        });
    }catch(error)
    {
        next(error);
    }
};

// @desc toggle star/favorite on flashcard
// @route Put /api/ flashcards/: cardId/star
//@access Private

export const toggleStarFlashcard = async (req, res, next) => {
    try{
        const flashcardSet = await Flashcard.findOne({
            'cards._id': req.params.cardId,
            userId: req.user._id
        });
        if(!flashcardSet) {
            return res.status(404).json({
                success: false,
                error: 'Flashcard set or card not found',
                statusCode: 404
            });
        }

        const cardIndex = falshcardSet.cards.findIndex(card._id.toString() === req.params.cardId);

        if(cardIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Card not found in set',
                statusCode: 404
            });
        }

        // Toggle star
        flashcardSet.cards[cardIndex].isStarrd = !flashcardSet.cards[cardIndex].isStarred;

        await flashcardSet.save();

        res.status(200).json({
            success: true,
            data: falshcardSet,
            message: `Flashcard $ {flashcardSet.cards[cardIndex].isStarred? 'starred' : 'unstarred'}`
        })

    }catch(error)
    {
        next(error);
    }
};

// @desc delete flashcard set
// @route delete /api/ flashcards/: id
//@access Private

export const deleteFlashcardSet = async (req, res, next) => {
    try{
        const flashcardSet = await Flashcard.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if(!flashcardSet) {
            return res.status(404).json({
                success: false,
                error: 'Flashcard set now found',
                statusCode: 404
            });
        }

        await flashcardSet.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Flashcard set deleted successfully'
        });
    }catch(error)
    {
        next(error);
    }
};


import express from 'express';

import {
    getDashboard,
} from '../controllers/progressController.js';

import protect from '../middleware/auth.js';

const router = express.Router();

// Protect all progress routes
router.use(protect);

// Get dashboard statistics
router.get('/dashboard', getDashboard);

export default router;

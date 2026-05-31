import express from 'express';
import {
    getDashboard,
} from '../contrllers/progressController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/dashnoard',getDashboard);
export default router;
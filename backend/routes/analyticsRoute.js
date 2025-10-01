import express from 'express';
import { getOverviewAnalytics } from '../controllers/analyticsController.js';
import authMiddleware from '../middleware/auth.js'; 

const analyticsRouter = express.Router();

analyticsRouter.get('/overview', authMiddleware, getOverviewAnalytics);

export default analyticsRouter;


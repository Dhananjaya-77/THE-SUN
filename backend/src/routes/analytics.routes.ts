import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';

const router = Router();

router.get('/dashboard', analyticsController.getDashboard);
router.get('/energy-yield', analyticsController.getEnergyYield);
router.get('/carbon', analyticsController.getCarbon);
router.get('/revenue', analyticsController.getRevenue);
router.get('/performance', analyticsController.getPerformance);
router.get('/comparison', analyticsController.getComparison);

export default router;

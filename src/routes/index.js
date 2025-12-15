import express from 'express';
const router = express.Router();

import authRoutes from '../modules/auth/routes/authRoutes.js';

// Use routes
router.use('/auth', authRoutes);



export default router;
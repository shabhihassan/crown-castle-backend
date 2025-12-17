import express from 'express';
const router = express.Router();

import authRoutes from '../modules/auth/routes/authRoutes.js';
import contactRoutes from '../modules/contact-messages/routes/contactRoutes.js'

// Use routes
router.use('/auth', authRoutes);
router.use('/contact', contactRoutes);



export default router;
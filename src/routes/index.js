import express from 'express';
const router = express.Router();

import authRoutes from '../modules/auth/routes/authRoutes.js';
import contactRoutes from '../modules/contact-messages/routes/contactRoutes.js'
import projectRoutes from '../modules/projects/routes/projectRoutes.js'
import teamRoutes from '../modules/team/routes/teamRoutes.js'
// Use routes
router.use('/auth', authRoutes);
router.use('/contact', contactRoutes);
router.use('/project', projectRoutes);
router.use('/team', teamRoutes);



export default router;
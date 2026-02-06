import express from 'express';
const router = express.Router();

import authRoutes from '../modules/auth/routes/authRoutes.js';
import contactRoutes from '../modules/contact-messages/routes/contactRoutes.js'
import projectRoutes from '../modules/projects/routes/projectRoutes.js'
import teamRoutes from '../modules/team/routes/teamRoutes.js'
import blogRoutes from '../modules/blogs/routes/blogRoutes.js'
// Use routes
router.use('/auth', authRoutes);
router.use('/contact', contactRoutes);
router.use('/project', projectRoutes);
router.use('/team', teamRoutes);
router.use('/blog', blogRoutes);



export default router;
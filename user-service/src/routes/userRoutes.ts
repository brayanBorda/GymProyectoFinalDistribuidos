import express from 'express';
import { register, login, profile, logout, getAllUsers, getUserById } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, profile);
router.post('/logout', logout);
router.get('/',  authenticate,getAllUsers);
router.get('/:id', authenticate,getUserById);

export default router;
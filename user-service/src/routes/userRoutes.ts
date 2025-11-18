import express from 'express';
import { register, login, profile, logout, getAllUsers } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, profile);
router.post('/logout', logout);
router.get('/users',  getAllUsers);

export default router;
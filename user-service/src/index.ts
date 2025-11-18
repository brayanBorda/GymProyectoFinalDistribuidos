import express from 'express';
import userRoutes from './routes/userRoutes.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());
console.log('✅ Rutas montadas en /api/users');

app.use('/api/users', userRoutes);

app.listen(3003, () => console.log('User service corriendo en puerto 3003'));
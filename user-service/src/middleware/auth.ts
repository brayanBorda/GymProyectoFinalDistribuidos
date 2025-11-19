import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// 👤 Extiende el tipo Request para incluir user
interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

// Función auxiliar para verificar si la petición es de un servicio interno
const isServiceCall = (req: Request): boolean => {
    const serviceKey = req.headers['x-api-key'];
    // Compara la clave de la petición (API_KEY) con la clave secreta del entorno (SERVICE_API_KEY)
    return !!serviceKey && serviceKey === process.env.SERVICE_API_KEY;
};

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log('🔐 Middleware ejecutado. Ruta:', req.originalUrl);
  // Permitir llamadas internas de servicios sin autenticación
  if (isServiceCall(req)) {
    console.log('Acceso concedido: Llamada de servicio interna (X-API-Key válida)');
    return next();
  }
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'JWT_SECRET no está definido en el entorno' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      userId: number;
      role: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(403).json({ error: 'Token inválido' });
  }
};
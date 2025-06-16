import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extender a interface Request para incluir o usuário
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        nome: string;
        admin: boolean;
      };
    }
  }
}

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    nome: string;
    admin: boolean;
    ativo: boolean;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Token de acesso necessário' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Buscar usuário no banco
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        nome: true,
        admin: true,
        ativo: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Usuário não encontrado' });
      return;
    }

    if (!user.ativo) {
      res.status(401).json({ error: 'Usuário inativo' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      nome: user.nome,
      admin: user.admin,
      ativo: user.ativo
    };
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token inválido' });
    return;
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user?.admin) {
    res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    return;
  }
  next();
};

export const requireActiveUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user?.ativo) {
    res.status(403).json({ error: 'Usuário inativo' });
    return;
  }
  next();
}; 
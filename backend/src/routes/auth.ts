import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        usuarioNiveis: {
          include: {
            nivel: true
          }
        }
      }
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (!usuario.ativo) {
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { 
        userId: usuario.id,
        email: usuario.email,
        admin: usuario.admin
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
        setor: usuario.setor,
        admin: usuario.admin,
        ativo: usuario.ativo,
        usuarioNiveis: usuario.usuarioNiveis
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Logout (apenas para registro, JWT é stateless)
router.post('/logout', authenticateToken, (req: Request, res: Response) => {
  res.json({
    message: 'Logout realizado com sucesso',
  });
});

// Verificar usuário atual
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const usuario = await prisma.usuario.findUnique({
      where: { id: authReq.user.id },
      include: {
        usuarioNiveis: {
          include: {
            nivel: true
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo,
      setor: usuario.setor,
      admin: usuario.admin,
      ativo: usuario.ativo,
      usuarioNiveis: usuario.usuarioNiveis
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verificar se token é válido
router.get('/verify', authenticateToken, (req: Request, res: Response) => {
  res.json({
    valid: true,
    user: req.user,
  });
});

export default router; 
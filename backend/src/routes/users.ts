import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin, requireActiveUser } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Listar todos os usuários (apenas admin)
router.get('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        usuarioNiveis: {
          include: {
            nivel: true,
          },
        },
        usuariosPermitidos: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    });

    // Remover senhas dos usuários
    const usuariosSemSenha = usuarios.map(({ senha, ...usuario }) => usuario);

    res.json(usuariosSemSenha);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// Buscar usuário por ID
router.get('/:id', authenticateToken, requireActiveUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // Verificar se o usuário pode acessar (admin ou próprio usuário)
    if (!req.user!.admin && req.user!.id !== userId) {
      return res.status(403).json({
        error: 'Acesso negado',
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        usuarioNiveis: {
          include: {
            nivel: true,
          },
        },
        usuariosPermitidos: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
      });
    }

    const { senha, ...usuarioSemSenha } = usuario;
    res.json(usuarioSemSenha);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// Criar usuário (apenas admin)
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, cargo, setor, admin, niveis, podeVerTodosOrcamentos, usuariosPermitidos } = req.body;

    if (!nome || !email || !senha || !cargo || !setor) {
      return res.status(400).json({
        error: 'Nome, email, senha, cargo e setor são obrigatórios',
      });
    }

    // Verificar se email já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return res.status(400).json({
        error: 'Email já cadastrado',
      });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        cargo,
        setor,
        admin: admin || false,
        podeVerTodosOrcamentos: podeVerTodosOrcamentos || false,
        usuariosPermitidos: usuariosPermitidos && Array.isArray(usuariosPermitidos)
          ? { connect: usuariosPermitidos.map((id: number) => ({ id })) }
          : undefined,
      },
      include: {
        usuariosPermitidos: { select: { id: true, nome: true, email: true } },
      },
    });

    // Associar níveis se fornecidos
    if (niveis && Array.isArray(niveis)) {
      await Promise.all(
        niveis.map((nivelId: number) =>
          prisma.usuarioNivel.create({
            data: {
              usuarioId: usuario.id,
              nivelId,
            },
          })
        )
      );
    }

    const { senha: _, ...usuarioSemSenha } = usuario;
    res.status(201).json(usuarioSemSenha);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// Ativar/Desativar usuário (apenas admin)
router.patch('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const { ativo } = req.body;

    // Verificar se usuário existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuarioExistente) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
      });
    }

    // Não permitir desativar o próprio admin
    if (req.user!.id === userId && !ativo) {
      return res.status(400).json({
        error: 'Não é possível desativar o próprio usuário',
      });
    }

    // Atualizar status do usuário
    const usuario = await prisma.usuario.update({
      where: { id: userId },
      data: { ativo },
      include: {
        usuarioNiveis: {
          include: {
            nivel: true,
          },
        },
        usuariosPermitidos: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    const { senha: _, ...usuarioSemSenha } = usuario;
    res.json(usuarioSemSenha);
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// Atualizar usuário
router.put('/:id', authenticateToken, requireActiveUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const { nome, email, senha, cargo, setor, admin, ativo, niveis, podeVerTodosOrcamentos, usuariosPermitidos } = req.body;

    // Verificar se o usuário pode editar (admin ou próprio usuário)
    if (!req.user!.admin && req.user!.id !== userId) {
      return res.status(403).json({
        error: 'Acesso negado',
      });
    }

    // Verificar se usuário existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuarioExistente) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
      });
    }

    // Verificar se email já existe (se foi alterado)
    if (email && email !== usuarioExistente.email) {
      const emailExistente = await prisma.usuario.findUnique({
        where: { email },
      });

      if (emailExistente) {
        return res.status(400).json({
          error: 'Email já cadastrado',
        });
      }
    }

    // Preparar dados para atualização
    const dadosAtualizacao: any = {};
    if (nome) dadosAtualizacao.nome = nome;
    if (email) dadosAtualizacao.email = email;
    if (cargo) dadosAtualizacao.cargo = cargo;
    if (setor) dadosAtualizacao.setor = setor;
    if (typeof ativo === 'boolean') dadosAtualizacao.ativo = ativo;
    if (req.user!.admin && typeof admin === 'boolean') dadosAtualizacao.admin = admin;
    if (req.user!.admin && typeof podeVerTodosOrcamentos === 'boolean') dadosAtualizacao.podeVerTodosOrcamentos = podeVerTodosOrcamentos;

    // Hash da senha se fornecida
    if (senha) {
      dadosAtualizacao.senha = await bcrypt.hash(senha, 10);
    }

    // Atualizar usuário
    const usuario = await prisma.usuario.update({
      where: { id: userId },
      data: {
        ...dadosAtualizacao,
        usuariosPermitidos: req.user!.admin && usuariosPermitidos && Array.isArray(usuariosPermitidos)
          ? { set: usuariosPermitidos.map((id: number) => ({ id })) }
          : undefined,
      },
      include: {
        usuariosPermitidos: { select: { id: true, nome: true, email: true } },
      },
    });

    // Atualizar níveis se fornecido e for admin
    if (req.user!.admin && niveis && Array.isArray(niveis)) {
      // Remover associações existentes
      await prisma.usuarioNivel.deleteMany({
        where: { usuarioId: userId },
      });

      // Criar novas associações
      await Promise.all(
        niveis.map((nivelId: number) =>
          prisma.usuarioNivel.create({
            data: {
              usuarioId: userId,
              nivelId,
            },
          })
        )
      );
    }

    const { senha: _, ...usuarioSemSenha } = usuario;
    res.json(usuarioSemSenha);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// Deletar usuário (apenas admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // Verificar se usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
      });
    }

    // Não permitir deletar o próprio admin
    if (req.user!.id === userId) {
      return res.status(400).json({
        error: 'Não é possível deletar o próprio usuário',
      });
    }

    // Deletar usuário (cascade irá deletar as associações)
    await prisma.usuario.delete({
      where: { id: userId },
    });

    res.json({
      message: 'Usuário deletado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// Listar fluxo personalizado de um usuário
router.get('/:id/fluxo', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const usuarioId = parseInt(req.params.id);
    const fluxo = await prisma.fluxoUsuario.findMany({
      where: { usuarioId, ativo: true },
      include: {
        nivel: {
          select: { id: true, nome: true, prioridade: true },
        },
      },
      orderBy: { ordem: 'asc' },
    });
    res.json(fluxo);
  } catch (error) {
    console.error('Erro ao listar fluxo do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar/atualizar fluxo personalizado de um usuário
router.post('/:id/fluxo', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const usuarioId = parseInt(req.params.id);
    const { niveis } = req.body; // Array de IDs dos níveis em ordem
    // Deletar fluxo existente
    await prisma.fluxoUsuario.deleteMany({ where: { usuarioId } });
    // Criar novo fluxo
    const fluxo = [];
    for (let i = 0; i < niveis.length; i++) {
      const nivelId = niveis[i];
      const fluxoItem = await prisma.fluxoUsuario.create({
        data: {
          usuarioId,
          nivelId,
          ordem: i + 1,
          ativo: true,
        },
        include: {
          nivel: { select: { id: true, nome: true, prioridade: true } },
        },
      });
      fluxo.push(fluxoItem);
    }
    res.json(fluxo);
  } catch (error) {
    console.error('Erro ao criar fluxo do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar fluxo personalizado de um usuário
router.delete('/:id/fluxo', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const usuarioId = parseInt(req.params.id);
    await prisma.fluxoUsuario.deleteMany({ where: { usuarioId } });
    res.json({ message: 'Fluxo personalizado removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar fluxo do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router; 
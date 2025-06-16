import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Listar usuários (apenas admin)
router.get('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        usuarioNiveis: {
          include: {
            nivel: true,
          },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    });

    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// Criar usuário (apenas admin)
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, cargo, setor, admin, podeVerTodosOrcamentos } = req.body;

    // Verificar se email já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return res.status(400).json({
        error: 'Já existe um usuário com este email',
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
      },
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
        setor: usuario.setor,
        ativo: usuario.ativo,
        admin: usuario.admin,
        podeVerTodosOrcamentos: usuario.podeVerTodosOrcamentos,
        createdAt: usuario.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// Atualizar usuário (apenas admin)
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuarioId = parseInt(id);
    const { nome, email, senha, cargo, setor, ativo, admin, podeVerTodosOrcamentos } = req.body;

    // Verificar se usuário existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuarioExistente) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
      });
    }

    // Verificar se novo email já existe (se foi alterado)
    if (email && email !== usuarioExistente.email) {
      const emailExistente = await prisma.usuario.findUnique({
        where: { email },
      });

      if (emailExistente) {
        return res.status(400).json({
          error: 'Já existe um usuário com este email',
        });
      }
    }

    // Preparar dados para atualização
    const dadosAtualizacao: any = {
      nome,
      email,
      cargo,
      setor,
      ativo,
      admin,
      podeVerTodosOrcamentos,
    };

    // Se senha foi fornecida, fazer hash
    if (senha) {
      dadosAtualizacao.senha = await bcrypt.hash(senha, 10);
    }

    // Atualizar usuário
    const usuario = await prisma.usuario.update({
      where: { id: usuarioId },
      data: dadosAtualizacao,
    });

    res.json({
      message: 'Usuário atualizado com sucesso',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
        setor: usuario.setor,
        ativo: usuario.ativo,
        admin: usuario.admin,
        podeVerTodosOrcamentos: usuario.podeVerTodosOrcamentos,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// Excluir usuário (apenas admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuarioId = parseInt(id);

    // Verificar se usuário existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuarioExistente) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
      });
    }

    // Verificar se usuário tem orçamentos associados
    const orcamentosAssociados = await prisma.orcamento.findFirst({
      where: { solicitanteId: usuarioId },
    });

    if (orcamentosAssociados) {
      return res.status(400).json({
        error: 'Não é possível excluir um usuário que possui orçamentos associados',
      });
    }

    // Excluir usuário
    await prisma.usuario.delete({
      where: { id: usuarioId },
    });

    res.json({
      message: 'Usuário excluído com sucesso',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

export default router; 
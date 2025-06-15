import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Listar todas as filiais
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const filiais = await prisma.filial.findMany({
      where: { ativo: true },
      include: {
        _count: {
          select: {
            orcamentos: true,
          },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    });

    res.json(filiais);
  } catch (error) {
    console.error('Erro ao listar filiais:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// Buscar filial por ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const filialId = parseInt(id);

    const filial = await prisma.filial.findUnique({
      where: { id: filialId },
      include: {
        orcamentos: {
          include: {
            solicitante: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
            nivelAtual: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!filial) {
      return res.status(404).json({
        error: 'Filial não encontrada',
      });
    }

    res.json(filial);
  } catch (error) {
    console.error('Erro ao buscar filial:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// Criar filial (apenas admin)
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { nome, endereco, telefone } = req.body;

    if (!nome) {
      return res.status(400).json({
        error: 'Nome da filial é obrigatório',
      });
    }

    // Verificar se nome já existe
    const filialExistente = await prisma.filial.findFirst({
      where: { nome },
    });

    if (filialExistente) {
      return res.status(400).json({
        error: 'Já existe uma filial com este nome',
      });
    }

    const filial = await prisma.filial.create({
      data: {
        nome,
        endereco,
        telefone,
      },
    });

    res.status(201).json(filial);
  } catch (error) {
    console.error('Erro ao criar filial:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// Atualizar filial (apenas admin)
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const filialId = parseInt(id);
    const { nome, endereco, telefone, ativo } = req.body;

    // Verificar se filial existe
    const filialExistente = await prisma.filial.findUnique({
      where: { id: filialId },
    });

    if (!filialExistente) {
      return res.status(404).json({
        error: 'Filial não encontrada',
      });
    }

    // Verificar se novo nome já existe (se foi alterado)
    if (nome && nome !== filialExistente.nome) {
      const nomeExistente = await prisma.filial.findFirst({
        where: { nome },
      });

      if (nomeExistente) {
        return res.status(400).json({
          error: 'Já existe uma filial com este nome',
        });
      }
    }

    const filial = await prisma.filial.update({
      where: { id: filialId },
      data: {
        nome: nome || undefined,
        endereco: endereco || undefined,
        telefone: telefone || undefined,
        ativo: typeof ativo === 'boolean' ? ativo : undefined,
      },
    });

    res.json(filial);
  } catch (error) {
    console.error('Erro ao atualizar filial:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// Atualizar campo específico da filial (apenas admin)
router.patch('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const filialId = parseInt(id);
    const updateData = req.body;

    // Verificar se filial existe
    const filialExistente = await prisma.filial.findUnique({
      where: { id: filialId },
    });

    if (!filialExistente) {
      return res.status(404).json({
        error: 'Filial não encontrada',
      });
    }

    // Verificar se novo nome já existe (se foi alterado)
    if (updateData.nome && updateData.nome !== filialExistente.nome) {
      const nomeExistente = await prisma.filial.findFirst({
        where: { nome: updateData.nome },
      });

      if (nomeExistente) {
        return res.status(400).json({
          error: 'Já existe uma filial com este nome',
        });
      }
    }

    const filial = await prisma.filial.update({
      where: { id: filialId },
      data: updateData,
    });

    res.json(filial);
  } catch (error) {
    console.error('Erro ao atualizar filial:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// Deletar filial (apenas admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const filialId = parseInt(id);

    // Verificar se filial existe
    const filial = await prisma.filial.findUnique({
      where: { id: filialId },
      include: {
        orcamentos: true,
      },
    });

    if (!filial) {
      return res.status(404).json({
        error: 'Filial não encontrada',
      });
    }

    // Verificar se há orçamentos associados
    if (filial.orcamentos.length > 0) {
      return res.status(400).json({
        error: 'Não é possível deletar uma filial que possui orçamentos associados',
      });
    }

    await prisma.filial.delete({
      where: { id: filialId },
    });

    res.json({
      message: 'Filial deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar filial:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// Estatísticas da filial
router.get('/:id/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const filialId = parseInt(id);

    // Verificar se filial existe
    const filial = await prisma.filial.findUnique({
      where: { id: filialId },
    });

    if (!filial) {
      return res.status(404).json({
        error: 'Filial não encontrada',
      });
    }

    // Buscar estatísticas
    const [
      totalOrcamentos,
      orcamentosPendentes,
      orcamentosAprovados,
      orcamentosReprovados,
      orcamentosComprados,
      orcamentosEntregues,
      valorTotal,
      valorAprovado,
    ] = await Promise.all([
      prisma.orcamento.count({
        where: { filialId },
      }),
      prisma.orcamento.count({
        where: { filialId, status: 'PENDENTE' },
      }),
      prisma.orcamento.count({
        where: { filialId, status: 'APROVADO' },
      }),
      prisma.orcamento.count({
        where: { filialId, status: 'REPROVADO' },
      }),
      prisma.orcamento.count({
        where: { filialId, status: 'COMPRA_EFETUADA' },
      }),
      prisma.orcamento.count({
        where: { filialId, status: 'ENTREGUE' },
      }),
      prisma.orcamento.aggregate({
        where: { filialId },
        _sum: {
          valor: true,
        },
      }),
      prisma.orcamento.aggregate({
        where: { filialId, status: 'APROVADO' },
        _sum: {
          valor: true,
        },
      }),
    ]);

    res.json({
      filial,
      stats: {
        totalOrcamentos,
        orcamentosPendentes,
        orcamentosAprovados,
        orcamentosReprovados,
        orcamentosComprados,
        orcamentosEntregues,
        valorTotal: valorTotal._sum.valor || 0,
        valorAprovado: valorAprovado._sum.valor || 0,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas da filial:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

export default router; 
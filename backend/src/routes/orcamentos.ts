import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireActiveUser, requireAdmin } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

// Listar orçamentos para dar baixa (apenas nível de compras)
router.get('/dar-baixa', authenticateToken, requireActiveUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    // Verificar se usuário está no nível de compras
    const usuarioNiveis = await prisma.usuarioNivel.findMany({
      where: { usuarioId: userId },
      include: { nivel: true }
    });
    const nivelCompras = usuarioNiveis.some(un => un.nivel.nivelFinal);
    if (!req.user!.admin && !nivelCompras) {
      return res.json({ orcamentos: [] });
    }
    const orcamentos = await prisma.orcamento.findMany({
      where: {
        status: 'COMPRA_EFETUADA'
      },
      include: {
        solicitante: {
          select: {
            id: true,
            nome: true,
            email: true,
            cargo: true,
            setor: true,
          },
        },
        nivelAtual: true,
        filial: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json({ orcamentos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar orçamentos aguardando compra (apenas nível de compras)
router.get('/aguardando-compra', authenticateToken, requireActiveUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Verificar se usuário está no nível de compras
    const usuarioNiveis = await prisma.usuarioNivel.findMany({
      where: { usuarioId: userId },
      include: { nivel: true }
    });
    
    const nivelCompras = usuarioNiveis.some(un => un.nivel.nivelFinal);
    
    if (!req.user!.admin && !nivelCompras) {
      return res.json({ orcamentos: [] });
    }
    
    const orcamentos = await prisma.orcamento.findMany({
      where: {
        status: 'AGUARDANDO_COMPRA'
      },
      include: {
        solicitante: {
          select: {
            id: true,
            nome: true,
            email: true,
            cargo: true,
            setor: true,
          },
        },
        nivelAtual: true,
        filial: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    res.json({ orcamentos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar orçamentos pendentes para aprovação do nível do usuário
router.get('/pendentes', authenticateToken, requireActiveUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    // Buscar níveis do usuário (exceto solicitante/prioridade 1)
    const usuarioNiveis = await prisma.usuarioNivel.findMany({
      where: { usuarioId: userId },
      include: { nivel: true }
    });
    const niveisAprovacao = usuarioNiveis.filter(un => un.nivel.prioridade > 1).map(un => un.nivelId);
    if (niveisAprovacao.length === 0) {
      return res.json({ orcamentos: [] });
    }
    const orcamentos = await prisma.orcamento.findMany({
      where: {
        status: 'PENDENTE',
        nivelAtualId: { in: niveisAprovacao }
      },
      include: {
        solicitante: {
          select: {
            id: true,
            nome: true,
            email: true,
            cargo: true,
            setor: true,
          },
        },
        nivelAtual: true,
        filial: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json({ orcamentos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar orçamentos
router.get('/', authenticateToken, requireActiveUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Buscar informações do usuário para verificar se pode ver todos os orçamentos
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { 
        admin: true, 
        podeVerTodosOrcamentos: true,
        usuarioNiveis: {
          include: {
            nivel: true
          }
        },
        usuariosPermitidos: { select: { id: true } },
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Se for admin ou puder ver todos os orçamentos, retornar todos
    if (usuario.admin || usuario.podeVerTodosOrcamentos) {
      const orcamentos = await prisma.orcamento.findMany({
        include: {
          solicitante: {
            select: {
              id: true,
              nome: true,
              email: true,
              cargo: true,
              setor: true,
            },
          },
          nivelAtual: true,
          filial: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.json({ orcamentos });
    }

    // Caso contrário, verificar níveis de aprovação do usuário
    const niveisUsuario = usuario.usuarioNiveis.map(un => un.nivel.id);
    const idsPermitidos = usuario.usuariosPermitidos?.map(u => u.id) || [];
    let orcamentos;
    const ehNivel2 = usuario.usuarioNiveis.some(un => un.nivel.prioridade === 2);
    if (ehNivel2) {
      // Buscar IDs dos usuários que são do nível 1 (prioridade 1)
      const usuariosNivel1 = await prisma.usuarioNivel.findMany({
        where: {
          nivel: { prioridade: 1 }
        },
        select: { usuarioId: true }
      });
      const idsNivel1 = usuariosNivel1.map(us => us.usuarioId);
      orcamentos = await prisma.orcamento.findMany({
        where: {
          OR: [
            { solicitanteId: userId },
            { nivelAtualId: { in: niveisUsuario } },
            { solicitanteId: { in: idsNivel1 } }
          ]
        },
        include: {
          solicitante: {
            select: {
              id: true,
              nome: true,
              email: true,
              cargo: true,
              setor: true,
            },
          },
          nivelAtual: true,
          filial: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else if (idsPermitidos.length > 0) {
      // Se tem usuários permitidos, só pode ver os próprios e dos permitidos
      orcamentos = await prisma.orcamento.findMany({
        where: {
          OR: [
            { solicitanteId: userId },
            { solicitanteId: { in: idsPermitidos } }
          ]
        },
        include: {
          solicitante: {
            select: {
              id: true,
              nome: true,
              email: true,
              cargo: true,
              setor: true,
            },
          },
          nivelAtual: true,
          filial: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      // Se não tem permitidos, só pode ver os próprios
      orcamentos = await prisma.orcamento.findMany({
        where: {
          solicitanteId: userId
        },
        include: {
          solicitante: {
            select: {
              id: true,
              nome: true,
              email: true,
              cargo: true,
              setor: true,
            },
          },
          nivelAtual: true,
          filial: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    res.json({ orcamentos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar orçamento por ID
router.get('/:id', authenticateToken, requireActiveUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orcamentoId = parseInt(id);

    const orcamento = await prisma.orcamento.findUnique({
      where: { id: orcamentoId },
      include: {
        solicitante: {
          select: {
            id: true,
            nome: true,
            email: true,
            cargo: true,
          },
        },
        filial: true,
        nivelAtual: true,
        proximoNivel: true,
        aprovacoes: {
          include: {
            aprovador: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        rejeicoes: {
          include: {
            rejeitador: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!orcamento) {
      return res.status(404).json({
        error: 'Orçamento não encontrado',
      });
    }

    res.json(orcamento);
  } catch (error) {
    console.error('Erro ao buscar orçamento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// Criar orçamento
router.post('/', authenticateToken, requireActiveUser, upload.fields([
  { name: 'fotos', maxCount: 10 },
  { name: 'anexos', maxCount: 10 }
]) as any, async (req: Request, res: Response) => {
  try {
    const { titulo, descricao, valor, quantidade, fornecedor, links, observacoes, filialId } = req.body;

    if (!titulo || !descricao || !valor || !quantidade || !filialId) {
      return res.status(400).json({
        error: 'Título, descrição, valor, quantidade e filial são obrigatórios',
      });
    }

    // Buscar fluxo personalizado do usuário
    const fluxoUsuario = await prisma.fluxoUsuario.findMany({
      where: { usuarioId: req.user!.id, ativo: true },
      orderBy: { ordem: 'asc' },
    });

    let nivelAtualId: number;
    let proximoNivelId: number | null = null;
    if (fluxoUsuario.length > 0) {
      nivelAtualId = fluxoUsuario[0].nivelId;
      proximoNivelId = fluxoUsuario.length > 1 ? fluxoUsuario[1].nivelId : null;
    } else {
      // Fluxo padrão: usar o nível do usuário e regra de fluxo
      const usuarioNiveis = await prisma.usuarioNivel.findMany({
        where: { usuarioId: req.user!.id },
        include: { nivel: true },
        orderBy: { nivel: { prioridade: 'asc' } },
      });
      if (usuarioNiveis.length === 0) {
        return res.status(400).json({ error: 'Usuário não possui níveis associados' });
      }
      const nivelInicial = usuarioNiveis[0].nivel;
      nivelAtualId = nivelInicial.id;
      const proximoNivel = await prisma.regraFluxo.findFirst({
        where: { nivelOrigemId: nivelInicial.id },
        include: { nivelDestino: true },
      });
      proximoNivelId = proximoNivel?.nivelDestinoId || null;
    }

    // Processar arquivos enviados
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    const fotos = files.fotos ? files.fotos.map(file => 
      `/uploads/${file.filename}`
    ).join(',') : '';

    const anexos = files.anexos ? files.anexos.map(file => 
      `/uploads/${file.filename}`
    ).join(',') : '';

    const orcamento = await prisma.orcamento.create({
      data: {
        titulo,
        descricao,
        valor: parseFloat(valor),
        quantidade: parseInt(quantidade),
        fornecedor,
        links,
        fotos,
        anexos,
        observacoes,
        solicitanteId: req.user!.id,
        filialId: parseInt(filialId),
        nivelAtualId,
        proximoNivelId,
      },
      include: {
        solicitante: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        filial: true,
        nivelAtual: true,
        proximoNivel: true,
      },
    });

    res.status(201).json(orcamento);
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// Atualizar orçamento
router.put('/:id', authenticateToken, requireActiveUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orcamentoId = parseInt(id);
    const { titulo, descricao, valor, fornecedor, links, fotos, anexos, observacoes, quantidade } = req.body;

    // Verificar se orçamento existe
    const orcamentoExistente = await prisma.orcamento.findUnique({
      where: { id: orcamentoId },
    });

    if (!orcamentoExistente) {
      return res.status(404).json({
        error: 'Orçamento não encontrado',
      });
    }

    // Buscar o nível inicial do fluxo do solicitante
    const fluxoUsuario = await prisma.fluxoUsuario.findMany({
      where: { usuarioId: orcamentoExistente.solicitanteId, ativo: true },
      orderBy: { ordem: 'asc' },
    });
    let nivelInicialId: number | null = null;
    if (fluxoUsuario.length > 0) {
      nivelInicialId = fluxoUsuario[0].nivelId;
    } else {
      // Fluxo padrão: menor prioridade
      const usuarioNiveis = await prisma.usuarioNivel.findMany({
        where: { usuarioId: orcamentoExistente.solicitanteId },
        include: { nivel: true },
        orderBy: { nivel: { prioridade: 'asc' } },
      });
      if (usuarioNiveis.length > 0) {
        nivelInicialId = usuarioNiveis[0].nivelId;
      }
    }

    // Só pode editar se for o solicitante E o orçamento estiver no nível inicial
    if (
      req.user!.id !== orcamentoExistente.solicitanteId ||
      orcamentoExistente.nivelAtualId !== nivelInicialId
    ) {
      return res.status(403).json({
        error: 'Não é possível editar um orçamento já aprovado pelo próximo nível.'
      });
    }

    // Não permitir edição se já foi aprovado ou reprovado
    if (orcamentoExistente.status !== 'PENDENTE') {
      return res.status(400).json({
        error: 'Não é possível editar um orçamento que já foi processado',
      });
    }

    const orcamento = await prisma.orcamento.update({
      where: { id: orcamentoId },
      data: {
        titulo: titulo || undefined,
        descricao: descricao || undefined,
        valor: valor ? parseFloat(valor) : undefined,
        quantidade: quantidade ? parseInt(quantidade) : undefined,
        fornecedor: fornecedor || undefined,
        links: links || undefined,
        fotos: fotos || undefined,
        anexos: anexos || undefined,
        observacoes: observacoes || undefined,
      },
      include: {
        solicitante: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        filial: true,
        nivelAtual: true,
        proximoNivel: true,
      },
    });

    res.json(orcamento);
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// Aprovar orçamento
router.post('/:id/aprovar', authenticateToken, async (req: Request, res: Response) => {
  try {
    const orcamentoId = parseInt(req.params.id);
    const { observacoes } = req.body;

    // Buscar orçamento
    const orcamento = await prisma.orcamento.findUnique({
      where: { id: orcamentoId },
      include: {
        solicitante: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        filial: true,
        nivelAtual: true,
        proximoNivel: true,
      },
    });

    if (!orcamento) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }

    // Verificar se o usuário pode aprovar este orçamento
    const usuarioNiveis = await prisma.usuarioNivel.findMany({
      where: { usuarioId: req.user!.id },
      include: { nivel: true },
    });

    const podeAprovar = usuarioNiveis.some((un) => un.nivel.id === orcamento.nivelAtualId);
    if (!podeAprovar) {
      return res.status(403).json({ error: 'Usuário não tem permissão para aprovar este orçamento' });
    }

    // Buscar fluxo personalizado do solicitante
    const fluxoUsuario = await prisma.fluxoUsuario.findMany({
      where: { usuarioId: orcamento.solicitanteId, ativo: true },
      orderBy: { ordem: 'asc' },
    });

    let proximoNivelId: number | null = null;
    
    if (fluxoUsuario.length > 0) {
      // Fluxo personalizado: encontrar o próximo nível na sequência
      const nivelAtualIndex = fluxoUsuario.findIndex(fu => fu.nivelId === orcamento.nivelAtualId);
      if (nivelAtualIndex !== -1 && nivelAtualIndex < fluxoUsuario.length - 1) {
        proximoNivelId = fluxoUsuario[nivelAtualIndex + 1].nivelId;
      }
    } else {
      // Fluxo padrão: usar regra de fluxo
      const proximoProximoNivel = await prisma.regraFluxo.findFirst({
        where: { nivelOrigemId: orcamento.nivelAtualId },
        include: { nivelDestino: true },
      });
      proximoNivelId = proximoProximoNivel?.nivelDestinoId || null;
    }

    // Criar aprovação
    await prisma.aprovacao.create({
      data: {
        orcamentoId: orcamento.id,
        aprovadorId: req.user!.id,
        observacoes: observacoes || null,
      },
    });

    // Atualizar orçamento
    let novoStatus = 'PENDENTE';
    let novoNivelAtualId = proximoNivelId || orcamento.nivelAtualId;

    if (!proximoNivelId) {
      // Não há próximo nível - buscar nível do comprador (nivelFinal: true)
      const nivelComprador = await prisma.nivel.findFirst({ where: { nivelFinal: true } });
      if (nivelComprador) {
        novoStatus = 'AGUARDANDO_COMPRA';
        novoNivelAtualId = nivelComprador.id;
      } else {
        novoStatus = 'APROVADO';
      }
    }

    const orcamentoAtualizado = await prisma.orcamento.update({
      where: { id: orcamentoId },
      data: {
        nivelAtualId: novoNivelAtualId,
        proximoNivelId: proximoNivelId ? null : null,
        status: novoStatus,
      },
      include: {
        solicitante: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        filial: true,
        nivelAtual: true,
        proximoNivel: true,
      },
    });

    res.json(orcamentoAtualizado);
  } catch (error) {
    console.error('Erro ao aprovar orçamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Reprovar orçamento
router.post('/:id/reject', authenticateToken, requireActiveUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orcamentoId = parseInt(id);
    const { motivo, observacoes } = req.body;

    if (!motivo) {
      return res.status(400).json({
        error: 'Motivo da reprovação é obrigatório',
      });
    }

    // Verificar se orçamento existe
    const orcamento = await prisma.orcamento.findUnique({
      where: { id: orcamentoId },
      include: {
        nivelAtual: true,
      },
    });

    if (!orcamento) {
      return res.status(404).json({
        error: 'Orçamento não encontrado',
      });
    }

    // Verificar se usuário pode reprovar
    const usuarioNiveis = await prisma.usuarioNivel.findMany({
      where: { usuarioId: req.user!.id },
      include: { nivel: true },
    });

    const niveisIds = usuarioNiveis.map(un => un.nivelId);
    const podeAprovar = usuarioNiveis.some(un => un.nivel.podeAprovar);

    if (!req.user!.admin && (!podeAprovar || !niveisIds.includes(orcamento.nivelAtualId))) {
      return res.status(403).json({
        error: 'Usuário não tem permissão para reprovar este orçamento',
      });
    }

    // Verificar se orçamento está pendente
    if (orcamento.status !== 'PENDENTE') {
      return res.status(400).json({
        error: 'Orçamento não está pendente de aprovação',
      });
    }

    // Criar rejeição
    await prisma.rejeicao.create({
      data: {
        orcamentoId,
        rejeitadorId: req.user!.id,
        motivo,
        observacoes,
      },
    });

    // Marcar como reprovado
    await prisma.orcamento.update({
      where: { id: orcamentoId },
      data: {
        status: 'REPROVADO',
        proximoNivelId: null,
      },
    });

    res.json({
      message: 'Orçamento reprovado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao reprovar orçamento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// Marcar como comprado
router.post('/:id/comprado', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // Verificar se o orçamento existe
    const orcamento = await prisma.orcamento.findUnique({
      where: { id: parseInt(id) },
    });
    if (!orcamento) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }

    // Verificar se usuário pode marcar como comprado (nível final)
    const usuarioNiveis = await prisma.usuarioNivel.findMany({
      where: { usuarioId: userId },
      include: { nivel: true },
    });
    const podeMarcar = usuarioNiveis.some(un => un.nivel.nivelFinal);
    if (!podeMarcar) {
      return res.status(403).json({ error: 'Apenas usuários com nível final podem marcar como comprado' });
    }

    // Só pode marcar como comprado se estiver AGUARDANDO_COMPRA
    if (orcamento.status !== 'AGUARDANDO_COMPRA') {
      return res.status(403).json({ error: 'Apenas orçamentos aguardando compra podem ser marcados como compra efetuada' });
    }

    const orcamentoAtualizado = await prisma.orcamento.update({
      where: { id: parseInt(id) },
      data: {
        status: 'COMPRA_EFETUADA',
        dataCompra: new Date(),
      },
    });

    res.json({ message: 'Orçamento marcado como compra efetuada com sucesso', orcamento: orcamentoAtualizado });
  } catch (error) {
    console.error('Erro ao marcar como compra efetuada:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Marcar como entregue
router.post('/:id/entregue', authenticateToken, requireActiveUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orcamentoId = parseInt(id);

    // Verificar se orçamento existe
    const orcamento = await prisma.orcamento.findUnique({
      where: { id: orcamentoId },
    });

    if (!orcamento) {
      return res.status(404).json({
        error: 'Orçamento não encontrado',
      });
    }

    // Verificar se orçamento foi comprado
    if (orcamento.status !== 'COMPRA_EFETUADA') {
      return res.status(400).json({
        error: 'Apenas orçamentos comprados podem ser marcados como entregues',
      });
    }

    await prisma.orcamento.update({
      where: { id: orcamentoId },
      data: {
        status: 'ENTREGUE',
      },
    });

    res.json({
      message: 'Orçamento marcado como entregue',
    });
  } catch (error) {
    console.error('Erro ao marcar como entregue:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// Limpar todos os orçamentos, aprovações e rejeições (apenas admin)
router.delete('/limpar-todos', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.aprovacao.deleteMany();
    await prisma.rejeicao.deleteMany();
    await prisma.orcamento.deleteMany();
    res.json({ message: 'Todos os orçamentos, aprovações e rejeições foram removidos.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao limpar orçamentos.' });
  }
});

// Excluir orçamento
router.delete('/:id', authenticateToken, requireActiveUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orcamentoId = parseInt(id);

    // Verificar se orçamento existe
    const orcamento = await prisma.orcamento.findUnique({
      where: { id: orcamentoId },
    });

    if (!orcamento) {
      return res.status(404).json({
        error: 'Orçamento não encontrado',
      });
    }

    // Verificar se usuário pode excluir (solicitante ou admin)
    if (!req.user!.admin && orcamento.solicitanteId !== req.user!.id) {
      return res.status(403).json({
        error: 'Acesso negado',
      });
    }

    // Não permitir exclusão se já foi aprovado ou reprovado
    if (orcamento.status !== 'PENDENTE') {
      return res.status(400).json({
        error: 'Não é possível excluir um orçamento que já foi processado',
      });
    }

    // Excluir aprovações e rejeições relacionadas
    await prisma.aprovacao.deleteMany({
      where: { orcamentoId },
    });

    await prisma.rejeicao.deleteMany({
      where: { orcamentoId },
    });

    // Excluir o orçamento
    await prisma.orcamento.delete({
      where: { id: orcamentoId },
    });

    res.json({
      message: 'Orçamento excluído com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir orçamento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// Dar baixa (apenas nível final)
router.post('/:id/baixa', authenticateToken, requireActiveUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orcamentoId = parseInt(id);

    // Verificar se orçamento existe
    const orcamento = await prisma.orcamento.findUnique({
      where: { id: orcamentoId },
      include: {
        nivelAtual: true,
      },
    });

    if (!orcamento) {
      return res.status(404).json({
        error: 'Orçamento não encontrado',
      });
    }

    // Verificar se usuário está no nível final (compras)
    const usuarioNiveis = await prisma.usuarioNivel.findMany({
      where: { usuarioId: req.user!.id },
      include: { nivel: true },
    });

    const niveisIds = usuarioNiveis.map(un => un.nivelId);
    const nivelFinal = usuarioNiveis.some(un => un.nivel.nivelFinal);

    if (!req.user!.admin && (!nivelFinal || !niveisIds.includes(orcamento.nivelAtualId))) {
      return res.status(403).json({
        error: 'Apenas usuários do nível de compras podem dar baixa',
      });
    }

    // Verificar se orçamento foi comprado
    if (orcamento.status !== 'COMPRA_EFETUADA') {
      return res.status(400).json({
        error: 'Apenas orçamentos com compra efetuada podem receber baixa',
      });
    }

    const orcamentoAtualizado = await prisma.orcamento.update({
      where: { id: orcamentoId },
      data: {
        status: 'FINALIZADO',
        dataBaixa: new Date(), // Salvar a data de baixa
        updatedAt: new Date()
      },
      include: {
        solicitante: true,
        nivelAtual: true,
        filial: true,
        aprovacoes: true,
        rejeicoes: true,
      },
    });

    res.json(orcamentoAtualizado);
  } catch (error) {
    console.error('Erro ao dar baixa:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

export default router; 
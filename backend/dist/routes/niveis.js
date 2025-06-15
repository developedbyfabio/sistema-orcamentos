"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const niveis = await prisma.nivel.findMany({
            include: {
                usuarioNiveis: {
                    include: {
                        usuario: {
                            select: {
                                id: true,
                                nome: true,
                                email: true,
                                cargo: true,
                            },
                        },
                    },
                },
                regrasOrigem: {
                    include: {
                        nivelDestino: true,
                    },
                },
            },
            orderBy: {
                prioridade: 'asc',
            },
        });
        res.json(niveis);
    }
    catch (error) {
        console.error('Erro ao listar níveis:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
        });
    }
});
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const nivelId = parseInt(id);
        const nivel = await prisma.nivel.findUnique({
            where: { id: nivelId },
            include: {
                usuarioNiveis: {
                    include: {
                        usuario: {
                            select: {
                                id: true,
                                nome: true,
                                email: true,
                                cargo: true,
                            },
                        },
                    },
                },
                regrasOrigem: {
                    include: {
                        nivelDestino: true,
                    },
                },
                regrasDestino: {
                    include: {
                        nivelOrigem: true,
                    },
                },
            },
        });
        if (!nivel) {
            return res.status(404).json({
                error: 'Nível não encontrado',
            });
        }
        res.json(nivel);
    }
    catch (error) {
        console.error('Erro ao buscar nível:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
        });
    }
});
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { nome, prioridade, podeCriarOrcamento, podeAprovar, nivelFinal } = req.body;
        if (!nome || !prioridade) {
            return res.status(400).json({
                error: 'Nome e prioridade são obrigatórios',
            });
        }
        const nivelExistente = await prisma.nivel.findUnique({
            where: { prioridade: parseInt(prioridade) },
        });
        if (nivelExistente) {
            return res.status(400).json({
                error: 'Já existe um nível com esta prioridade',
            });
        }
        const nivel = await prisma.nivel.create({
            data: {
                nome,
                prioridade: parseInt(prioridade),
                podeCriarOrcamento: podeCriarOrcamento ?? true,
                podeAprovar: podeAprovar ?? false,
                nivelFinal: nivelFinal ?? false,
            },
        });
        res.status(201).json(nivel);
    }
    catch (error) {
        console.error('Erro ao criar nível:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
        });
    }
});
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const nivelId = parseInt(id);
        const { nome, prioridade, podeCriarOrcamento, podeAprovar, nivelFinal, ativo } = req.body;
        const nivelExistente = await prisma.nivel.findUnique({
            where: { id: nivelId },
        });
        if (!nivelExistente) {
            return res.status(404).json({
                error: 'Nível não encontrado',
            });
        }
        if (prioridade && prioridade !== nivelExistente.prioridade) {
            const prioridadeExistente = await prisma.nivel.findUnique({
                where: { prioridade: parseInt(prioridade) },
            });
            if (prioridadeExistente) {
                return res.status(400).json({
                    error: 'Já existe um nível com esta prioridade',
                });
            }
        }
        const nivel = await prisma.nivel.update({
            where: { id: nivelId },
            data: {
                nome: nome || undefined,
                prioridade: prioridade ? parseInt(prioridade) : undefined,
                podeCriarOrcamento: typeof podeCriarOrcamento === 'boolean' ? podeCriarOrcamento : undefined,
                podeAprovar: typeof podeAprovar === 'boolean' ? podeAprovar : undefined,
                nivelFinal: typeof nivelFinal === 'boolean' ? nivelFinal : undefined,
                ativo: typeof ativo === 'boolean' ? ativo : undefined,
            },
        });
        res.json(nivel);
    }
    catch (error) {
        console.error('Erro ao atualizar nível:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
        });
    }
});
router.patch('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const nivelId = parseInt(id);
        const updateData = req.body;
        const nivelExistente = await prisma.nivel.findUnique({
            where: { id: nivelId },
        });
        if (!nivelExistente) {
            return res.status(404).json({
                error: 'Nível não encontrado',
            });
        }
        if (updateData.prioridade && updateData.prioridade !== nivelExistente.prioridade) {
            const prioridadeExistente = await prisma.nivel.findUnique({
                where: { prioridade: parseInt(updateData.prioridade) },
            });
            if (prioridadeExistente) {
                return res.status(400).json({
                    error: 'Já existe um nível com esta prioridade',
                });
            }
        }
        const nivel = await prisma.nivel.update({
            where: { id: nivelId },
            data: updateData,
        });
        res.json(nivel);
    }
    catch (error) {
        console.error('Erro ao atualizar nível:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
        });
    }
});
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const nivelId = parseInt(id);
        const nivel = await prisma.nivel.findUnique({
            where: { id: nivelId },
            include: {
                usuarioNiveis: true,
                orcamentos: true,
            },
        });
        if (!nivel) {
            return res.status(404).json({
                error: 'Nível não encontrado',
            });
        }
        if (nivel.usuarioNiveis.length > 0) {
            return res.status(400).json({
                error: 'Não é possível deletar um nível que possui usuários associados',
            });
        }
        if (nivel.orcamentos.length > 0) {
            return res.status(400).json({
                error: 'Não é possível deletar um nível que possui orçamentos associados',
            });
        }
        await prisma.nivel.delete({
            where: { id: nivelId },
        });
        res.json({
            message: 'Nível deletado com sucesso',
        });
    }
    catch (error) {
        console.error('Erro ao deletar nível:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
        });
    }
});
router.get('/:id/fluxo', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const nivelId = parseInt(id);
        const regras = await prisma.regraFluxo.findMany({
            where: {
                OR: [
                    { nivelOrigemId: nivelId },
                    { nivelDestinoId: nivelId },
                ],
            },
            include: {
                nivelOrigem: true,
                nivelDestino: true,
            },
        });
        res.json(regras);
    }
    catch (error) {
        console.error('Erro ao listar regras de fluxo:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
        });
    }
});
router.post('/:id/fluxo', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const nivelOrigemId = parseInt(id);
        const { nivelDestinoId } = req.body;
        if (!nivelDestinoId) {
            return res.status(400).json({
                error: 'ID do nível de destino é obrigatório',
            });
        }
        const regraExistente = await prisma.regraFluxo.findFirst({
            where: {
                nivelOrigemId,
                nivelDestinoId: parseInt(nivelDestinoId),
            },
        });
        if (regraExistente) {
            return res.status(400).json({
                error: 'Regra de fluxo já existe',
            });
        }
        const regra = await prisma.regraFluxo.create({
            data: {
                nivelOrigemId,
                nivelDestinoId: parseInt(nivelDestinoId),
            },
            include: {
                nivelOrigem: true,
                nivelDestino: true,
            },
        });
        res.status(201).json(regra);
    }
    catch (error) {
        console.error('Erro ao criar regra de fluxo:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
        });
    }
});
router.delete('/:id/fluxo/:regraId', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { regraId } = req.params;
        const regraIdInt = parseInt(regraId);
        const regra = await prisma.regraFluxo.findUnique({
            where: { id: regraIdInt },
        });
        if (!regra) {
            return res.status(404).json({
                error: 'Regra de fluxo não encontrada',
            });
        }
        await prisma.regraFluxo.delete({
            where: { id: regraIdInt },
        });
        res.json({
            message: 'Regra de fluxo deletada com sucesso',
        });
    }
    catch (error) {
        console.error('Erro ao deletar regra de fluxo:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
        });
    }
});
exports.default = router;
//# sourceMappingURL=niveis.js.map
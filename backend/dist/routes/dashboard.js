"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const usuario = await prisma.usuario.findUnique({
            where: { id: userId },
            select: {
                admin: true,
                podeVerTodosOrcamentos: true,
                usuarioNiveis: {
                    include: { nivel: true }
                },
                usuariosPermitidos: { select: { id: true } },
            }
        });
        const { q, status, dataInicial, dataFinal } = req.query;
        let filtroBase = {};
        if (q) {
            filtroBase.titulo = { contains: q, mode: 'insensitive' };
        }
        if (status) {
            filtroBase.status = status;
        }
        if (dataInicial || dataFinal) {
            filtroBase.createdAt = {};
            if (dataInicial)
                filtroBase.createdAt.gte = new Date(dataInicial);
            if (dataFinal)
                filtroBase.createdAt.lte = new Date(dataFinal);
        }
        let orcamentosParaUsuario;
        let orcamentosRecentes;
        if (usuario?.admin || usuario?.podeVerTodosOrcamentos) {
            orcamentosParaUsuario = await prisma.orcamento.findMany({
                where: filtroBase,
                include: {
                    solicitante: {
                        select: {
                            id: true,
                            nome: true,
                            email: true
                        }
                    },
                    nivelAtual: true,
                    filial: true,
                    aprovacoes: {
                        include: {
                            aprovador: {
                                select: {
                                    id: true,
                                    nome: true,
                                    email: true
                                }
                            }
                        }
                    },
                    rejeicoes: {
                        include: {
                            rejeitador: {
                                select: {
                                    id: true,
                                    nome: true,
                                    email: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            orcamentosRecentes = orcamentosParaUsuario.slice(0, 10);
        }
        else {
            const idsPermitidos = usuario.usuariosPermitidos?.map(u => u.id) || [];
            filtroBase.OR = [
                { solicitanteId: userId },
                ...(idsPermitidos.length > 0 ? [{ solicitanteId: { in: idsPermitidos } }] : [])
            ];
            orcamentosParaUsuario = await prisma.orcamento.findMany({
                where: filtroBase,
                include: {
                    solicitante: {
                        select: {
                            id: true,
                            nome: true,
                            email: true
                        }
                    },
                    nivelAtual: true,
                    filial: true,
                    aprovacoes: {
                        include: {
                            aprovador: {
                                select: {
                                    id: true,
                                    nome: true,
                                    email: true
                                }
                            }
                        }
                    },
                    rejeicoes: {
                        include: {
                            rejeitador: {
                                select: {
                                    id: true,
                                    nome: true,
                                    email: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            orcamentosRecentes = orcamentosParaUsuario.slice(0, 10);
        }
        const totalOrcamentos = orcamentosParaUsuario.length;
        const orcamentosPendentes = orcamentosParaUsuario.filter(o => o.status === 'PENDENTE').length;
        const orcamentosAprovados = orcamentosParaUsuario.filter(o => o.status === 'APROVADO').length;
        const orcamentosRejeitados = orcamentosParaUsuario.filter(o => o.status === 'REJEITADO').length;
        const orcamentosAguardandoCompra = orcamentosParaUsuario.filter(o => o.status === 'AGUARDANDO_COMPRA').length;
        const orcamentosComprados = orcamentosParaUsuario.filter(o => o.status === 'COMPRA_EFETUADA').length;
        const orcamentosCompraEfetuada = orcamentosParaUsuario.filter(o => o.status === 'COMPRA_EFETUADA').length;
        const orcamentosFinalizados = orcamentosParaUsuario.filter(o => o.status === 'FINALIZADO').length;
        const valorTotal = orcamentosParaUsuario.reduce((sum, o) => sum + parseFloat(o.valor.toString()), 0);
        const mediaAprovacao = totalOrcamentos > 0 ? (orcamentosAprovados / totalOrcamentos) * 100 : 0;
        let orcamentosPorNivel = [];
        if (orcamentosParaUsuario.length > 0) {
            const nivelMap = new Map();
            for (const o of orcamentosParaUsuario) {
                if (!nivelMap.has(o.nivelAtualId)) {
                    nivelMap.set(o.nivelAtualId, { nivel: o.nivelAtual?.nome || 'Nível não encontrado', quantidade: 0 });
                }
                nivelMap.get(o.nivelAtualId).quantidade++;
            }
            orcamentosPorNivel = Array.from(nivelMap.values());
        }
        const orcamentosRecentesProcessados = orcamentosRecentes.map(o => {
            const ultimaAprovacao = o.aprovacoes.length > 0
                ? o.aprovacoes.reduce((latest, current) => current.createdAt > latest.createdAt ? current : latest)
                : null;
            const ultimaRejeicao = o.rejeicoes.length > 0
                ? o.rejeicoes.reduce((latest, current) => current.createdAt > latest.createdAt ? current : latest)
                : null;
            const dataCompra = o.status === 'COMPRA_EFETUADA' || o.status === 'FINALIZADO'
                ? o.updatedAt
                : null;
            const dataBaixa = o.status === 'FINALIZADO'
                ? o.updatedAt
                : null;
            return {
                id: o.id,
                titulo: o.titulo,
                valor: parseFloat(o.valor.toString()),
                status: o.status,
                createdAt: o.createdAt,
                updatedAt: o.updatedAt,
                solicitante: o.solicitante?.nome || 'Usuário não encontrado',
                nivelAtual: o.nivelAtual?.nome || 'Nível não encontrado',
                filial: o.filial?.nome || 'Filial não encontrada',
                aprovacoes: o.aprovacoes.map(a => ({
                    id: a.id,
                    aprovador: a.aprovador?.nome || 'Usuário não encontrado',
                    observacoes: a.observacoes,
                    dataAprovacao: a.createdAt
                })),
                rejeicoes: o.rejeicoes.map(r => ({
                    id: r.id,
                    rejeitador: r.rejeitador?.nome || 'Usuário não encontrado',
                    motivo: r.motivo,
                    observacoes: r.observacoes,
                    dataRejeicao: r.createdAt
                })),
                ultimaAprovacao: ultimaAprovacao ? {
                    aprovador: ultimaAprovacao.aprovador?.nome || 'Usuário não encontrado',
                    dataAprovacao: ultimaAprovacao.createdAt,
                    observacoes: ultimaAprovacao.observacoes
                } : null,
                ultimaRejeicao: ultimaRejeicao ? {
                    rejeitador: ultimaRejeicao.rejeitador?.nome || 'Usuário não encontrado',
                    dataRejeicao: ultimaRejeicao.createdAt,
                    motivo: ultimaRejeicao.motivo,
                    observacoes: ultimaRejeicao.observacoes
                } : null,
                dataCompra: dataCompra,
                dataBaixa: dataBaixa
            };
        });
        res.json({
            totalOrcamentos,
            orcamentosPendentes,
            orcamentosAprovados,
            orcamentosRejeitados,
            orcamentosAguardandoCompra,
            orcamentosComprados,
            orcamentosCompraEfetuada,
            orcamentosFinalizados,
            valorTotal,
            mediaAprovacao,
            orcamentosPorNivel,
            orcamentosRecentes: orcamentosRecentesProcessados
        });
    }
    catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map
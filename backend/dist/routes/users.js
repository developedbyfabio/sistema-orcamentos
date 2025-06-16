"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get('/', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
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
        const usuariosSemSenha = usuarios.map(({ senha, ...usuario }) => usuario);
        res.json(usuariosSemSenha);
    }
    catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
        });
    }
});
router.get('/:id', auth_1.authenticateToken, auth_1.requireActiveUser, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id);
        if (!req.user.admin && req.user.id !== userId) {
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
    }
    catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
        });
    }
});
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { nome, email, senha, cargo, setor, admin, niveis, podeVerTodosOrcamentos, usuariosPermitidos } = req.body;
        if (!nome || !email || !senha || !cargo || !setor) {
            return res.status(400).json({
                error: 'Nome, email, senha, cargo e setor são obrigatórios',
            });
        }
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email },
        });
        if (usuarioExistente) {
            return res.status(400).json({
                error: 'Email já cadastrado',
            });
        }
        const senhaHash = await bcryptjs_1.default.hash(senha, 10);
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
                    ? { connect: usuariosPermitidos.map((id) => ({ id })) }
                    : undefined,
            },
            include: {
                usuariosPermitidos: { select: { id: true, nome: true, email: true } },
            },
        });
        if (niveis && Array.isArray(niveis)) {
            await Promise.all(niveis.map((nivelId) => prisma.usuarioNivel.create({
                data: {
                    usuarioId: usuario.id,
                    nivelId,
                },
            })));
        }
        const { senha: _, ...usuarioSemSenha } = usuario;
        res.status(201).json(usuarioSemSenha);
    }
    catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
        });
    }
});
router.patch('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id);
        const { ativo } = req.body;
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { id: userId },
        });
        if (!usuarioExistente) {
            return res.status(404).json({
                error: 'Usuário não encontrado',
            });
        }
        if (req.user.id === userId && !ativo) {
            return res.status(400).json({
                error: 'Não é possível desativar o próprio usuário',
            });
        }
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
    }
    catch (error) {
        console.error('Erro ao alterar status do usuário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
        });
    }
});
router.put('/:id', auth_1.authenticateToken, auth_1.requireActiveUser, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id);
        const { nome, email, senha, cargo, setor, admin, ativo, niveis, podeVerTodosOrcamentos, usuariosPermitidos } = req.body;
        if (!req.user.admin && req.user.id !== userId) {
            return res.status(403).json({
                error: 'Acesso negado',
            });
        }
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { id: userId },
        });
        if (!usuarioExistente) {
            return res.status(404).json({
                error: 'Usuário não encontrado',
            });
        }
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
        const dadosAtualizacao = {};
        if (nome)
            dadosAtualizacao.nome = nome;
        if (email)
            dadosAtualizacao.email = email;
        if (cargo)
            dadosAtualizacao.cargo = cargo;
        if (setor)
            dadosAtualizacao.setor = setor;
        if (typeof ativo === 'boolean')
            dadosAtualizacao.ativo = ativo;
        if (req.user.admin && typeof admin === 'boolean')
            dadosAtualizacao.admin = admin;
        if (req.user.admin && typeof podeVerTodosOrcamentos === 'boolean')
            dadosAtualizacao.podeVerTodosOrcamentos = podeVerTodosOrcamentos;
        if (senha) {
            dadosAtualizacao.senha = await bcryptjs_1.default.hash(senha, 10);
        }
        const usuario = await prisma.usuario.update({
            where: { id: userId },
            data: {
                ...dadosAtualizacao,
                usuariosPermitidos: req.user.admin && usuariosPermitidos && Array.isArray(usuariosPermitidos)
                    ? { set: usuariosPermitidos.map((id) => ({ id })) }
                    : undefined,
            },
            include: {
                usuariosPermitidos: { select: { id: true, nome: true, email: true } },
            },
        });
        if (req.user.admin && niveis && Array.isArray(niveis)) {
            await prisma.usuarioNivel.deleteMany({
                where: { usuarioId: userId },
            });
            await Promise.all(niveis.map((nivelId) => prisma.usuarioNivel.create({
                data: {
                    usuarioId: userId,
                    nivelId,
                },
            })));
        }
        const { senha: _, ...usuarioSemSenha } = usuario;
        res.json(usuarioSemSenha);
    }
    catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
        });
    }
});
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id);
        const usuario = await prisma.usuario.findUnique({
            where: { id: userId },
        });
        if (!usuario) {
            return res.status(404).json({
                error: 'Usuário não encontrado',
            });
        }
        if (req.user.id === userId) {
            return res.status(400).json({
                error: 'Não é possível deletar o próprio usuário',
            });
        }
        await prisma.usuario.delete({
            where: { id: userId },
        });
        res.json({
            message: 'Usuário deletado com sucesso',
        });
    }
    catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
        });
    }
});
router.get('/:id/fluxo', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
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
    }
    catch (error) {
        console.error('Erro ao listar fluxo do usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
router.post('/:id/fluxo', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const usuarioId = parseInt(req.params.id);
        const { niveis } = req.body;
        await prisma.fluxoUsuario.deleteMany({ where: { usuarioId } });
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
    }
    catch (error) {
        console.error('Erro ao criar fluxo do usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
router.delete('/:id/fluxo', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const usuarioId = parseInt(req.params.id);
        await prisma.fluxoUsuario.deleteMany({ where: { usuarioId } });
        res.json({ message: 'Fluxo personalizado removido com sucesso' });
    }
    catch (error) {
        console.error('Erro ao deletar fluxo do usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map
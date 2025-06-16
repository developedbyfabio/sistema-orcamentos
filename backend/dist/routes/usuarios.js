"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
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
            },
            orderBy: {
                nome: 'asc',
            },
        });
        res.json(usuarios);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Erro interno do servidor',
        });
    }
});
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { nome, email, senha, cargo, setor, admin, podeVerTodosOrcamentos } = req.body;
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email },
        });
        if (usuarioExistente) {
            return res.status(400).json({
                error: 'Já existe um usuário com este email',
            });
        }
        const senhaHash = await bcrypt_1.default.hash(senha, 10);
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Erro interno do servidor',
        });
    }
});
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = parseInt(id);
        const { nome, email, senha, cargo, setor, ativo, admin, podeVerTodosOrcamentos } = req.body;
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { id: usuarioId },
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
                    error: 'Já existe um usuário com este email',
                });
            }
        }
        const dadosAtualizacao = {
            nome,
            email,
            cargo,
            setor,
            ativo,
            admin,
            podeVerTodosOrcamentos,
        };
        if (senha) {
            dadosAtualizacao.senha = await bcrypt_1.default.hash(senha, 10);
        }
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Erro interno do servidor',
        });
    }
});
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = parseInt(id);
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { id: usuarioId },
        });
        if (!usuarioExistente) {
            return res.status(404).json({
                error: 'Usuário não encontrado',
            });
        }
        const orcamentosAssociados = await prisma.orcamento.findFirst({
            where: { solicitanteId: usuarioId },
        });
        if (orcamentosAssociados) {
            return res.status(400).json({
                error: 'Não é possível excluir um usuário que possui orçamentos associados',
            });
        }
        await prisma.usuario.delete({
            where: { id: usuarioId },
        });
        res.json({
            message: 'Usuário excluído com sucesso',
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Erro interno do servidor',
        });
    }
});
exports.default = router;
//# sourceMappingURL=usuarios.js.map
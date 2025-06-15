"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.post('/login', async (req, res) => {
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
        const senhaValida = await bcrypt_1.default.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        const token = jsonwebtoken_1.default.sign({
            userId: usuario.id,
            email: usuario.email,
            admin: usuario.admin
        }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
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
    }
    catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
router.post('/logout', auth_1.authenticateToken, (req, res) => {
    res.json({
        message: 'Logout realizado com sucesso',
    });
});
router.get('/me', auth_1.authenticateToken, async (req, res) => {
    try {
        const authReq = req;
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
    }
    catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
router.get('/verify', auth_1.authenticateToken, (req, res) => {
    res.json({
        valid: true,
        user: req.user,
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map
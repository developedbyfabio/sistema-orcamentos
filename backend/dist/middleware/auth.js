"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireActiveUser = exports.requireAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Token de acesso necessário' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await prisma.usuario.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                nome: true,
                admin: true,
                ativo: true,
            },
        });
        if (!user) {
            res.status(401).json({ error: 'Usuário não encontrado' });
            return;
        }
        if (!user.ativo) {
            res.status(401).json({ error: 'Usuário inativo' });
            return;
        }
        req.user = {
            id: user.id,
            email: user.email,
            nome: user.nome,
            admin: user.admin,
            ativo: user.ativo
        };
        next();
    }
    catch (error) {
        res.status(403).json({ error: 'Token inválido' });
        return;
    }
};
exports.authenticateToken = authenticateToken;
const requireAdmin = (req, res, next) => {
    if (!req.user?.admin) {
        res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireActiveUser = (req, res, next) => {
    if (!req.user?.ativo) {
        res.status(403).json({ error: 'Usuário inativo' });
        return;
    }
    next();
};
exports.requireActiveUser = requireActiveUser;
//# sourceMappingURL=auth.js.map
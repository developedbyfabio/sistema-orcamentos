"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Excluindo aprovações...');
    await prisma.aprovacao.deleteMany();
    console.log('Excluindo rejeições...');
    await prisma.rejeicao.deleteMany();
    console.log('Excluindo orçamentos...');
    await prisma.orcamento.deleteMany();
    console.log('Todos os orçamentos, aprovações e rejeições foram excluídos!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=deleteAllOrcamentos.js.map
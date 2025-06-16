import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
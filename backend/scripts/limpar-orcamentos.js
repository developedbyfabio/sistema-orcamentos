const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function limparOrcamentos() {
  try {
    console.log('🧹 Iniciando limpeza do banco de dados...');

    // Deletar aprovações
    console.log('📝 Deletando aprovações...');
    const aprovaçõesDeletadas = await prisma.aprovacao.deleteMany({});
    console.log(`✅ ${aprovaçõesDeletadas.count} aprovações deletadas`);

    // Deletar rejeições
    console.log('❌ Deletando rejeições...');
    const rejeiçõesDeletadas = await prisma.rejeicao.deleteMany({});
    console.log(`✅ ${rejeiçõesDeletadas.count} rejeições deletadas`);

    // Deletar orçamentos
    console.log('📋 Deletando orçamentos...');
    const orcamentosDeletados = await prisma.orcamento.deleteMany({});
    console.log(`✅ ${orcamentosDeletados.count} orçamentos deletados`);

    console.log('🎉 Limpeza concluída com sucesso!');
    console.log('📊 Banco de dados limpo para novos testes.');

  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

limparOrcamentos(); 
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.aprovacao.deleteMany();
  await prisma.rejeicao.deleteMany();
  await prisma.orcamento.deleteMany();
  await prisma.usuarioNivel.deleteMany();
  await prisma.fluxoUsuario.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.nivel.deleteMany();
  await prisma.filial.deleteMany();

  console.log('✅ Dados limpos');

  // Seed das filiais padrão
  await prisma.filial.deleteMany();
  await prisma.filial.createMany({
    data: [
      {
        nome: 'JCB – SÃO JOSÉ DOS PINHAIS/PR',
        endereco: 'R. José Semes, 17680 Itália - São José dos Pinhais',
        telefone: '(41) 3380-8800',
        ativo: true,
      },
      {
        nome: 'MATRIZ – CURITIBA/PR',
        endereco: 'R. José Semes, 17680 Itália - São José dos Pinhais',
        telefone: '(41) 3386-8100',
        ativo: true,
      },
      {
        nome: 'CASCAVEL/PR',
        endereco: 'Avenida Aracy Tanaka Biazetto, 15532 Santos Dumont',
        telefone: '(45) 3219-3000',
        ativo: true,
      },
      {
        nome: 'MARINGÁ/PR',
        endereco: 'Rod.do Café Gov. Ney Braga BR 376 Km 188 Marialva',
        telefone: '(44) 3123-0050',
        ativo: true,
      },
      {
        nome: 'ITAJAÍ/SC',
        endereco: 'BR 101, Km 112, 750 Salseiros',
        telefone: '(47) 3241-8600',
        ativo: true,
      },
      {
        nome: 'CHAPECÓ/SC',
        endereco: 'Rod. Plínio Arlindo de Nês, SN Belverde',
        telefone: '(49) 3358-9300',
        ativo: true,
      },
      {
        nome: 'PORTO ALEGRE/RS',
        endereco: 'R. Irmão Félix Roberto, 65 Humaitá',
        telefone: '(51) 3357-7300',
        ativo: true,
      },
      {
        nome: 'BELO HORIZONTE/MG',
        endereco: 'R. Pôrto, 707 São Francisco',
        telefone: '(31) 3439-1800',
        ativo: true,
      },
      {
        nome: 'GOIÂNIA/GO',
        endereco: 'Rua da Lavoura, 41 Santa Genoveva',
        telefone: '(62) 3232-3400',
        ativo: true,
      },
      {
        nome: 'BELÉM/PA',
        endereco: 'BR 316, KM 05 - 4800 Ananindeua',
        telefone: '(91) 2122-4300',
        ativo: true,
      },
      {
        nome: 'CUIABÁ/MT',
        endereco: 'Av. Governador Júlio Campos, 5280 Várzea Grande',
        telefone: '(65) 3388-0100',
        ativo: true,
      },
      {
        nome: 'SINOP/MT',
        endereco: 'Rua João Pedro Moreira de Carvalho, 5826 Jardim Safira',
        telefone: '(66) 3211-2930',
        ativo: true,
      },
    ],
  });

  console.log('✅ Filiais criadas');

  // Níveis do banco
  await prisma.nivel.createMany({
    data: [
      { id: 5, nome: 'Solicitante', prioridade: 1, podeCriarOrcamento: true, podeAprovar: false, nivelFinal: false, ativo: true },
      { id: 6, nome: 'Nivel 2', prioridade: 2, podeCriarOrcamento: true, podeAprovar: true, nivelFinal: false, ativo: true },
      { id: 7, nome: 'Nivel 3', prioridade: 3, podeCriarOrcamento: false, podeAprovar: true, nivelFinal: false, ativo: true },
      { id: 8, nome: 'Compras', prioridade: 4, podeCriarOrcamento: true, podeAprovar: true, nivelFinal: true, ativo: true },
      { id: 10, nome: 'Nivel 5', prioridade: 5, podeCriarOrcamento: false, podeAprovar: true, nivelFinal: true, ativo: true },
    ],
    skipDuplicates: true
  });

  console.log('✅ Níveis criados');

  // Usuários do banco
  await prisma.usuario.createMany({
    data: [
      { id: 8, nome: 'Administrador', email: 'admin@empresa.com', senha: '$2a$10$/lbFrJ.WxkDplBUVbKJs.eChPIfraoUb3igB.f1IvQCuMrQnbDCvC', cargo: 'Administrador', setor: 'TI', ativo: true, admin: true },
      { id: 12, nome: 'Daniel Enns', email: 'danielenns@engepecas.com.br', senha: '$2a$10$4eblwGoiRmr2.fdwoeRL0uP42dbCrz376KnXVAn1qpNiN1ihHw1I.', cargo: 'Analista de T.I', setor: 'DTI', ativo: true, admin: false },
      { id: 13, nome: 'Fabio Henrique de Almeida Lemes', email: 'fabio9384@gmail.com', senha: '$2a$10$CsRAo0drJaY0S.nfn9..w.Qiu8UV1O6pzkGkQpcWcrS777pTnVsim', cargo: 'Assistente de T.I', setor: 'DTI', ativo: true, admin: false },
      { id: 9, nome: 'Fabio Mota', email: 'fabiomota@engepecas.com.br', senha: '$2a$10$c.QSBvF1i3Mfjvy2yFeoYeDhS3yQ7Rx3oISKFD09OYknrTIg24.xW', cargo: 'Lider de T.I', setor: 'DTI', ativo: true, admin: false },
      { id: 10, nome: 'Gustavo Guia', email: 'gustavoguia@engepecas.com.br', senha: '$2a$10$DtVDYOgEF8BbHcA.OTCTo.pj.zNj/ELg839mKwi5Ulj4obYkN0n36', cargo: 'Diretor de Tecnologia', setor: 'Liderança', ativo: true, admin: false },
      { id: 14, nome: 'Nivea Guia', email: 'niveaguia@engepecas.com.br', senha: '$2a$10$kIN98u210JeG0XfMQXDvS.GXIfUo13GSVXrn34YXZ0.2/Qd5Igc5W', cargo: 'Diretora Geral', setor: 'Liderança', ativo: true, admin: false },
      { id: 11, nome: 'Claudia May', email: 'claudiamay@engepecas.com.br', senha: '$2a$10$gf0nfJX29z3ubodz3sjl0eLMLXcdFRi1VpcC4etBI8dDGMFED23gC', cargo: 'Comprador', setor: 'Compras', ativo: true, admin: false },
    ],
    skipDuplicates: true
  });

  console.log('✅ Usuários criados');

  // Associar usuários aos níveis
  await prisma.usuarioNivel.createMany({
    data: [
      { usuarioId: 12, nivelId: 5 },
      { usuarioId: 13, nivelId: 6 },
      { usuarioId: 11, nivelId: 8 },
      { usuarioId: 8, nivelId: 5 },
      { usuarioId: 9, nivelId: 6 },
    ]
  });

  console.log('✅ Usuários associados aos níveis');

  // Criar orçamentos de teste
  const orcamento1 = await prisma.orcamento.create({
    data: {
      titulo: 'Notebook para equipe de vendas',
      descricao: 'Aquisição de 5 notebooks para a equipe de vendas',
      valor: 25000.00,
      fornecedor: 'Dell',
      links: JSON.stringify(['https://www.dell.com/notebook1']),
      fotos: JSON.stringify(['notebook1.jpg']),
      anexos: JSON.stringify(['orcamento_dell.pdf']),
      status: 'PENDENTE',
      solicitanteId: 8,
      filialId: 1,
      nivelAtualId: 6
    }
  });

  const orcamento2 = await prisma.orcamento.create({
    data: {
      titulo: 'Móveis para escritório',
      descricao: 'Conjunto de móveis para nova sala de reuniões',
      valor: 15000.00,
      fornecedor: 'Móveis ABC',
      links: JSON.stringify(['https://www.moveisabc.com/conjunto1']),
      fotos: JSON.stringify(['moveis1.jpg', 'moveis2.jpg']),
      anexos: JSON.stringify(['orcamento_moveis.pdf']),
      status: 'APROVADO',
      solicitanteId: 13,
      filialId: 2,
      nivelAtualId: 7
    }
  });

  const orcamento3 = await prisma.orcamento.create({
    data: {
      titulo: 'Software de gestão',
      descricao: 'Licença anual do software de gestão empresarial',
      valor: 50000.00,
      fornecedor: 'Microsoft',
      links: JSON.stringify(['https://www.microsoft.com/office365']),
      fotos: JSON.stringify(['software1.jpg']),
      anexos: JSON.stringify(['proposta_microsoft.pdf']),
      status: 'AGUARDANDO_COMPRA',
      solicitanteId: 12,
      filialId: 1,
      nivelAtualId: 8
    }
  });

  console.log('✅ Orçamentos de teste criados');

  // Criar algumas aprovações
  await prisma.aprovacao.create({
    data: {
      orcamentoId: orcamento2.id,
      aprovadorId: 12,
      observacoes: 'Aprovado conforme orçamento apresentado'
    }
  });

  await prisma.aprovacao.create({
    data: {
      orcamentoId: orcamento3.id,
      aprovadorId: 12,
      observacoes: 'Aprovado para compra'
    }
  });

  await prisma.aprovacao.create({
    data: {
      orcamentoId: orcamento3.id,
      aprovadorId: 9,
      observacoes: 'Aprovado pela diretoria'
    }
  });

  console.log('✅ Aprovações criadas');

  console.log('🎉 Seed concluído com sucesso!');
  console.log('');
  console.log('📋 Dados criados:');
  console.log(`- ${await prisma.filial.count()} filiais`);
  console.log(`- ${await prisma.nivel.count()} níveis`);
  console.log(`- ${await prisma.usuario.count()} usuários`);
  console.log(`- ${await prisma.orcamento.count()} orçamentos`);
  console.log('');
  console.log('🔑 Credenciais de acesso:');
  console.log('Admin: admin@empresa.com / 123456');
  console.log('Gerente: joao@empresa.com / 123456');
  console.log('Diretora: maria@empresa.com / 123456');
  console.log('Comprador: pedro@empresa.com / 123456');
  console.log('Solicitante 1: ana@empresa.com / 123456');
  console.log('Solicitante 2: carlos@empresa.com / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
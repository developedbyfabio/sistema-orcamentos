import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes na ordem correta (respeitando foreign keys)
  await prisma.aprovacao.deleteMany();
  await prisma.rejeicao.deleteMany();
  await prisma.orcamento.deleteMany();
  await prisma.regraFluxo.deleteMany();
  await prisma.fluxoUsuario.deleteMany();
  await prisma.usuarioNivel.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.nivel.deleteMany();
  await prisma.filial.deleteMany();

  console.log('✅ Dados limpos');

  // Seed das filiais padrão
  await prisma.filial.createMany({
    data: [
      {
        nome: 'BELÉM/PA',
        endereco: 'BR 316, KM 05 - 4800 Ananindeua',
        telefone: '(91) 2122-4300',
        ativo: true,
      },
      {
        nome: 'BELO HORIZONTE/MG',
        endereco: 'R. Pôrto, 707 São Francisco',
        telefone: '(31) 3439-1800',
        ativo: true,
      },
      {
        nome: 'CASCAVEL/PR',
        endereco: 'Avenida Aracy Tanaka Biazetto, 15532 Santos Dumont',
        telefone: '(45) 3219-3000',
        ativo: true,
      },
      {
        nome: 'CHAPECÓ/SC',
        endereco: 'Rod. Plínio Arlindo de Nês, SN Belverde',
        telefone: '(49) 3358-9300',
        ativo: true,
      },
	  {
        nome: 'CUIABÁ/MT',
        endereco: 'Av. Governador Júlio Campos, 5280 Várzea Grande',
        telefone: '(65) 3388-0100',
        ativo: true,
      },
	  {
        nome: 'GOIÂNIA/GO',
        endereco: 'Rua da Lavoura, 41 Santa Genoveva',
        telefone: '(62) 3232-3400',
        ativo: true,
      },
	  {
        nome: 'ITAJAÍ/SC',
        endereco: 'BR 101, Km 112, 750 Salseiros',
        telefone: '(47) 3241-8600',
        ativo: true,
      },
	  {
        nome: 'JCB – SÃO JOSÉ DOS PINHAIS/PR',
        endereco: 'R. José Semes, 17680 Itália - São José dos Pinhais',
        telefone: '(41) 3380-8800',
        ativo: true,
      },
	  {
        nome: 'MARINGÁ/PR',
        endereco: 'Rod.do Café Gov. Ney Braga BR 376 Km 188 Marialva',
        telefone: '(44) 3123-0050',
        ativo: true,
      },
	  {
        nome: 'MATRIZ – CURITIBA/PR',
        endereco: 'R. José Semes, 17680 Itália - São José dos Pinhais',
        telefone: '(41) 3386-8100',
        ativo: true,
      },
	  {
        nome: 'PORTO ALEGRE/RS',
        endereco: 'R. Irmão Félix Roberto, 65 Humaitá',
        telefone: '(51) 3357-7300',
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
      { id: 1, nome: 'Solicitante', prioridade: 1, podeCriarOrcamento: true, podeAprovar: false, nivelFinal: false, ativo: true },
      { id: 2, nome: 'Nivel 2', prioridade: 2, podeCriarOrcamento: true, podeAprovar: true, nivelFinal: false, ativo: true },
      { id: 3, nome: 'Nivel 3', prioridade: 3, podeCriarOrcamento: false, podeAprovar: true, nivelFinal: false, ativo: true },
      { id: 4, nome: 'Compras_Aprovação', prioridade: 4, podeCriarOrcamento: true, podeAprovar: true, nivelFinal: false, ativo: true },
      { id: 5, nome: 'Nivel 5', prioridade: 5, podeCriarOrcamento: false, podeAprovar: true, nivelFinal: false, ativo: true },
      { id: 6, nome: 'Compras', prioridade: 6, podeCriarOrcamento: false, podeAprovar: false, nivelFinal: true, ativo: true },
    ],
    skipDuplicates: true
  });

  console.log('✅ Níveis criados');

  // Usuários do banco
  await prisma.usuario.createMany({
    data: [
      { id: 1, nome: 'Administrador', email: 'admin@empresa.com', senha: '$2a$10$/lbFrJ.WxkDplBUVbKJs.eChPIfraoUb3igB.f1IvQCuMrQnbDCvC', cargo: 'Administrador', setor: 'TI', ativo: true, admin: true },
      { id: 2, nome: 'Daniel Enns', email: 'danielenns@engepecas.com.br', senha: '$2a$10$4eblwGoiRmr2.fdwoeRL0uP42dbCrz376KnXVAn1qpNiN1ihHw1I.', cargo: 'Analista de T.I', setor: 'DTI', ativo: true, admin: false },
      { id: 3, nome: 'Fabio Henrique de Almeida Lemes', email: 'fabio9384@gmail.com', senha: '$2a$10$CsRAo0drJaY0S.nfn9..w.Qiu8UV1O6pzkGkQpcWcrS777pTnVsim', cargo: 'Assistente de T.I', setor: 'DTI', ativo: true, admin: false },
      { id: 4, nome: 'Fabio Mota', email: 'fabiomota@engepecas.com.br', senha: '$2a$10$c.QSBvF1i3Mfjvy2yFeoYeDhS3yQ7Rx3oISKFD09OYknrTIg24.xW', cargo: 'Lider de T.I', setor: 'DTI', ativo: true, admin: false },
      { id: 5, nome: 'Gustavo Guia', email: 'gustavoguia@engepecas.com.br', senha: '$2a$10$DtVDYOgEF8BbHcA.OTCTo.pj.zNj/ELg839mKwi5Ulj4obYkN0n36', cargo: 'Diretor de Tecnologia', setor: 'Liderança', ativo: true, admin: false },
      { id: 6, nome: 'Nivea Guia', email: 'niveaguia@engepecas.com.br', senha: '$2a$10$kIN98u210JeG0XfMQXDvS.GXIfUo13GSVXrn34YXZ0.2/Qd5Igc5W', cargo: 'Diretora Geral', setor: 'Liderança', ativo: true, admin: false },
      { id: 7, nome: 'Claudia May', email: 'claudiamay@engepecas.com.br', senha: '$2a$10$gf0nfJX29z3ubodz3sjl0eLMLXcdFRi1VpcC4etBI8dDGMFED23gC', cargo: 'Comprador', setor: 'Compras', ativo: true, admin: false },
    ],
    skipDuplicates: true
  });

  console.log('✅ Usuários criados');

  // Associar usuários aos níveis
  await prisma.usuarioNivel.createMany({
    data: [
      { usuarioId: 2, nivelId: 1 },
      { usuarioId: 3, nivelId: 1 },
      { usuarioId: 4, nivelId: 2 },
      { usuarioId: 5, nivelId: 3 },
      { usuarioId: 6, nivelId: 5 },
      { usuarioId: 7, nivelId: 4 },
    ]
  });

  console.log('✅ Usuários associados aos níveis');
  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
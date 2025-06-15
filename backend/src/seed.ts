import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar níveis
  console.log('📊 Criando níveis...');
  const niveis = await Promise.all([
    prisma.nivel.create({
      data: {
        nome: 'Nível 1 - Solicitação',
        prioridade: 1,
        podeCriarOrcamento: true,
        podeAprovar: false,
        nivelFinal: false,
      },
    }),
    prisma.nivel.create({
      data: {
        nome: 'Nível 2 - Gerencial',
        prioridade: 2,
        podeCriarOrcamento: true,
        podeAprovar: true,
        nivelFinal: false,
      },
    }),
    prisma.nivel.create({
      data: {
        nome: 'Nível 3 - Financeiro',
        prioridade: 3,
        podeCriarOrcamento: true,
        podeAprovar: true,
        nivelFinal: false,
      },
    }),
    prisma.nivel.create({
      data: {
        nome: 'Nível 4 - Diretoria',
        prioridade: 4,
        podeCriarOrcamento: true,
        podeAprovar: true,
        nivelFinal: false,
      },
    }),
    prisma.nivel.create({
      data: {
        nome: 'Nível 5 - Presidência',
        prioridade: 5,
        podeCriarOrcamento: true,
        podeAprovar: true,
        nivelFinal: false,
      },
    }),
    prisma.nivel.create({
      data: {
        nome: 'Nível 6 - Compras',
        prioridade: 6,
        podeCriarOrcamento: false,
        podeAprovar: false,
        nivelFinal: true,
      },
    }),
  ]);

  // Criar regras de fluxo
  console.log('🔄 Criando regras de fluxo...');
  await Promise.all([
    prisma.regraFluxo.create({
      data: {
        nivelOrigemId: niveis[0].id,
        nivelDestinoId: niveis[1].id,
      },
    }),
    prisma.regraFluxo.create({
      data: {
        nivelOrigemId: niveis[1].id,
        nivelDestinoId: niveis[2].id,
      },
    }),
    prisma.regraFluxo.create({
      data: {
        nivelOrigemId: niveis[2].id,
        nivelDestinoId: niveis[3].id,
      },
    }),
    prisma.regraFluxo.create({
      data: {
        nivelOrigemId: niveis[3].id,
        nivelDestinoId: niveis[4].id,
      },
    }),
    prisma.regraFluxo.create({
      data: {
        nivelOrigemId: niveis[4].id,
        nivelDestinoId: niveis[5].id,
      },
    }),
  ]);

  // Criar filiais
  console.log('🏢 Criando filiais...');
  const filiais = await Promise.all([
    prisma.filial.create({
      data: {
        nome: 'Matriz - São Paulo',
        endereco: 'Av. Paulista, 1000 - São Paulo/SP',
        telefone: '(11) 3000-0000',
      },
    }),
    prisma.filial.create({
      data: {
        nome: 'Filial - Rio de Janeiro',
        endereco: 'Av. Rio Branco, 500 - Rio de Janeiro/RJ',
        telefone: '(21) 3000-0000',
      },
    }),
    prisma.filial.create({
      data: {
        nome: 'Filial - Belo Horizonte',
        endereco: 'Av. Afonso Pena, 2000 - Belo Horizonte/MG',
        telefone: '(31) 3000-0000',
      },
    }),
  ]);

  // Hash da senha padrão
  const senhaHash = await bcrypt.hash('Jgr34eng02@', 10);

  // Criar usuário administrador
  console.log('👑 Criando usuário administrador...');
  const admin = await prisma.usuario.create({
    data: {
      nome: 'Administrador do Sistema',
      email: 'admin@empresa.com',
      senha: senhaHash,
      cargo: 'Administrador',
      setor: 'TI',
      admin: true,
    },
  });

  // Criar usuários de teste para cada nível
  console.log('👥 Criando usuários de teste...');
  const usuarios = await Promise.all([
    prisma.usuario.create({
      data: {
        nome: 'João Silva',
        email: 'usuario1@empresa.com',
        senha: senhaHash,
        cargo: 'Analista',
        setor: 'Operacional',
      },
    }),
    prisma.usuario.create({
      data: {
        nome: 'Maria Santos',
        email: 'usuario2@empresa.com',
        senha: senhaHash,
        cargo: 'Gerente',
        setor: 'Comercial',
      },
    }),
    prisma.usuario.create({
      data: {
        nome: 'Pedro Costa',
        email: 'usuario3@empresa.com',
        senha: senhaHash,
        cargo: 'Analista Financeiro',
        setor: 'Financeiro',
      },
    }),
    prisma.usuario.create({
      data: {
        nome: 'Ana Oliveira',
        email: 'usuario4@empresa.com',
        senha: senhaHash,
        cargo: 'Diretora',
        setor: 'Diretoria',
      },
    }),
    prisma.usuario.create({
      data: {
        nome: 'Carlos Ferreira',
        email: 'usuario5@empresa.com',
        senha: senhaHash,
        cargo: 'Presidente',
        setor: 'Presidência',
      },
    }),
    prisma.usuario.create({
      data: {
        nome: 'Lucia Rodrigues',
        email: 'compras@empresa.com',
        senha: senhaHash,
        cargo: 'Compradora',
        setor: 'Compras',
      },
    }),
  ]);

  // Associar usuários aos níveis
  console.log('🔗 Associando usuários aos níveis...');
  await Promise.all([
    prisma.usuarioNivel.create({
      data: {
        usuarioId: usuarios[0].id,
        nivelId: niveis[0].id,
      },
    }),
    prisma.usuarioNivel.create({
      data: {
        usuarioId: usuarios[1].id,
        nivelId: niveis[1].id,
      },
    }),
    prisma.usuarioNivel.create({
      data: {
        usuarioId: usuarios[2].id,
        nivelId: niveis[2].id,
      },
    }),
    prisma.usuarioNivel.create({
      data: {
        usuarioId: usuarios[3].id,
        nivelId: niveis[3].id,
      },
    }),
    prisma.usuarioNivel.create({
      data: {
        usuarioId: usuarios[4].id,
        nivelId: niveis[4].id,
      },
    }),
    prisma.usuarioNivel.create({
      data: {
        usuarioId: usuarios[5].id,
        nivelId: niveis[5].id,
      },
    }),
  ]);

  // Criar alguns orçamentos de exemplo
  console.log('📋 Criando orçamentos de exemplo...');
  await Promise.all([
    prisma.orcamento.create({
      data: {
        titulo: 'Aquisição de Notebooks',
        descricao: 'Compra de 10 notebooks para equipe de vendas',
        valor: 45000.00,
        fornecedor: 'Dell Brasil',
        links: 'https://www.dell.com/notebooks',
        status: 'PENDENTE',
        solicitanteId: usuarios[0].id,
        filialId: filiais[0].id,
        nivelAtualId: niveis[0].id,
        proximoNivelId: niveis[1].id,
      },
    }),
    prisma.orcamento.create({
      data: {
        titulo: 'Mobiliário para Escritório',
        descricao: 'Mesa e cadeiras ergonômicas para novo setor',
        valor: 15000.00,
        fornecedor: 'Móveis Corporativos Ltda',
        status: 'APROVADO',
        solicitanteId: usuarios[1].id,
        filialId: filiais[1].id,
        nivelAtualId: niveis[5].id,
      },
    }),
    prisma.orcamento.create({
      data: {
        titulo: 'Software de Gestão',
        descricao: 'Licenças para sistema ERP',
        valor: 25000.00,
        fornecedor: 'SAP Brasil',
        status: 'REPROVADO',
        solicitanteId: usuarios[2].id,
        filialId: filiais[0].id,
        nivelAtualId: niveis[2].id,
      },
    }),
  ]);

  console.log('✅ Seed concluído com sucesso!');
  console.log('');
  console.log('📊 Resumo dos dados criados:');
  console.log(`- ${niveis.length} níveis criados`);
  console.log(`- ${filiais.length} filiais criadas`);
  console.log(`- ${usuarios.length + 1} usuários criados (incluindo admin)`);
  console.log('- 3 orçamentos de exemplo criados');
  console.log('');
  console.log('🔑 Credenciais de acesso:');
  console.log('Admin: admin@empresa.com / Jgr34eng02@');
  console.log('Usuários: usuario1@empresa.com até usuario5@empresa.com / Jgr34eng02@');
  console.log('Compras: compras@empresa.com / Jgr34eng02@');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
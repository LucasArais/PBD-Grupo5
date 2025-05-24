const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.cardapioAluno.deleteMany();
  await prisma.cardapioItem.deleteMany();
  await prisma.cardapio.deleteMany();
  await prisma.restricaoAlimentar.deleteMany();
  await prisma.estoque.deleteMany();
  await prisma.ingrediente.deleteMany();
  await prisma.nota.deleteMany();
  await prisma.turmaProfessor.deleteMany();
  await prisma.aluno.deleteMany();
  await prisma.professor.deleteMany();
  await prisma.turma.deleteMany();
  await prisma.usuario.deleteMany();

  // Criar usuário diretor
  const diretor = await prisma.usuario.create({
    data: {
      nome: 'João Silva',
      email: 'diretor@escola.com',
      senha: await bcrypt.hash('123456', 10),
      tipo: 'diretor'
    }
  });

  // Criar turmas
  const turma1 = await prisma.turma.create({
    data: { nome: '1º Ano A' }
  });

  const turma2 = await prisma.turma.create({
    data: { nome: '2º Ano B' }
  });

  const turma3 = await prisma.turma.create({
    data: { nome: '3º Ano C' }
  });

  // Criar professores
  const professor1 = await prisma.usuario.create({
    data: {
      nome: 'Maria Santos',
      email: 'maria@escola.com',
      senha: await bcrypt.hash('123456', 10),
      tipo: 'professor',
      professor: {
        create: {}
      }
    },
    include: {
      professor: true
    }
  });

  const professor2 = await prisma.usuario.create({
    data: {
      nome: 'Carlos Oliveira',
      email: 'carlos@escola.com',
      senha: await bcrypt.hash('123456', 10),
      tipo: 'professor',
      professor: {
        create: {}
      }
    },
    include: {
      professor: true
    }
  });

  const professor3 = await prisma.usuario.create({
    data: {
      nome: 'Ana Costa',
      email: 'ana@escola.com',
      senha: await bcrypt.hash('123456', 10),
      tipo: 'professor',
      professor: {
        create: {}
      }
    },
    include: {
      professor: true
    }
  });

  // Atribuir professores às turmas
  await prisma.turmaProfessor.createMany({
    data: [
      { turma_id: turma1.id, professor_id: professor1.professor.id },
      { turma_id: turma1.id, professor_id: professor2.professor.id },
      { turma_id: turma2.id, professor_id: professor2.professor.id },
      { turma_id: turma2.id, professor_id: professor3.professor.id },
      { turma_id: turma3.id, professor_id: professor1.professor.id },
      { turma_id: turma3.id, professor_id: professor3.professor.id }
    ]
  });

  // Criar alunos
  const alunos = [
    { nome: 'Pedro Almeida', email: 'pedro@aluno.com', turma_id: turma1.id },
    { nome: 'Julia Ferreira', email: 'julia@aluno.com', turma_id: turma1.id },
    { nome: 'Lucas Rodrigues', email: 'lucas@aluno.com', turma_id: turma1.id },
    { nome: 'Mariana Lima', email: 'mariana@aluno.com', turma_id: turma2.id },
    { nome: 'Gabriel Santos', email: 'gabriel@aluno.com', turma_id: turma2.id },
    { nome: 'Isabela Costa', email: 'isabela@aluno.com', turma_id: turma2.id },
    { nome: 'Rafael Souza', email: 'rafael@aluno.com', turma_id: turma3.id },
    { nome: 'Camila Oliveira', email: 'camila@aluno.com', turma_id: turma3.id },
    { nome: 'Bruno Silva', email: 'bruno@aluno.com', turma_id: turma3.id }
  ];

  const alunosCriados = [];
  for (const alunoData of alunos) {
    const aluno = await prisma.usuario.create({
      data: {
        nome: alunoData.nome,
        email: alunoData.email,
        senha: await bcrypt.hash('123456', 10),
        tipo: 'aluno',
        aluno: {
          create: {
            turma_id: alunoData.turma_id
          }
        }
      },
      include: {
        aluno: true
      }
    });
    alunosCriados.push(aluno);
  }

  // Criar algumas notas de exemplo
  const disciplinas = ['Matemática', 'Português', 'História', 'Geografia', 'Ciências'];
  
  for (const aluno of alunosCriados) {
    // Cada aluno terá notas em 2-3 disciplinas aleatórias
    const disciplinasAluno = disciplinas.slice(0, Math.floor(Math.random() * 3) + 2);
    
    for (const disciplina of disciplinasAluno) {
      // 1-3 notas por disciplina
      const numNotas = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numNotas; i++) {
        const nota = Math.random() * 10; // Nota entre 0 e 10
        const professorAleatorio = [professor1, professor2, professor3][Math.floor(Math.random() * 3)];
        
        await prisma.nota.create({
          data: {
            aluno_id: aluno.aluno.id,
            professor_id: professorAleatorio.professor.id,
            disciplina,
            valor: parseFloat(nota.toFixed(1))
          }
        });
      }
    }
  }

  // === DADOS DA COZINHA ===

  // Criar ingredientes
  const ingredientes = [
    { nome: 'Arroz', unidade: 'kg', categoria: 'carboidrato' },
    { nome: 'Feijão', unidade: 'kg', categoria: 'proteína' },
    { nome: 'Frango', unidade: 'kg', categoria: 'proteína' },
    { nome: 'Carne Bovina', unidade: 'kg', categoria: 'proteína' },
    { nome: 'Batata', unidade: 'kg', categoria: 'carboidrato' },
    { nome: 'Cenoura', unidade: 'kg', categoria: 'vegetal' },
    { nome: 'Tomate', unidade: 'kg', categoria: 'vegetal' },
    { nome: 'Cebola', unidade: 'kg', categoria: 'vegetal' },
    { nome: 'Alface', unidade: 'unidades', categoria: 'vegetal' },
    { nome: 'Leite', unidade: 'litros', categoria: 'laticínio' },
    { nome: 'Ovos', unidade: 'dúzias', categoria: 'proteína' },
    { nome: 'Pão', unidade: 'unidades', categoria: 'carboidrato' },
    { nome: 'Macarrão', unidade: 'kg', categoria: 'carboidrato' },
    { nome: 'Óleo', unidade: 'litros', categoria: 'gordura' },
    { nome: 'Sal', unidade: 'kg', categoria: 'tempero' }
  ];

  const ingredientesCriados = [];
  for (const ingredienteData of ingredientes) {
    const ingrediente = await prisma.ingrediente.create({
      data: ingredienteData
    });
    ingredientesCriados.push(ingrediente);
  }

  // Adicionar itens ao estoque
  for (const ingrediente of ingredientesCriados) {
    const quantidade = Math.random() * 50 + 10; // Entre 10 e 60
    const preco = Math.random() * 20 + 5; // Entre 5 e 25
    const diasAtras = Math.floor(Math.random() * 30); // Até 30 dias atrás
    const dataCompra = new Date();
    dataCompra.setDate(dataCompra.getDate() - diasAtras);
    
    const diasValidade = Math.floor(Math.random() * 60) + 30; // Entre 30 e 90 dias
    const dataValidade = new Date();
    dataValidade.setDate(dataValidade.getDate() + diasValidade);

    await prisma.estoque.create({
      data: {
        ingrediente_id: ingrediente.id,
        quantidade: parseFloat(quantidade.toFixed(2)),
        preco_unitario: parseFloat(preco.toFixed(2)),
        data_compra: dataCompra,
        data_validade: dataValidade,
        fornecedor: ['Fornecedor A', 'Fornecedor B', 'Fornecedor C'][Math.floor(Math.random() * 3)]
      }
    });
  }

  // Criar cardápios
  const hoje = new Date();
  const cardapios = [
    {
      nome: 'Almoço Tradicional',
      data: hoje,
      tipo_refeicao: 'almoço',
      itens: [
        { ingrediente: 'Arroz', quantidade: 2.0 },
        { ingrediente: 'Feijão', quantidade: 1.5 },
        { ingrediente: 'Frango', quantidade: 3.0 },
        { ingrediente: 'Batata', quantidade: 2.0 },
        { ingrediente: 'Cenoura', quantidade: 1.0 }
      ]
    },
    {
      nome: 'Café da Manhã Nutritivo',
      data: hoje,
      tipo_refeicao: 'café da manhã',
      itens: [
        { ingrediente: 'Pão', quantidade: 20 },
        { ingrediente: 'Leite', quantidade: 3.0 },
        { ingrediente: 'Ovos', quantidade: 2 }
      ]
    },
    {
      nome: 'Lanche da Tarde',
      data: hoje,
      tipo_refeicao: 'lanche',
      itens: [
        { ingrediente: 'Pão', quantidade: 15 },
        { ingrediente: 'Leite', quantidade: 2.0 }
      ]
    }
  ];

  for (const cardapioData of cardapios) {
    const cardapio = await prisma.cardapio.create({
      data: {
        nome: cardapioData.nome,
        data: cardapioData.data,
        tipo_refeicao: cardapioData.tipo_refeicao
      }
    });

    // Adicionar itens ao cardápio
    for (const item of cardapioData.itens) {
      const ingrediente = ingredientesCriados.find(i => i.nome === item.ingrediente);
      if (ingrediente) {
        await prisma.cardapioItem.create({
          data: {
            cardapio_id: cardapio.id,
            ingrediente_id: ingrediente.id,
            quantidade: item.quantidade
          }
        });
      }
    }
  }

  // Adicionar algumas restrições alimentares
  const restricoes = [
    { aluno: 'Pedro Almeida', tipo: 'alergia', descricao: 'Alergia a amendoim' },
    { aluno: 'Julia Ferreira', tipo: 'intolerância', descricao: 'Intolerância à lactose' },
    { aluno: 'Gabriel Santos', tipo: 'preferência', descricao: 'Vegetariano' }
  ];

  for (const restricaoData of restricoes) {
    const alunoUsuario = alunosCriados.find(a => a.nome === restricaoData.aluno);
    if (alunoUsuario) {
      await prisma.restricaoAlimentar.create({
        data: {
          aluno_id: alunoUsuario.aluno.id,
          tipo: restricaoData.tipo,
          descricao: restricaoData.descricao
        }
      });
    }
  }

  console.log('Seed concluído com sucesso!');
  console.log('\n=== USUÁRIOS CRIADOS ===');
  console.log('Diretor:');
  console.log('  Email: diretor@escola.com');
  console.log('  Senha: 123456');
  console.log('\nProfessores:');
  console.log('  Email: maria@escola.com - Senha: 123456');
  console.log('  Email: carlos@escola.com - Senha: 123456');
  console.log('  Email: ana@escola.com - Senha: 123456');
  console.log('\nAlunos (todos com senha: 123456):');
  alunos.forEach(aluno => {
    console.log(`  Email: ${aluno.email}`);
  });
}

main()
  .catch((e) => {
    console.error('Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Cadastrar professor
router.post('/professores', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    // Verificar se email já existe
    const usuarioExistente = await req.prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário e professor
    const usuario = await req.prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        tipo: 'professor',
        professor: {
          create: {}
        }
      },
      include: {
        professor: true
      }
    });

    const { senha: _, ...usuarioSemSenha } = usuario;
    res.status(201).json(usuarioSemSenha);
  } catch (error) {
    console.error('Erro ao cadastrar professor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Cadastrar aluno
router.post('/alunos', async (req, res) => {
  try {
    const { nome, email, senha, turma_id } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    // Verificar se email já existe
    const usuarioExistente = await req.prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário e aluno
    const usuario = await req.prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        tipo: 'aluno',
        aluno: {
          create: {
            turma_id: turma_id || null
          }
        }
      },
      include: {
        aluno: {
          include: {
            turma: true
          }
        }
      }
    });

    const { senha: _, ...usuarioSemSenha } = usuario;
    res.status(201).json(usuarioSemSenha);
  } catch (error) {
    console.error('Erro ao cadastrar aluno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar turma
router.post('/turmas', async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'Nome da turma é obrigatório' });
    }

    const turma = await req.prisma.turma.create({
      data: { nome }
    });

    res.status(201).json(turma);
  } catch (error) {
    console.error('Erro ao criar turma:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar turmas
router.get('/turmas', async (req, res) => {
  try {
    const turmas = await req.prisma.turma.findMany({
      include: {
        alunos: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            }
          }
        },
        professores: {
          include: {
            professor: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    nome: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    res.json(turmas);
  } catch (error) {
    console.error('Erro ao listar turmas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar professores
router.get('/professores', async (req, res) => {
  try {
    const professores = await req.prisma.professor.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        turmas: {
          include: {
            turma: true
          }
        }
      }
    });

    res.json(professores);
  } catch (error) {
    console.error('Erro ao listar professores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar alunos
router.get('/alunos', async (req, res) => {
  try {
    const alunos = await req.prisma.aluno.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        turma: true
      }
    });

    res.json(alunos);
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atribuir professor a turma
router.post('/turmas/:turmaId/professores', async (req, res) => {
  try {
    const { turmaId } = req.params;
    const { professor_id } = req.body;

    if (!professor_id) {
      return res.status(400).json({ error: 'ID do professor é obrigatório' });
    }

    // Verificar se a atribuição já existe
    const atribuicaoExistente = await req.prisma.turmaProfessor.findFirst({
      where: {
        turma_id: parseInt(turmaId),
        professor_id: parseInt(professor_id)
      }
    });

    if (atribuicaoExistente) {
      return res.status(400).json({ error: 'Professor já atribuído a esta turma' });
    }

    const atribuicao = await req.prisma.turmaProfessor.create({
      data: {
        turma_id: parseInt(turmaId),
        professor_id: parseInt(professor_id)
      },
      include: {
        turma: true,
        professor: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(atribuicao);
  } catch (error) {
    console.error('Erro ao atribuir professor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

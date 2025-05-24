const express = require('express');
const router = express.Router();

// Listar turmas do professor
router.get('/:professorId/turmas', async (req, res) => {
  try {
    const { professorId } = req.params;

    const turmas = await req.prisma.turmaProfessor.findMany({
      where: {
        professor_id: parseInt(professorId)
      },
      include: {
        turma: {
          include: {
            alunos: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    nome: true,
                    email: true
                  }
                },
                notas: {
                  where: {
                    professor_id: parseInt(professorId)
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
    console.error('Erro ao listar turmas do professor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Lançar nota para aluno
router.post('/notas', async (req, res) => {
  try {
    const { aluno_id, professor_id, disciplina, valor } = req.body;

    if (!aluno_id || !professor_id || !disciplina || valor === undefined) {
      return res.status(400).json({ 
        error: 'Aluno ID, Professor ID, disciplina e valor são obrigatórios' 
      });
    }

    if (valor < 0 || valor > 10) {
      return res.status(400).json({ 
        error: 'Nota deve estar entre 0 e 10' 
      });
    }

    const nota = await req.prisma.nota.create({
      data: {
        aluno_id: parseInt(aluno_id),
        professor_id: parseInt(professor_id),
        disciplina,
        valor: parseFloat(valor)
      },
      include: {
        aluno: {
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

    res.status(201).json(nota);
  } catch (error) {
    console.error('Erro ao lançar nota:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar notas lançadas pelo professor
router.get('/:professorId/notas', async (req, res) => {
  try {
    const { professorId } = req.params;

    const notas = await req.prisma.nota.findMany({
      where: {
        professor_id: parseInt(professorId)
      },
      include: {
        aluno: {
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
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.json(notas);
  } catch (error) {
    console.error('Erro ao listar notas do professor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar nota
router.put('/notas/:notaId', async (req, res) => {
  try {
    const { notaId } = req.params;
    const { valor, disciplina } = req.body;

    if (valor !== undefined && (valor < 0 || valor > 10)) {
      return res.status(400).json({ 
        error: 'Nota deve estar entre 0 e 10' 
      });
    }

    const dadosAtualizacao = {};
    if (valor !== undefined) dadosAtualizacao.valor = parseFloat(valor);
    if (disciplina) dadosAtualizacao.disciplina = disciplina;

    const nota = await req.prisma.nota.update({
      where: {
        id: parseInt(notaId)
      },
      data: dadosAtualizacao,
      include: {
        aluno: {
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

    res.json(nota);
  } catch (error) {
    console.error('Erro ao atualizar nota:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar nota
router.delete('/notas/:notaId', async (req, res) => {
  try {
    const { notaId } = req.params;

    await req.prisma.nota.delete({
      where: {
        id: parseInt(notaId)
      }
    });

    res.json({ message: 'Nota deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar nota:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

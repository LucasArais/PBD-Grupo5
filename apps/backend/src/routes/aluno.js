const express = require('express');
const router = express.Router();

// Visualizar informações do aluno
router.get('/:alunoId/perfil', async (req, res) => {
  try {
    const { alunoId } = req.params;

    const aluno = await req.prisma.aluno.findUnique({
      where: {
        id: parseInt(alunoId)
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true
          }
        },
        turma: {
          include: {
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
        }
      }
    });

    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    res.json(aluno);
  } catch (error) {
    console.error('Erro ao buscar perfil do aluno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Visualizar notas do aluno
router.get('/:alunoId/notas', async (req, res) => {
  try {
    const { alunoId } = req.params;

    const notas = await req.prisma.nota.findMany({
      where: {
        aluno_id: parseInt(alunoId)
      },
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
      },
      orderBy: [
        { disciplina: 'asc' },
        { created_at: 'desc' }
      ]
    });

    // Agrupar notas por disciplina
    const notasPorDisciplina = notas.reduce((acc, nota) => {
      if (!acc[nota.disciplina]) {
        acc[nota.disciplina] = [];
      }
      acc[nota.disciplina].push(nota);
      return acc;
    }, {});

    // Calcular média por disciplina
    const resumo = Object.keys(notasPorDisciplina).map(disciplina => {
      const notasDisciplina = notasPorDisciplina[disciplina];
      const soma = notasDisciplina.reduce((sum, nota) => sum + nota.valor, 0);
      const media = soma / notasDisciplina.length;
      
      return {
        disciplina,
        notas: notasDisciplina,
        media: parseFloat(media.toFixed(2)),
        totalNotas: notasDisciplina.length
      };
    });

    res.json({
      notas,
      resumoPorDisciplina: resumo
    });
  } catch (error) {
    console.error('Erro ao buscar notas do aluno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Visualizar colegas de turma
router.get('/:alunoId/colegas', async (req, res) => {
  try {
    const { alunoId } = req.params;

    // Primeiro, buscar a turma do aluno
    const aluno = await req.prisma.aluno.findUnique({
      where: {
        id: parseInt(alunoId)
      },
      select: {
        turma_id: true
      }
    });

    if (!aluno || !aluno.turma_id) {
      return res.json([]);
    }

    // Buscar todos os alunos da mesma turma, exceto o próprio aluno
    const colegas = await req.prisma.aluno.findMany({
      where: {
        turma_id: aluno.turma_id,
        id: {
          not: parseInt(alunoId)
        }
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      },
      orderBy: {
        usuario: {
          nome: 'asc'
        }
      }
    });

    res.json(colegas);
  } catch (error) {
    console.error('Erro ao buscar colegas do aluno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Visualizar histórico acadêmico resumido
router.get('/:alunoId/historico', async (req, res) => {
  try {
    const { alunoId } = req.params;

    const aluno = await req.prisma.aluno.findUnique({
      where: {
        id: parseInt(alunoId)
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        turma: true,
        notas: {
          include: {
            professor: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    nome: true
                  }
                }
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          }
        }
      }
    });

    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    // Calcular estatísticas
    const totalNotas = aluno.notas.length;
    const somaNotas = aluno.notas.reduce((sum, nota) => sum + nota.valor, 0);
    const mediaGeral = totalNotas > 0 ? parseFloat((somaNotas / totalNotas).toFixed(2)) : 0;

    // Agrupar por disciplina
    const disciplinas = aluno.notas.reduce((acc, nota) => {
      if (!acc[nota.disciplina]) {
        acc[nota.disciplina] = {
          disciplina: nota.disciplina,
          notas: [],
          media: 0
        };
      }
      acc[nota.disciplina].notas.push(nota);
      return acc;
    }, {});

    // Calcular média por disciplina
    Object.keys(disciplinas).forEach(disciplina => {
      const notasDisciplina = disciplinas[disciplina].notas;
      const soma = notasDisciplina.reduce((sum, nota) => sum + nota.valor, 0);
      disciplinas[disciplina].media = parseFloat((soma / notasDisciplina.length).toFixed(2));
    });

    res.json({
      aluno: {
        id: aluno.id,
        usuario: aluno.usuario,
        turma: aluno.turma
      },
      estatisticas: {
        totalNotas,
        mediaGeral,
        disciplinasCount: Object.keys(disciplinas).length
      },
      disciplinas: Object.values(disciplinas)
    });
  } catch (error) {
    console.error('Erro ao buscar histórico do aluno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

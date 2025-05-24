const express = require('express');
const router = express.Router();

// ===== INGREDIENTES =====

// Listar ingredientes
router.get('/ingredientes', async (req, res) => {
  try {
    const ingredientes = await req.prisma.ingrediente.findMany({
      include: {
        estoque: {
          orderBy: {
            created_at: 'desc'
          }
        }
      },
      orderBy: {
        nome: 'asc'
      }
    });

    res.json(ingredientes);
  } catch (error) {
    console.error('Erro ao listar ingredientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar ingrediente
router.post('/ingredientes', async (req, res) => {
  try {
    const { nome, unidade, categoria } = req.body;

    if (!nome || !unidade || !categoria) {
      return res.status(400).json({ error: 'Nome, unidade e categoria são obrigatórios' });
    }

    const ingrediente = await req.prisma.ingrediente.create({
      data: {
        nome,
        unidade,
        categoria
      }
    });

    res.status(201).json(ingrediente);
  } catch (error) {
    console.error('Erro ao criar ingrediente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===== ESTOQUE =====

// Listar estoque
router.get('/estoque', async (req, res) => {
  try {
    const estoque = await req.prisma.estoque.findMany({
      include: {
        ingrediente: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.json(estoque);
  } catch (error) {
    console.error('Erro ao listar estoque:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Adicionar item ao estoque (compra)
router.post('/estoque', async (req, res) => {
  try {
    const { ingrediente_id, quantidade, preco_unitario, data_compra, data_validade, fornecedor } = req.body;

    if (!ingrediente_id || !quantidade || !preco_unitario || !data_compra) {
      return res.status(400).json({ 
        error: 'Ingrediente, quantidade, preço unitário e data de compra são obrigatórios' 
      });
    }

    const itemEstoque = await req.prisma.estoque.create({
      data: {
        ingrediente_id: parseInt(ingrediente_id),
        quantidade: parseFloat(quantidade),
        preco_unitario: parseFloat(preco_unitario),
        data_compra: new Date(data_compra),
        data_validade: data_validade ? new Date(data_validade) : null,
        fornecedor
      },
      include: {
        ingrediente: true
      }
    });

    res.status(201).json(itemEstoque);
  } catch (error) {
    console.error('Erro ao adicionar item ao estoque:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Relatório de estoque atual
router.get('/estoque/relatorio', async (req, res) => {
  try {
    const relatorio = await req.prisma.ingrediente.findMany({
      include: {
        estoque: {
          orderBy: {
            data_validade: 'asc'
          }
        }
      }
    });

    const relatorioProcessado = relatorio.map(ingrediente => {
      const quantidadeTotal = ingrediente.estoque.reduce((total, item) => total + item.quantidade, 0);
      const valorTotal = ingrediente.estoque.reduce((total, item) => total + (item.quantidade * item.preco_unitario), 0);
      const itensVencendo = ingrediente.estoque.filter(item => {
        if (!item.data_validade) return false;
        const hoje = new Date();
        const diasParaVencer = Math.ceil((new Date(item.data_validade) - hoje) / (1000 * 60 * 60 * 24));
        return diasParaVencer <= 7 && diasParaVencer >= 0;
      });

      return {
        ingrediente: {
          id: ingrediente.id,
          nome: ingrediente.nome,
          unidade: ingrediente.unidade,
          categoria: ingrediente.categoria
        },
        quantidadeTotal,
        valorTotal,
        itensVencendo: itensVencendo.length,
        ultimaCompra: ingrediente.estoque[0]?.data_compra || null
      };
    });

    res.json(relatorioProcessado);
  } catch (error) {
    console.error('Erro ao gerar relatório de estoque:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===== CARDÁPIOS =====

// Listar cardápios
router.get('/cardapios', async (req, res) => {
  try {
    const { data, tipo_refeicao } = req.query;
    
    const where = {};
    if (data) where.data = new Date(data);
    if (tipo_refeicao) where.tipo_refeicao = tipo_refeicao;

    const cardapios = await req.prisma.cardapio.findMany({
      where,
      include: {
        itens: {
          include: {
            ingrediente: true
          }
        },
        cardapiosAlunos: {
          include: {
            aluno: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    nome: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        data: 'desc'
      }
    });

    res.json(cardapios);
  } catch (error) {
    console.error('Erro ao listar cardápios:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar cardápio
router.post('/cardapios', async (req, res) => {
  try {
    const { nome, data, tipo_refeicao, itens } = req.body;

    if (!nome || !data || !tipo_refeicao) {
      return res.status(400).json({ error: 'Nome, data e tipo de refeição são obrigatórios' });
    }

    const cardapio = await req.prisma.cardapio.create({
      data: {
        nome,
        data: new Date(data),
        tipo_refeicao,
        itens: {
          create: itens?.map(item => ({
            ingrediente_id: parseInt(item.ingrediente_id),
            quantidade: parseFloat(item.quantidade),
            observacoes: item.observacoes
          })) || []
        }
      },
      include: {
        itens: {
          include: {
            ingrediente: true
          }
        }
      }
    });

    res.status(201).json(cardapio);
  } catch (error) {
    console.error('Erro ao criar cardápio:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar cardápio
router.put('/cardapios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, data, tipo_refeicao, ativo, itens } = req.body;

    // Atualizar cardápio
    const cardapio = await req.prisma.cardapio.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        data: data ? new Date(data) : undefined,
        tipo_refeicao,
        ativo
      }
    });

    // Se itens foram fornecidos, atualizar
    if (itens) {
      // Remover itens existentes
      await req.prisma.cardapioItem.deleteMany({
        where: { cardapio_id: parseInt(id) }
      });

      // Adicionar novos itens
      if (itens.length > 0) {
        await req.prisma.cardapioItem.createMany({
          data: itens.map(item => ({
            cardapio_id: parseInt(id),
            ingrediente_id: parseInt(item.ingrediente_id),
            quantidade: parseFloat(item.quantidade),
            observacoes: item.observacoes
          }))
        });
      }
    }

    // Buscar cardápio atualizado
    const cardapioAtualizado = await req.prisma.cardapio.findUnique({
      where: { id: parseInt(id) },
      include: {
        itens: {
          include: {
            ingrediente: true
          }
        }
      }
    });

    res.json(cardapioAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar cardápio:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===== CARDÁPIOS PERSONALIZADOS PARA ALUNOS =====

// Atribuir cardápio a aluno
router.post('/cardapios/:cardapioId/alunos', async (req, res) => {
  try {
    const { cardapioId } = req.params;
    const { aluno_id, personalizado, observacoes } = req.body;

    if (!aluno_id) {
      return res.status(400).json({ error: 'ID do aluno é obrigatório' });
    }

    const cardapioAluno = await req.prisma.cardapioAluno.create({
      data: {
        aluno_id: parseInt(aluno_id),
        cardapio_id: parseInt(cardapioId),
        personalizado: personalizado || false,
        observacoes
      },
      include: {
        aluno: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true
              }
            }
          }
        },
        cardapio: true
      }
    });

    res.status(201).json(cardapioAluno);
  } catch (error) {
    console.error('Erro ao atribuir cardápio ao aluno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar cardápios de um aluno
router.get('/alunos/:alunoId/cardapios', async (req, res) => {
  try {
    const { alunoId } = req.params;

    const cardapios = await req.prisma.cardapioAluno.findMany({
      where: {
        aluno_id: parseInt(alunoId)
      },
      include: {
        cardapio: {
          include: {
            itens: {
              include: {
                ingrediente: true
              }
            }
          }
        }
      },
      orderBy: {
        cardapio: {
          data: 'desc'
        }
      }
    });

    res.json(cardapios);
  } catch (error) {
    console.error('Erro ao listar cardápios do aluno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===== RESTRIÇÕES ALIMENTARES =====

// Listar restrições de um aluno
router.get('/alunos/:alunoId/restricoes', async (req, res) => {
  try {
    const { alunoId } = req.params;

    const restricoes = await req.prisma.restricaoAlimentar.findMany({
      where: {
        aluno_id: parseInt(alunoId),
        ativo: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.json(restricoes);
  } catch (error) {
    console.error('Erro ao listar restrições do aluno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Adicionar restrição alimentar
router.post('/alunos/:alunoId/restricoes', async (req, res) => {
  try {
    const { alunoId } = req.params;
    const { tipo, descricao } = req.body;

    if (!tipo || !descricao) {
      return res.status(400).json({ error: 'Tipo e descrição são obrigatórios' });
    }

    const restricao = await req.prisma.restricaoAlimentar.create({
      data: {
        aluno_id: parseInt(alunoId),
        tipo,
        descricao
      }
    });

    res.status(201).json(restricao);
  } catch (error) {
    console.error('Erro ao adicionar restrição alimentar:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Remover restrição alimentar
router.delete('/restricoes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await req.prisma.restricaoAlimentar.update({
      where: { id: parseInt(id) },
      data: { ativo: false }
    });

    res.json({ message: 'Restrição removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover restrição:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

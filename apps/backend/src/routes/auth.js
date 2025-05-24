const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Login simulado - apenas verifica se o usuário existe
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const usuario = await req.prisma.usuario.findUnique({
      where: { email },
      include: {
        aluno: {
          include: {
            turma: true
          }
        },
        professor: true
      }
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // Verificar senha (em produção, usar bcrypt.compare)
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    // Retornar dados do usuário sem a senha
    const { senha: _, ...usuarioSemSenha } = usuario;
    
    res.json({
      message: 'Login realizado com sucesso',
      usuario: usuarioSemSenha
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar todos os usuários (para debug)
router.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await req.prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true
      }
    });
    res.json(usuarios);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

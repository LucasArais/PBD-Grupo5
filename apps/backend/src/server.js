const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const authRoutes = require('./routes/auth');
const diretorRoutes = require('./routes/diretor');
const professorRoutes = require('./routes/professor');
const alunoRoutes = require('./routes/aluno');
const cozinhaRoutes = require('./routes/cozinha');

const app = express();
const prisma = new PrismaClient();

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware para adicionar prisma ao req
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/diretor', diretorRoutes);
app.use('/api/professor', professorRoutes);
app.use('/api/aluno', alunoRoutes);
app.use('/api/cozinha', cozinhaRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend funcionando!' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});

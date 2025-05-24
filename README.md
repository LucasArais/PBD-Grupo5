# Sistema de Gestão Escolar

Um sistema completo de gestão escolar desenvolvido em monorepo com React no frontend e Node.js/Express no backend, utilizando SQLite como banco de dados.

## 🏗️ Arquitetura

```
/
├── apps/
│   ├── frontend/     # React + Vite + Tailwind CSS
│   └── backend/      # Node.js + Express + Prisma + SQLite
├── shared/           # Código compartilhado (opcional)
└── package.json      # Configuração do monorepo
```

## 🚀 Funcionalidades

### 👨‍💼 Diretor
- Cadastrar professores e alunos
- Criar turmas
- Atribuir professores a turmas
- Visualizar estatísticas gerais

### 👨‍🏫 Professor
- Visualizar turmas atribuídas
- Lançar notas para alunos
- Gerenciar histórico de notas
- Visualizar alunos por turma

### 👨‍🎓 Aluno
- Visualizar suas próprias notas
- Ver informações da turma
- Consultar colegas de turma
- Acompanhar histórico acadêmico

## 🛠️ Tecnologias

### Frontend
- **React 18** - Biblioteca para interfaces
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **React Router** - Roteamento
- **Axios** - Cliente HTTP

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Prisma** - ORM para banco de dados
- **SQLite** - Banco de dados
- **bcryptjs** - Hash de senhas

## 📋 Pré-requisitos

- Node.js 16+ 
- npm ou yarn

## 🚀 Como executar

### 1. Instalar dependências

```bash
# Instalar dependências do monorepo
npm install

# Instalar dependências do backend
cd apps/backend
npm install

# Instalar dependências do frontend
cd ../frontend
npm install

# Voltar para a raiz
cd ../..
```

### 2. Configurar o banco de dados

```bash
# Navegar para o backend
cd apps/backend

# Gerar o cliente Prisma
npm run db:generate

# Criar e sincronizar o banco de dados
npm run db:push

# Popular o banco com dados de exemplo
npm run db:seed
```

### 3. Executar o projeto

#### Opção 1: Executar tudo de uma vez (recomendado)
```bash
# Na raiz do projeto
npm run dev
```

#### Opção 2: Executar separadamente

**Terminal 1 - Backend:**
```bash
cd apps/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/frontend
npm run dev
```

### 4. Acessar o sistema

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001

## 👥 Usuários de Teste

Após executar o seed, você pode usar os seguintes usuários para teste:

### Diretor
- **Email:** diretor@escola.com
- **Senha:** 123456

### Professores
- **Email:** maria@escola.com | **Senha:** 123456
- **Email:** carlos@escola.com | **Senha:** 123456
- **Email:** ana@escola.com | **Senha:** 123456

### Alunos
- **Email:** pedro@aluno.com | **Senha:** 123456
- **Email:** julia@aluno.com | **Senha:** 123456
- **Email:** lucas@aluno.com | **Senha:** 123456
- **Email:** mariana@aluno.com | **Senha:** 123456
- **Email:** gabriel@aluno.com | **Senha:** 123456
- **Email:** isabela@aluno.com | **Senha:** 123456
- **Email:** rafael@aluno.com | **Senha:** 123456
- **Email:** camila@aluno.com | **Senha:** 123456
- **Email:** bruno@aluno.com | **Senha:** 123456

## 📁 Estrutura do Projeto

### Backend (`apps/backend/`)
```
src/
├── routes/
│   ├── auth.js       # Autenticação
│   ├── diretor.js    # Rotas do diretor
│   ├── professor.js  # Rotas do professor
│   └── aluno.js      # Rotas do aluno
├── seed.js           # Dados iniciais
└── server.js         # Servidor principal

prisma/
└── schema.prisma     # Schema do banco de dados
```

### Frontend (`apps/frontend/`)
```
src/
├── components/
│   ├── Login.jsx
│   ├── Layout.jsx
│   ├── DiretorDashboard.jsx
│   ├── ProfessorDashboard.jsx
│   └── AlunoDashboard.jsx
├── contexts/
│   └── AuthContext.jsx
├── services/
│   └── api.js
├── App.jsx
└── main.jsx
```

## 🗄️ Banco de Dados

O sistema utiliza SQLite com as seguintes entidades:

- **Usuario** - Dados básicos dos usuários
- **Aluno** - Informações específicas dos alunos
- **Professor** - Informações específicas dos professores
- **Turma** - Turmas da escola
- **TurmaProfessor** - Relacionamento entre turmas e professores
- **Nota** - Notas dos alunos

## 🔧 Scripts Disponíveis

### Raiz do projeto
- `npm run dev` - Executa frontend e backend simultaneamente
- `npm run dev:frontend` - Executa apenas o frontend
- `npm run dev:backend` - Executa apenas o backend

### Backend
- `npm run dev` - Executa o servidor em modo desenvolvimento
- `npm run db:generate` - Gera o cliente Prisma
- `npm run db:push` - Sincroniza o schema com o banco
- `npm run db:seed` - Popula o banco com dados de exemplo

### Frontend
- `npm run dev` - Executa o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção

## 🔒 Autenticação

O sistema utiliza autenticação simulada baseada em sessão local. Em produção, seria recomendado implementar:

- JWT tokens
- Refresh tokens
- Middleware de autenticação mais robusto
- Validação de permissões por rota

## 🎨 Interface

A interface foi desenvolvida com Tailwind CSS, oferecendo:

- Design responsivo
- Componentes reutilizáveis
- Tema consistente
- Experiência de usuário intuitiva

## 📝 Próximos Passos

Para expandir o sistema, considere implementar:

- [ ] Sistema de disciplinas mais robusto
- [ ] Calendário escolar
- [ ] Sistema de presença
- [ ] Relatórios em PDF
- [ ] Notificações em tempo real
- [ ] Upload de arquivos
- [ ] Sistema de mensagens
- [ ] Backup automático
- [ ] Logs de auditoria
- [ ] Testes automatizados

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

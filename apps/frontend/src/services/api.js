import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Interceptor para adicionar headers se necessário
api.interceptors.request.use(
  (config) => {
    // Aqui poderia adicionar token de autenticação se fosse implementado
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Erro na API:', error);
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  login: async (email, senha) => {
    const response = await api.post('/auth/login', { email, senha });
    return response.data;
  },
  
  getUsuarios: async () => {
    const response = await api.get('/auth/usuarios');
    return response.data;
  }
};

// Serviços do diretor
export const diretorService = {
  // Professores
  criarProfessor: async (dados) => {
    const response = await api.post('/diretor/professores', dados);
    return response.data;
  },
  
  listarProfessores: async () => {
    const response = await api.get('/diretor/professores');
    return response.data;
  },
  
  // Alunos
  criarAluno: async (dados) => {
    const response = await api.post('/diretor/alunos', dados);
    return response.data;
  },
  
  listarAlunos: async () => {
    const response = await api.get('/diretor/alunos');
    return response.data;
  },
  
  // Turmas
  criarTurma: async (dados) => {
    const response = await api.post('/diretor/turmas', dados);
    return response.data;
  },
  
  listarTurmas: async () => {
    const response = await api.get('/diretor/turmas');
    return response.data;
  },
  
  atribuirProfessor: async (turmaId, professorId) => {
    const response = await api.post(`/diretor/turmas/${turmaId}/professores`, {
      professor_id: professorId
    });
    return response.data;
  }
};

// Serviços do professor
export const professorService = {
  listarTurmas: async (professorId) => {
    const response = await api.get(`/professor/${professorId}/turmas`);
    return response.data;
  },
  
  lancarNota: async (dados) => {
    const response = await api.post('/professor/notas', dados);
    return response.data;
  },
  
  listarNotas: async (professorId) => {
    const response = await api.get(`/professor/${professorId}/notas`);
    return response.data;
  },
  
  atualizarNota: async (notaId, dados) => {
    const response = await api.put(`/professor/notas/${notaId}`, dados);
    return response.data;
  },
  
  deletarNota: async (notaId) => {
    const response = await api.delete(`/professor/notas/${notaId}`);
    return response.data;
  }
};

// Serviços do aluno
export const alunoService = {
  obterPerfil: async (alunoId) => {
    const response = await api.get(`/aluno/${alunoId}/perfil`);
    return response.data;
  },
  
  obterNotas: async (alunoId) => {
    const response = await api.get(`/aluno/${alunoId}/notas`);
    return response.data;
  },
  
  obterColegas: async (alunoId) => {
    const response = await api.get(`/aluno/${alunoId}/colegas`);
    return response.data;
  },
  
  obterHistorico: async (alunoId) => {
    const response = await api.get(`/aluno/${alunoId}/historico`);
    return response.data;
  }
};

// Serviços da cozinha
export const cozinhaService = {
  // Ingredientes
  listarIngredientes: async () => {
    const response = await api.get('/cozinha/ingredientes');
    return response.data;
  },
  
  criarIngrediente: async (dados) => {
    const response = await api.post('/cozinha/ingredientes', dados);
    return response.data;
  },
  
  // Estoque
  listarEstoque: async () => {
    const response = await api.get('/cozinha/estoque');
    return response.data;
  },
  
  adicionarEstoque: async (dados) => {
    const response = await api.post('/cozinha/estoque', dados);
    return response.data;
  },
  
  relatorioEstoque: async () => {
    const response = await api.get('/cozinha/estoque/relatorio');
    return response.data;
  },
  
  // Cardápios
  listarCardapios: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const response = await api.get(`/cozinha/cardapios?${params}`);
    return response.data;
  },
  
  criarCardapio: async (dados) => {
    const response = await api.post('/cozinha/cardapios', dados);
    return response.data;
  },
  
  atualizarCardapio: async (id, dados) => {
    const response = await api.put(`/cozinha/cardapios/${id}`, dados);
    return response.data;
  },
  
  // Cardápios de alunos
  atribuirCardapioAluno: async (cardapioId, dados) => {
    const response = await api.post(`/cozinha/cardapios/${cardapioId}/alunos`, dados);
    return response.data;
  },
  
  listarCardapiosAluno: async (alunoId) => {
    const response = await api.get(`/cozinha/alunos/${alunoId}/cardapios`);
    return response.data;
  },
  
  // Restrições alimentares
  listarRestricoesAluno: async (alunoId) => {
    const response = await api.get(`/cozinha/alunos/${alunoId}/restricoes`);
    return response.data;
  },
  
  adicionarRestricaoAluno: async (alunoId, dados) => {
    const response = await api.post(`/cozinha/alunos/${alunoId}/restricoes`, dados);
    return response.data;
  },
  
  removerRestricao: async (restricaoId) => {
    const response = await api.delete(`/cozinha/restricoes/${restricaoId}`);
    return response.data;
  }
};

export default api;

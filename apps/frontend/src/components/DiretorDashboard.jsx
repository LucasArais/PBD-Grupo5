import React, { useState, useEffect } from 'react';
import { diretorService } from '../services/api';
import CozinhaDashboard from './CozinhaDashboard';

const DiretorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [turmas, setTurmas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para formulários
  const [novaTurma, setNovaTurma] = useState({ nome: '' });
  const [novoProfessor, setNovoProfessor] = useState({ nome: '', email: '', senha: '' });
  const [novoAluno, setNovoAluno] = useState({ nome: '', email: '', senha: '', turma_id: '' });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [turmasData, professoresData, alunosData] = await Promise.all([
        diretorService.listarTurmas(),
        diretorService.listarProfessores(),
        diretorService.listarAlunos()
      ]);
      
      setTurmas(turmasData);
      setProfessores(professoresData);
      setAlunos(alunosData);
    } catch (error) {
      setError('Erro ao carregar dados');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const criarTurma = async (e) => {
    e.preventDefault();
    try {
      await diretorService.criarTurma(novaTurma);
      setNovaTurma({ nome: '' });
      carregarDados();
    } catch (error) {
      setError('Erro ao criar turma');
    }
  };

  const criarProfessor = async (e) => {
    e.preventDefault();
    try {
      await diretorService.criarProfessor(novoProfessor);
      setNovoProfessor({ nome: '', email: '', senha: '' });
      carregarDados();
    } catch (error) {
      setError('Erro ao criar professor');
    }
  };

  const criarAluno = async (e) => {
    e.preventDefault();
    try {
      await diretorService.criarAluno(novoAluno);
      setNovoAluno({ nome: '', email: '', senha: '', turma_id: '' });
      carregarDados();
    } catch (error) {
      setError('Erro ao criar aluno');
    }
  };

  const atribuirProfessorTurma = async (turmaId, professorId) => {
    try {
      await diretorService.atribuirProfessor(turmaId, professorId);
      carregarDados();
    } catch (error) {
      setError('Erro ao atribuir professor');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'turmas', label: 'Turmas' },
    { id: 'professores', label: 'Professores' },
    { id: 'alunos', label: 'Alunos' },
    { id: 'cozinha', label: 'Cozinha' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard do Diretor</h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Visão Geral */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total de Turmas</h3>
            <p className="text-3xl font-bold text-primary-600">{turmas.length}</p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total de Professores</h3>
            <p className="text-3xl font-bold text-green-600">{professores.length}</p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total de Alunos</h3>
            <p className="text-3xl font-bold text-blue-600">{alunos.length}</p>
          </div>
        </div>
      )}

      {/* Turmas */}
      {activeTab === 'turmas' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Criar Nova Turma</h3>
            <form onSubmit={criarTurma} className="flex gap-4">
              <input
                type="text"
                placeholder="Nome da turma"
                value={novaTurma.nome}
                onChange={(e) => setNovaTurma({ nome: e.target.value })}
                className="input-field flex-1"
                required
              />
              <button type="submit" className="btn-primary">
                Criar Turma
              </button>
            </form>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Turmas Existentes</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">Nome</th>
                    <th className="table-header">Alunos</th>
                    <th className="table-header">Professores</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {turmas.map((turma) => (
                    <tr key={turma.id}>
                      <td className="table-cell font-medium">{turma.nome}</td>
                      <td className="table-cell">{turma.alunos?.length || 0}</td>
                      <td className="table-cell">{turma.professores?.length || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Professores */}
      {activeTab === 'professores' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cadastrar Novo Professor</h3>
            <form onSubmit={criarProfessor} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Nome"
                value={novoProfessor.nome}
                onChange={(e) => setNovoProfessor({ ...novoProfessor, nome: e.target.value })}
                className="input-field"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={novoProfessor.email}
                onChange={(e) => setNovoProfessor({ ...novoProfessor, email: e.target.value })}
                className="input-field"
                required
              />
              <input
                type="password"
                placeholder="Senha"
                value={novoProfessor.senha}
                onChange={(e) => setNovoProfessor({ ...novoProfessor, senha: e.target.value })}
                className="input-field"
                required
              />
              <button type="submit" className="btn-primary">
                Cadastrar
              </button>
            </form>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Professores Cadastrados</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">Nome</th>
                    <th className="table-header">Email</th>
                    <th className="table-header">Turmas</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {professores.map((professor) => (
                    <tr key={professor.id}>
                      <td className="table-cell font-medium">{professor.usuario.nome}</td>
                      <td className="table-cell">{professor.usuario.email}</td>
                      <td className="table-cell">{professor.turmas?.length || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Alunos */}
      {activeTab === 'alunos' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cadastrar Novo Aluno</h3>
            <form onSubmit={criarAluno} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="Nome"
                value={novoAluno.nome}
                onChange={(e) => setNovoAluno({ ...novoAluno, nome: e.target.value })}
                className="input-field"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={novoAluno.email}
                onChange={(e) => setNovoAluno({ ...novoAluno, email: e.target.value })}
                className="input-field"
                required
              />
              <input
                type="password"
                placeholder="Senha"
                value={novoAluno.senha}
                onChange={(e) => setNovoAluno({ ...novoAluno, senha: e.target.value })}
                className="input-field"
                required
              />
              <select
                value={novoAluno.turma_id}
                onChange={(e) => setNovoAluno({ ...novoAluno, turma_id: e.target.value })}
                className="input-field"
              >
                <option value="">Selecionar Turma</option>
                {turmas.map((turma) => (
                  <option key={turma.id} value={turma.id}>
                    {turma.nome}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn-primary">
                Cadastrar
              </button>
            </form>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Alunos Cadastrados</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">Nome</th>
                    <th className="table-header">Email</th>
                    <th className="table-header">Turma</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {alunos.map((aluno) => (
                    <tr key={aluno.id}>
                      <td className="table-cell font-medium">{aluno.usuario.nome}</td>
                      <td className="table-cell">{aluno.usuario.email}</td>
                      <td className="table-cell">{aluno.turma?.nome || 'Sem turma'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Cozinha */}
      {activeTab === 'cozinha' && <CozinhaDashboard />}
    </div>
  );
};

export default DiretorDashboard;

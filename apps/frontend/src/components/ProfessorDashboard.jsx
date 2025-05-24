import React, { useState, useEffect } from 'react';
import { professorService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ProfessorDashboard = () => {
  const { getProfessorId } = useAuth();
  const [activeTab, setActiveTab] = useState('turmas');
  const [turmas, setTurmas] = useState([]);
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para lançar nota
  const [novaNota, setNovaNota] = useState({
    aluno_id: '',
    disciplina: '',
    valor: ''
  });

  const professorId = getProfessorId();

  useEffect(() => {
    if (professorId) {
      carregarDados();
    }
  }, [professorId]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [turmasData, notasData] = await Promise.all([
        professorService.listarTurmas(professorId),
        professorService.listarNotas(professorId)
      ]);
      
      setTurmas(turmasData);
      setNotas(notasData);
    } catch (error) {
      setError('Erro ao carregar dados');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const lancarNota = async (e) => {
    e.preventDefault();
    try {
      await professorService.lancarNota({
        ...novaNota,
        professor_id: professorId,
        valor: parseFloat(novaNota.valor)
      });
      setNovaNota({ aluno_id: '', disciplina: '', valor: '' });
      carregarDados();
    } catch (error) {
      setError('Erro ao lançar nota');
    }
  };

  const deletarNota = async (notaId) => {
    if (window.confirm('Tem certeza que deseja deletar esta nota?')) {
      try {
        await professorService.deletarNota(notaId);
        carregarDados();
      } catch (error) {
        setError('Erro ao deletar nota');
      }
    }
  };

  const tabs = [
    { id: 'turmas', label: 'Minhas Turmas' },
    { id: 'notas', label: 'Lançar Notas' },
    { id: 'historico', label: 'Histórico de Notas' }
  ];

  // Obter todos os alunos das turmas do professor
  const todosAlunos = turmas.reduce((acc, turmaProf) => {
    if (turmaProf.turma && turmaProf.turma.alunos) {
      return [...acc, ...turmaProf.turma.alunos];
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard do Professor</h2>
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

      {/* Minhas Turmas */}
      {activeTab === 'turmas' && (
        <div className="space-y-6">
          {turmas.length === 0 ? (
            <div className="card text-center">
              <p className="text-gray-500">Você não está atribuído a nenhuma turma ainda.</p>
            </div>
          ) : (
            turmas.map((turmaProf) => (
              <div key={turmaProf.id} className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {turmaProf.turma.nome}
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="table-header">Aluno</th>
                        <th className="table-header">Email</th>
                        <th className="table-header">Notas</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {turmaProf.turma.alunos.map((aluno) => (
                        <tr key={aluno.id}>
                          <td className="table-cell font-medium">{aluno.usuario.nome}</td>
                          <td className="table-cell">{aluno.usuario.email}</td>
                          <td className="table-cell">
                            {aluno.notas.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {aluno.notas.map((nota) => (
                                  <span
                                    key={nota.id}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {nota.disciplina}: {nota.valor}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">Sem notas</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Lançar Notas */}
      {activeTab === 'notas' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Lançar Nova Nota</h3>
            <form onSubmit={lancarNota} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={novaNota.aluno_id}
                onChange={(e) => setNovaNota({ ...novaNota, aluno_id: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Selecionar Aluno</option>
                {todosAlunos.map((aluno) => (
                  <option key={aluno.id} value={aluno.id}>
                    {aluno.usuario.nome}
                  </option>
                ))}
              </select>
              
              <input
                type="text"
                placeholder="Disciplina"
                value={novaNota.disciplina}
                onChange={(e) => setNovaNota({ ...novaNota, disciplina: e.target.value })}
                className="input-field"
                required
              />
              
              <input
                type="number"
                placeholder="Nota (0-10)"
                min="0"
                max="10"
                step="0.1"
                value={novaNota.valor}
                onChange={(e) => setNovaNota({ ...novaNota, valor: e.target.value })}
                className="input-field"
                required
              />
              
              <button type="submit" className="btn-primary">
                Lançar Nota
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['Matemática', 'Português', 'História', 'Geografia', 'Ciências', 'Inglês'].map((disciplina) => (
              <button
                key={disciplina}
                onClick={() => setNovaNota({ ...novaNota, disciplina })}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
              >
                <h4 className="font-medium text-gray-900">{disciplina}</h4>
                <p className="text-sm text-gray-500">Clique para selecionar</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Histórico de Notas */}
      {activeTab === 'historico' && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notas Lançadas</h3>
          
          {notas.length === 0 ? (
            <p className="text-gray-500 text-center">Nenhuma nota lançada ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">Aluno</th>
                    <th className="table-header">Turma</th>
                    <th className="table-header">Disciplina</th>
                    <th className="table-header">Nota</th>
                    <th className="table-header">Data</th>
                    <th className="table-header">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notas.map((nota) => (
                    <tr key={nota.id}>
                      <td className="table-cell font-medium">{nota.aluno.usuario.nome}</td>
                      <td className="table-cell">{nota.aluno.turma?.nome || 'Sem turma'}</td>
                      <td className="table-cell">{nota.disciplina}</td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          nota.valor >= 7 ? 'bg-green-100 text-green-800' :
                          nota.valor >= 5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {nota.valor}
                        </span>
                      </td>
                      <td className="table-cell">
                        {new Date(nota.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => deletarNota(nota.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfessorDashboard;

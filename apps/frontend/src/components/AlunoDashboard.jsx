import React, { useState, useEffect } from 'react';
import { alunoService, cozinhaService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const AlunoDashboard = () => {
  const { getAlunoId } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');
  const [perfil, setPerfil] = useState(null);
  const [notas, setNotas] = useState(null);
  const [colegas, setColegas] = useState([]);
  const [historico, setHistorico] = useState(null);
  const [cardapios, setCardapios] = useState([]);
  const [restricoes, setRestricoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [novaRestricao, setNovaRestricao] = useState({ tipo: '', descricao: '' });

  const alunoId = getAlunoId();

  useEffect(() => {
    if (alunoId) {
      carregarDados();
    }
  }, [alunoId]);

  useEffect(() => {
    if (alunoId && activeTab === 'cardapios') {
      carregarCardapios();
      carregarRestricoes();
    }
  }, [alunoId, activeTab]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [perfilData, notasData, colegasData, historicoData] = await Promise.all([
        alunoService.obterPerfil(alunoId),
        alunoService.obterNotas(alunoId),
        alunoService.obterColegas(alunoId),
        alunoService.obterHistorico(alunoId)
      ]);
      
      setPerfil(perfilData);
      setNotas(notasData);
      setColegas(colegasData);
      setHistorico(historicoData);
    } catch (error) {
      setError('Erro ao carregar dados');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const carregarCardapios = async () => {
    try {
      const hoje = new Date();
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - hoje.getDay());
      
      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(inicioSemana.getDate() + 6);

      const cardapiosData = await cozinhaService.listarCardapios();
      const cardapiosSemana = cardapiosData.filter(cardapio => {
        const dataCardapio = new Date(cardapio.data);
        return dataCardapio >= inicioSemana && dataCardapio <= fimSemana;
      });
      
      setCardapios(cardapiosSemana);
    } catch (error) {
      setError('Erro ao carregar cardápios');
      console.error(error);
    }
  };

  const carregarRestricoes = async () => {
    try {
      const restricoesData = await cozinhaService.listarRestricoesAluno(alunoId);
      setRestricoes(restricoesData);
    } catch (error) {
      setError('Erro ao carregar restrições');
      console.error(error);
    }
  };

  const adicionarRestricao = async (e) => {
    e.preventDefault();
    try {
      await cozinhaService.adicionarRestricaoAluno(alunoId, novaRestricao);
      setNovaRestricao({ tipo: '', descricao: '' });
      carregarRestricoes();
    } catch (error) {
      setError('Erro ao adicionar restrição');
    }
  };

  const removerRestricao = async (restricaoId) => {
    try {
      await cozinhaService.removerRestricao(restricaoId);
      carregarRestricoes();
    } catch (error) {
      setError('Erro ao remover restrição');
    }
  };

  const tabs = [
    { id: 'perfil', label: 'Meu Perfil' },
    { id: 'notas', label: 'Minhas Notas' },
    { id: 'cardapios', label: 'Cardápios da Semana' },
    { id: 'colegas', label: 'Colegas de Turma' },
    { id: 'historico', label: 'Histórico Acadêmico' }
  ];

  const getNotaColor = (valor) => {
    if (valor >= 7) return 'bg-green-100 text-green-800';
    if (valor >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard do Aluno</h2>
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

      {/* Meu Perfil */}
      {activeTab === 'perfil' && perfil && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <p className="mt-1 text-sm text-gray-900">{perfil.usuario.nome}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{perfil.usuario.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Turma</label>
                <p className="mt-1 text-sm text-gray-900">
                  {perfil.turma ? perfil.turma.nome : 'Não atribuído a uma turma'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Usuário</label>
                <p className="mt-1 text-sm text-gray-900">Aluno</p>
              </div>
            </div>
          </div>

          {perfil.turma && perfil.turma.professores && perfil.turma.professores.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Professores da Turma</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {perfil.turma.professores.map((turmaProf) => (
                  <div key={turmaProf.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">
                      {turmaProf.professor.usuario.nome}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {turmaProf.professor.usuario.email}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Minhas Notas */}
      {activeTab === 'notas' && notas && (
        <div className="space-y-6">
          {/* Resumo por disciplina */}
          {notas.resumoPorDisciplina && notas.resumoPorDisciplina.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo por Disciplina</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notas.resumoPorDisciplina.map((disciplina) => (
                  <div key={disciplina.disciplina} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">{disciplina.disciplina}</h4>
                    <p className="text-2xl font-bold text-primary-600 mt-2">
                      {disciplina.media}
                    </p>
                    <p className="text-sm text-gray-500">
                      Média de {disciplina.totalNotas} nota(s)
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Todas as notas */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Todas as Notas</h3>
            
            {notas.notas && notas.notas.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="table-header">Disciplina</th>
                      <th className="table-header">Nota</th>
                      <th className="table-header">Professor</th>
                      <th className="table-header">Data</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {notas.notas.map((nota) => (
                      <tr key={nota.id}>
                        <td className="table-cell font-medium">{nota.disciplina}</td>
                        <td className="table-cell">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getNotaColor(nota.valor)}`}>
                            {nota.valor}
                          </span>
                        </td>
                        <td className="table-cell">{nota.professor.usuario.nome}</td>
                        <td className="table-cell">
                          {new Date(nota.created_at).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center">Você ainda não possui notas lançadas.</p>
            )}
          </div>
        </div>
      )}

      {/* Colegas de Turma */}
      {activeTab === 'colegas' && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Colegas de Turma</h3>
          
          {colegas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {colegas.map((colega) => (
                <div key={colega.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{colega.usuario.nome}</h4>
                  <p className="text-sm text-gray-500">{colega.usuario.email}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">
              Você não possui colegas de turma ou não está atribuído a uma turma.
            </p>
          )}
        </div>
      )}

      {/* Histórico Acadêmico */}
      {activeTab === 'historico' && historico && (
        <div className="space-y-6">
          {/* Estatísticas gerais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Média Geral</h3>
              <p className="text-3xl font-bold text-primary-600">
                {historico.estatisticas.mediaGeral}
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total de Notas</h3>
              <p className="text-3xl font-bold text-green-600">
                {historico.estatisticas.totalNotas}
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Disciplinas</h3>
              <p className="text-3xl font-bold text-blue-600">
                {historico.estatisticas.disciplinasCount}
              </p>
            </div>
          </div>

          {/* Desempenho por disciplina */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Desempenho por Disciplina</h3>
            
            {historico.disciplinas && historico.disciplinas.length > 0 ? (
              <div className="space-y-4">
                {historico.disciplinas.map((disciplina) => (
                  <div key={disciplina.disciplina} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900">{disciplina.disciplina}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getNotaColor(disciplina.media)}`}>
                        Média: {disciplina.media}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {disciplina.notas.map((nota) => (
                        <span
                          key={nota.id}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getNotaColor(nota.valor)}`}
                        >
                          {nota.valor}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">Nenhum histórico acadêmico disponível.</p>
            )}
          </div>
        </div>
      )}

      {/* Cardápios da Semana */}
      {activeTab === 'cardapios' && (
        <div className="space-y-6">
          {/* Minhas Restrições Alimentares */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Minhas Restrições Alimentares</h3>
            
            {/* Formulário para adicionar restrição */}
            <form onSubmit={adicionarRestricao} className="mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={novaRestricao.tipo}
                  onChange={(e) => setNovaRestricao({ ...novaRestricao, tipo: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Tipo de Restrição</option>
                  <option value="alergia">Alergia</option>
                  <option value="intolerância">Intolerância</option>
                  <option value="preferência">Preferência</option>
                </select>
                <input
                  type="text"
                  placeholder="Descrição da restrição"
                  value={novaRestricao.descricao}
                  onChange={(e) => setNovaRestricao({ ...novaRestricao, descricao: e.target.value })}
                  className="input-field"
                  required
                />
                <button type="submit" className="btn-primary">
                  Adicionar Restrição
                </button>
              </div>
            </form>

            {/* Lista de restrições */}
            {restricoes.length > 0 ? (
              <div className="space-y-2">
                {restricoes.map((restricao) => (
                  <div key={restricao.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                        restricao.tipo === 'alergia' ? 'bg-red-100 text-red-800' :
                        restricao.tipo === 'intolerância' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {restricao.tipo}
                      </span>
                      <span className="text-gray-900">{restricao.descricao}</span>
                    </div>
                    <button
                      onClick={() => removerRestricao(restricao.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">Você não possui restrições alimentares cadastradas.</p>
            )}
          </div>

          {/* Cardápios da Semana */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cardápios da Semana</h3>
            
            {cardapios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cardapios.map((cardapio) => {
                  const dataCardapio = new Date(cardapio.data);
                  const hoje = new Date();
                  const isHoje = dataCardapio.toDateString() === hoje.toDateString();
                  
                  // Verificar se há ingredientes que conflitam com restrições
                  const ingredientesProibidos = cardapio.itens?.filter(item => 
                    restricoes.some(restricao => 
                      item.ingrediente.nome.toLowerCase().includes(restricao.descricao.toLowerCase()) ||
                      restricao.descricao.toLowerCase().includes(item.ingrediente.nome.toLowerCase())
                    )
                  ) || [];

                  return (
                    <div key={cardapio.id} className={`border rounded-lg p-4 ${
                      isHoje ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{cardapio.nome}</h4>
                          <p className="text-sm text-gray-500">
                            {dataCardapio.toLocaleDateString('pt-BR', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'long' 
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          {isHoje && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mb-1">
                              Hoje
                            </span>
                          )}
                          <p className="text-xs text-gray-500 capitalize">{cardapio.tipo_refeicao}</p>
                        </div>
                      </div>

                      {/* Alerta de restrições */}
                      {ingredientesProibidos.length > 0 && (
                        <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded-lg">
                          <p className="text-red-800 text-sm font-medium">⚠️ Atenção!</p>
                          <p className="text-red-700 text-xs">
                            Este cardápio contém ingredientes que podem conflitar com suas restrições:
                          </p>
                          <ul className="text-red-700 text-xs mt-1">
                            {ingredientesProibidos.map(item => (
                              <li key={item.id}>• {item.ingrediente.nome}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Ingredientes */}
                      {cardapio.itens && cardapio.itens.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Ingredientes:</h5>
                          <div className="flex flex-wrap gap-1">
                            {cardapio.itens.map((item) => {
                              const isProibido = ingredientesProibidos.some(p => p.id === item.id);
                              return (
                                <span
                                  key={item.id}
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    isProibido 
                                      ? 'bg-red-100 text-red-800 border border-red-300' 
                                      : 'bg-green-100 text-green-800'
                                  }`}
                                >
                                  {item.ingrediente.nome}
                                  {item.quantidade && (
                                    <span className="ml-1 text-xs opacity-75">
                                      ({item.quantidade} {item.ingrediente.unidade})
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">Nenhum cardápio disponível para esta semana.</p>
                <p className="text-sm text-gray-400">
                  Os cardápios são atualizados pela equipe da cozinha.
                </p>
              </div>
            )}
          </div>

          {/* Informações Importantes */}
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="text-lg font-medium text-blue-900 mb-2">📋 Informações Importantes</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Os cardápios são atualizados semanalmente pela equipe da cozinha</li>
              <li>• Sempre informe suas restrições alimentares para garantir sua segurança</li>
              <li>• Em caso de dúvidas sobre ingredientes, procure a equipe da cozinha</li>
              <li>• Cardápios podem sofrer alterações de última hora por questões de disponibilidade</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlunoDashboard;

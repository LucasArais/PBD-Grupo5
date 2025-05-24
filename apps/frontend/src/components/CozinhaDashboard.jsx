import React, { useState, useEffect } from 'react';
import { cozinhaService } from '../services/api';

const CozinhaDashboard = () => {
  const [activeTab, setActiveTab] = useState('estoque');
  const [ingredientes, setIngredientes] = useState([]);
  const [estoque, setEstoque] = useState([]);
  const [relatorioEstoque, setRelatorioEstoque] = useState([]);
  const [cardapios, setCardapios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para formulários
  const [novoIngrediente, setNovoIngrediente] = useState({ nome: '', unidade: '', categoria: '' });
  const [novoEstoque, setNovoEstoque] = useState({
    ingrediente_id: '',
    quantidade: '',
    preco_unitario: '',
    data_compra: '',
    data_validade: '',
    fornecedor: ''
  });
  const [novoCardapio, setNovoCardapio] = useState({
    nome: '',
    data: '',
    tipo_refeicao: '',
    itens: []
  });

  useEffect(() => {
    carregarDados();
  }, [activeTab]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'estoque':
          const [ingredientesData, estoqueData, relatorioData] = await Promise.all([
            cozinhaService.listarIngredientes(),
            cozinhaService.listarEstoque(),
            cozinhaService.relatorioEstoque()
          ]);
          setIngredientes(ingredientesData);
          setEstoque(estoqueData);
          setRelatorioEstoque(relatorioData);
          break;
        case 'cardapios':
          const cardapiosData = await cozinhaService.listarCardapios();
          setCardapios(cardapiosData);
          if (ingredientes.length === 0) {
            const ingredientesData = await cozinhaService.listarIngredientes();
            setIngredientes(ingredientesData);
          }
          break;
        default:
          break;
      }
    } catch (error) {
      setError('Erro ao carregar dados');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const criarIngrediente = async (e) => {
    e.preventDefault();
    try {
      await cozinhaService.criarIngrediente(novoIngrediente);
      setNovoIngrediente({ nome: '', unidade: '', categoria: '' });
      carregarDados();
    } catch (error) {
      setError('Erro ao criar ingrediente');
    }
  };

  const adicionarEstoque = async (e) => {
    e.preventDefault();
    try {
      await cozinhaService.adicionarEstoque(novoEstoque);
      setNovoEstoque({
        ingrediente_id: '',
        quantidade: '',
        preco_unitario: '',
        data_compra: '',
        data_validade: '',
        fornecedor: ''
      });
      carregarDados();
    } catch (error) {
      setError('Erro ao adicionar ao estoque');
    }
  };

  const criarCardapio = async (e) => {
    e.preventDefault();
    try {
      await cozinhaService.criarCardapio(novoCardapio);
      setNovoCardapio({
        nome: '',
        data: '',
        tipo_refeicao: '',
        itens: []
      });
      carregarDados();
    } catch (error) {
      setError('Erro ao criar cardápio');
    }
  };

  const adicionarItemCardapio = () => {
    setNovoCardapio({
      ...novoCardapio,
      itens: [...novoCardapio.itens, { ingrediente_id: '', quantidade: '', observacoes: '' }]
    });
  };

  const removerItemCardapio = (index) => {
    const novosItens = novoCardapio.itens.filter((_, i) => i !== index);
    setNovoCardapio({ ...novoCardapio, itens: novosItens });
  };

  const atualizarItemCardapio = (index, campo, valor) => {
    const novosItens = [...novoCardapio.itens];
    novosItens[index][campo] = valor;
    setNovoCardapio({ ...novoCardapio, itens: novosItens });
  };

  const tabs = [
    { id: 'estoque', label: 'Estoque & Compras' },
    { id: 'cardapios', label: 'Cardápios' },
    { id: 'relatorios', label: 'Relatórios' }
  ];

  const categorias = ['proteína', 'carboidrato', 'vegetal', 'laticínio', 'gordura', 'tempero', 'fruta'];
  const unidades = ['kg', 'litros', 'unidades', 'dúzias', 'gramas', 'ml'];
  const tiposRefeicao = ['café da manhã', 'lanche', 'almoço', 'jantar'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Gestão da Cozinha</h2>
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

      {/* Estoque & Compras */}
      {activeTab === 'estoque' && (
        <div className="space-y-6">
          {/* Criar Ingrediente */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cadastrar Novo Ingrediente</h3>
            <form onSubmit={criarIngrediente} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Nome do ingrediente"
                value={novoIngrediente.nome}
                onChange={(e) => setNovoIngrediente({ ...novoIngrediente, nome: e.target.value })}
                className="input-field"
                required
              />
              <select
                value={novoIngrediente.unidade}
                onChange={(e) => setNovoIngrediente({ ...novoIngrediente, unidade: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Selecionar Unidade</option>
                {unidades.map(unidade => (
                  <option key={unidade} value={unidade}>{unidade}</option>
                ))}
              </select>
              <select
                value={novoIngrediente.categoria}
                onChange={(e) => setNovoIngrediente({ ...novoIngrediente, categoria: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Selecionar Categoria</option>
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
              <button type="submit" className="btn-primary">
                Cadastrar
              </button>
            </form>
          </div>

          {/* Adicionar ao Estoque */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Registrar Compra</h3>
            <form onSubmit={adicionarEstoque} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <select
                value={novoEstoque.ingrediente_id}
                onChange={(e) => setNovoEstoque({ ...novoEstoque, ingrediente_id: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Selecionar Ingrediente</option>
                {ingredientes.map(ingrediente => (
                  <option key={ingrediente.id} value={ingrediente.id}>
                    {ingrediente.nome} ({ingrediente.unidade})
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                placeholder="Quantidade"
                value={novoEstoque.quantidade}
                onChange={(e) => setNovoEstoque({ ...novoEstoque, quantidade: e.target.value })}
                className="input-field"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Preço unitário"
                value={novoEstoque.preco_unitario}
                onChange={(e) => setNovoEstoque({ ...novoEstoque, preco_unitario: e.target.value })}
                className="input-field"
                required
              />
              <input
                type="date"
                value={novoEstoque.data_compra}
                onChange={(e) => setNovoEstoque({ ...novoEstoque, data_compra: e.target.value })}
                className="input-field"
                required
              />
              <input
                type="date"
                placeholder="Data de validade"
                value={novoEstoque.data_validade}
                onChange={(e) => setNovoEstoque({ ...novoEstoque, data_validade: e.target.value })}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Fornecedor"
                value={novoEstoque.fornecedor}
                onChange={(e) => setNovoEstoque({ ...novoEstoque, fornecedor: e.target.value })}
                className="input-field"
              />
              <button type="submit" className="btn-primary md:col-span-3 lg:col-span-6">
                Registrar Compra
              </button>
            </form>
          </div>

          {/* Relatório de Estoque */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Estoque Atual</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">Ingrediente</th>
                    <th className="table-header">Categoria</th>
                    <th className="table-header">Quantidade Total</th>
                    <th className="table-header">Valor Total</th>
                    <th className="table-header">Itens Vencendo</th>
                    <th className="table-header">Última Compra</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {relatorioEstoque.map((item) => (
                    <tr key={item.ingrediente.id}>
                      <td className="table-cell font-medium">
                        {item.ingrediente.nome}
                        <span className="text-gray-500 text-xs block">
                          ({item.ingrediente.unidade})
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.ingrediente.categoria}
                        </span>
                      </td>
                      <td className="table-cell">{item.quantidadeTotal.toFixed(2)}</td>
                      <td className="table-cell">R$ {item.valorTotal.toFixed(2)}</td>
                      <td className="table-cell">
                        {item.itensVencendo > 0 ? (
                          <span className="text-red-600 font-medium">{item.itensVencendo}</span>
                        ) : (
                          <span className="text-green-600">0</span>
                        )}
                      </td>
                      <td className="table-cell">
                        {item.ultimaCompra ? new Date(item.ultimaCompra).toLocaleDateString('pt-BR') : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Cardápios */}
      {activeTab === 'cardapios' && (
        <div className="space-y-6">
          {/* Criar Cardápio */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Criar Novo Cardápio</h3>
            <form onSubmit={criarCardapio} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Nome do cardápio"
                  value={novoCardapio.nome}
                  onChange={(e) => setNovoCardapio({ ...novoCardapio, nome: e.target.value })}
                  className="input-field"
                  required
                />
                <input
                  type="date"
                  value={novoCardapio.data}
                  onChange={(e) => setNovoCardapio({ ...novoCardapio, data: e.target.value })}
                  className="input-field"
                  required
                />
                <select
                  value={novoCardapio.tipo_refeicao}
                  onChange={(e) => setNovoCardapio({ ...novoCardapio, tipo_refeicao: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Tipo de Refeição</option>
                  {tiposRefeicao.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              {/* Itens do Cardápio */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-900">Ingredientes</h4>
                  <button
                    type="button"
                    onClick={adicionarItemCardapio}
                    className="btn-secondary text-sm"
                  >
                    Adicionar Ingrediente
                  </button>
                </div>
                
                {novoCardapio.itens.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                    <select
                      value={item.ingrediente_id}
                      onChange={(e) => atualizarItemCardapio(index, 'ingrediente_id', e.target.value)}
                      className="input-field"
                      required
                    >
                      <option value="">Selecionar Ingrediente</option>
                      {ingredientes.map(ingrediente => (
                        <option key={ingrediente.id} value={ingrediente.id}>
                          {ingrediente.nome}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Quantidade"
                      value={item.quantidade}
                      onChange={(e) => atualizarItemCardapio(index, 'quantidade', e.target.value)}
                      className="input-field"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Observações"
                      value={item.observacoes}
                      onChange={(e) => atualizarItemCardapio(index, 'observacoes', e.target.value)}
                      className="input-field"
                    />
                    <button
                      type="button"
                      onClick={() => removerItemCardapio(index)}
                      className="btn-danger text-sm"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>

              <button type="submit" className="btn-primary">
                Criar Cardápio
              </button>
            </form>
          </div>

          {/* Lista de Cardápios */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cardápios Criados</h3>
            <div className="space-y-4">
              {cardapios.map((cardapio) => (
                <div key={cardapio.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{cardapio.nome}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(cardapio.data).toLocaleDateString('pt-BR')} - {cardapio.tipo_refeicao}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      cardapio.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {cardapio.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  
                  {cardapio.itens && cardapio.itens.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Ingredientes:</h5>
                      <div className="flex flex-wrap gap-2">
                        {cardapio.itens.map((item) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {item.ingrediente.nome}: {item.quantidade} {item.ingrediente.unidade}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Relatórios */}
      {activeTab === 'relatorios' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total de Ingredientes</h3>
              <p className="text-3xl font-bold text-primary-600">{ingredientes.length}</p>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Itens em Estoque</h3>
              <p className="text-3xl font-bold text-green-600">{estoque.length}</p>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cardápios Ativos</h3>
              <p className="text-3xl font-bold text-blue-600">
                {cardapios.filter(c => c.ativo).length}
              </p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Valor Total do Estoque</h3>
            <p className="text-4xl font-bold text-green-600">
              R$ {relatorioEstoque.reduce((total, item) => total + item.valorTotal, 0).toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CozinhaDashboard;

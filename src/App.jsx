import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { PlusCircle, ChevronLeft, ChevronRight, Edit, Trash2, Moon, Sun } from 'lucide-react';
import Login from './Login';

// Configuração do ChartJS
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function App() {

    const [editingIndex, setEditingIndex] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalDia, setModalDia] = useState(null);
    const [mesAtual, setMesAtual] = useState(new Date().getMonth());
    const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
    const [moeda, setMoeda] = useState('$');
    const [filtroResultado, setFiltroResultado] = useState('');
    const [novoTrade, setNovoTrade] = useState({
        data: '',
        ativo: '',
        resultado: 'Win',
        valor: '',
        comentario: '',
        imagens: Array(5).fill({ url: '', comment: '' }),
    });

    // Estados principais
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [trades, setTrades] = useState([]);

    console.log('isAuthenticated:', isAuthenticated);
    console.log('trades:', trades); 

    // Ler o estado de autenticação do localStorage
    useEffect(() => {
        const savedAuth = localStorage.getItem('isAuthenticated');
        if (savedAuth === 'true') {
            setIsAuthenticated(true);
        }

        const savedTheme = localStorage.getItem('darkMode');
        if (savedTheme === 'true') {
            setDarkMode(true);
        }
    }, []);

    // Aplicar modo escuro e salvar no localStorage
    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        localStorage.setItem('darkMode', String(darkMode));
    }, [darkMode]);

    // Função de login
    const handleLogin = () => {
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
    };

    // Função de logout
    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated');
    };

    // Exibe tela de login se não estiver autenticado
    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />;
    }

    // Funções relacionadas a trades
    const adicionarTrade = () => {
        if (editingIndex !== null) {
            const updatedTrades = [...trades];
            updatedTrades[editingIndex] = { ...novoTrade, valor: parseFloat(novoTrade.valor) };
            setTrades(updatedTrades);
            setEditingIndex(null);
        } else {
            setTrades([...trades, { ...novoTrade, valor: parseFloat(novoTrade.valor) }]);
        }
        setNovoTrade({
            data: '',
            ativo: "",
            resultado: "Win",
            valor: "",
            comentario: "",
            imagens: [{ url: "", comment: "" }, { url: "", comment: "" }, { url: "", comment: "" }, { url: "", comment: "" }, { url: "", comment: "" }]
        });
        setShowModal(false);
    };

    const removerTrade = (index) => {
        const updatedTrades = trades.filter((_, i) => i !== index);
        setTrades(updatedTrades);
        if (editingIndex === index) {
            setEditingIndex(null);
        }
        setModalDia({ ...modalDia, doDia: updatedTrades });
    };

    const editarTrade = (index) => {
        const tradeParaEditar = trades[index];
        setNovoTrade(tradeParaEditar);
        setEditingIndex(index);
        setShowModal(true);
    };

    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());

    const resumoSemana = {
        Win: trades.filter(t => new Date(t.data) >= inicioSemana && t.resultado === "Win").length,
        Loss: trades.filter(t => new Date(t.data) >= inicioSemana && t.resultado === "Loss").length,
        Breakeven: trades.filter(t => new Date(t.data) >= inicioSemana && t.resultado === "Breakeven").length
    };

    const tradesMes = trades.filter(t => new Date(t.data).getMonth() === mesAtual && new Date(t.data).getFullYear() === anoAtual);

    const tradesFiltrados = filtroResultado
        ? tradesMes.filter(t => t.resultado === filtroResultado)
        : tradesMes;

    const resumoMes = {
        Win: tradesFiltrados.filter(t => t.resultado === "Win").length,
        Loss: tradesFiltrados.filter(t => t.resultado === "Loss").length,
        Breakeven: tradesFiltrados.filter(t => t.resultado === "Breakeven").length
    };

    const totalOperacoes = tradesFiltrados.length;
    const ganhos = tradesFiltrados.filter(t => t.valor > 0).reduce((soma, t) => soma + t.valor, 0);
    const perdas = tradesFiltrados.filter(t => t.valor < 0).reduce((soma, t) => soma + t.valor, 0);
    const resultadoFinal = ganhos + perdas;
    const mediaPorOperacao = totalOperacoes ? (resultadoFinal / totalOperacoes).toFixed(2) : 0;
    const taxaAcerto = totalOperacoes ? ((resumoMes.Win / totalOperacoes) * 100).toFixed(1) : 0;

    const pieData = {
        labels: ['Win', 'Loss', 'Breakeven'],
        datasets: [{
            data: [resumoMes.Win, resumoMes.Loss, resumoMes.Breakeven],
            backgroundColor: ['#10b981', '#ef4444', '#facc15']
        }]
    };

    const barData = {
        labels: tradesFiltrados.map(t => new Date(t.data).getDate().toString().padStart(2, '0')),
        datasets: [{
            label: 'Resultado Diário',
            data: tradesFiltrados.map(t => t.valor),
            backgroundColor: '#047857'
        }]
    };

    const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
    const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();
    const dias = [];
    for (let i = 0; i < primeiroDia; i++) dias.push(null);
    for (let i = 1; i <= diasNoMes; i++) dias.push(i);

    const getCorDoDia = (dia) => {
        if (!dia) return 'bg-gray-100 dark:bg-gray-800';
        const dataStr = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const tradesDoDia = trades.filter(t => t.data === dataStr);
        if (tradesDoDia.length === 0) return 'bg-gray-100 dark:bg-gray-800';
        const saldo = tradesDoDia.reduce((soma, t) => soma + t.valor, 0);
        if (saldo > 0) return 'bg-green-100 dark:bg-green-900';
        if (saldo < 0) return 'bg-red-100 dark:bg-red-900';
        return 'bg-yellow-100 dark:bg-yellow-900';
    };

    const getResumoDoDia = (dia) => {
        if (!dia) return { trades: 0, resultado: 0 };
        const dataStr = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const tradesDoDia = trades.filter(t => t.data === dataStr);
        const resultado = tradesDoDia.reduce((soma, t) => soma + t.valor, 0);
        return { trades: tradesDoDia.length, resultado };
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white p-6 relative flex justify-center">
            <div className="w-full max-w-screen-xl">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">Diário de Trade</h1>
                <div className="flex justify-end mb-4">
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Sair
                    </button>
                </div>
            
                
                <div className="flex justify-end items-center gap-4 mb-4">
                    <button
                        onClick={() => setDarkMode(prev => !prev)}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title={darkMode ? "Light Mode" : "Dark Mode"}
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={() => {
                        setEditingIndex(null);
                        setNovoTrade({
                            data: '',
                            ativo: "",
                            resultado: "Win",
                            valor: "",
                            comentario: "",
                            imagens: [
                                { url: "", comment: "" },
                                { url: "", comment: "" },
                                { url: "", comment: "" },
                                { url: "", comment: "" },
                                { url: "", comment: "" },
                            ]
                        });
                        setShowModal(true)
                    }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        <PlusCircle size={18} /> Nova Operação
                    </button>
                </div>
                <div className="mb-4 flex items-center gap-4">
                    <label className="mr-2 font-semibold">Moeda:</label>
                    <select value={moeda} onChange={e => setMoeda(e.target.value)} className="border rounded px-2 py-1 bg-white dark:bg-gray-800 text-black dark:text-white">
                        <option value="$">Dólar ($)</option>
                        <option value="€">Euro (€)</option>
                        <option value="R$">Real (R$)</option>
                    </select>

                    <label className="mr-2 font-semibold">Filtrar por Resultado:</label>
                    <select
                        value={filtroResultado}
                        onChange={(e) => setFiltroResultado(e.target.value)}
                        className="border rounded px-2 py-1 bg-white dark:bg-gray-800 text-black dark:text-white"
                    >
                        <option value="">Todos</option>
                        <option value="Win">Win</option>
                        <option value="Loss">Loss</option>
                        <option value="Breakeven">Breakeven</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 border rounded p-4">
                        <h2 className="text-lg font-semibold mb-2">Resumo da Semana</h2>
                        <p className="text-green-600 dark:text-green-400">Win: {resumoSemana.Win}</p>
                        <p className="text-red-600 dark:text-red-400">Loss: {resumoSemana.Loss}</p>
                        <p className="text-gray-600 dark:text-gray-400">Breakeven: {resumoSemana.Breakeven}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border rounded p-4">
                        <h2 className="text-lg font-semibold mb-2">Resumo do Mês</h2>
                        <p className="text-green-600 dark:text-green-400">Win: {resumoMes.Win}</p>
                        <p className="text-red-600 dark:text-red-400">Loss: {resumoMes.Loss}</p>
                        <p className="text-gray-600 dark:text-gray-400">Breakeven: {resumoMes.Breakeven}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 border rounded p-4">
                        <h3 className="font-semibold mb-1">Total de Operações</h3>
                        <p className="text-xl font-bold">{totalOperacoes}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border rounded p-4">
                        <h3 className="font-semibold mb-1">Taxa de Acerto</h3>
                        <p className="text-xl font-bold">{taxaAcerto}%</p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${taxaAcerto}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border rounded p-4">
                        <h3 className="font-semibold mb-1">Resultado</h3>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">{`${moeda}${resultadoFinal.toFixed(2)}`}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ganhos: {`${moeda}${ganhos.toFixed(2)}`} • Perdas: {`${moeda}${perdas.toFixed(2)}`}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border rounded p-4">
                        <h3 className="font-semibold mb-1">Média por Operação</h3>
                        <p className="text-xl font-bold">{`${moeda}${mediaPorOperacao}`}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 border rounded p-4">
                        <h3 className="font-semibold mb-2">Resultado Diário (Mês Atual)</h3>
                        {/* Ajustando o tamanho do gráfico */}
                        <div className="w-full" style={{ height: '200px', maxHeight: '200px' }}>
                            <Bar data={barData} options={{ maintainAspectRatio: false }} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border rounded p-4">
                        <h3 className="font-semibold mb-2">Distribuição de Resultados (Mês Atual)</h3>
                        {/* Ajustando o tamanho do gráfico */}
                        <div className="w-full" style={{ height: '200px', maxHeight: '200px' }}>
                            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                        </div>
                    </div>
                </div>
                    
                <div className="bg-white dark:bg-gray-800 border rounded p-4">
                    <div className="bg-white dark:bg-gray-800 border rounded p-4">
                        <h2 className="text-lg font-semibold mb-2">Estatísticas do Mês</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <h3 className="text-sm text-gray-500 dark:text-gray-400">Total de Operações</h3>
                                <p className="text-lg font-bold">{totalOperacoes}</p>
                            </div>
                            <div>
                                <h3 className="text-sm text-gray-500 dark:text-gray-400">Taxa de Acerto</h3>
                                <p className="text-lg font-bold">{taxaAcerto}%</p>
                            </div>
                            <div>
                                <h3 className="text-sm text-gray-500 dark:text-gray-400">Resultado</h3>
                                <p className="text-lg font-bold text-green-600 dark:text-green-400">{moeda}{resultadoFinal.toFixed(2)}</p>
                            </div>
                            <div>
                                <h3 className="text-sm text-gray-500 dark:text-gray-400">Média por Operação</h3>
                                <p className="text-lg font-bold">{moeda}{mediaPorOperacao}</p>
                            </div>
                        </div>
                        <div className="text-sm mt-2">
                            <span className="text-green-600">Win: {resumoMes.Win}</span>,
                            <span className="text-red-600"> Loss: {resumoMes.Loss}</span>,
                            <span className="text-yellow-600"> BE: {resumoMes.Breakeven}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 border rounded p-4 mt-6">
                    <div className="flex justify-between items-center mb-2">
                        <button onClick={() => {
                            const novoMes = mesAtual === 0 ? 11 : mesAtual - 1;
                            const novoAno = mesAtual === 0 ? anoAtual - 1 : anoAtual;
                            setMesAtual(novoMes);
                            setAnoAtual(novoAno);
                        }}><ChevronLeft /></button>
                        <h3 className="font-semibold">{new Date(anoAtual, mesAtual).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h3>
                        <button onClick={() => {
                            const novoMes = mesAtual === 11 ? 0 : mesAtual + 1;
                            const novoAno = mesAtual === 11 ? anoAtual + 1 : anoAtual;
                            setMesAtual(novoMes);
                            setAnoAtual(novoAno);
                        }}><ChevronRight /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(d => (
                            <div key={d} className="text-center font-semibold text-gray-600 dark:text-gray-400">{d}</div>
                        ))}
                        {dias.map((dia, index) => {
                            const resumoDoDia = getResumoDoDia(dia);
                            const dataStr = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                            const diaFiltrado = filtroResultado ? trades.filter(t => t.data === dataStr && t.resultado === filtroResultado).length > 0 : true;

                            return (
                                <div
                                    key={index}
                                    onClick={() => {
                                        const doDia = trades.filter(t => t.data === dataStr);
                                        setModalDia({ dia, dataStr, doDia });
                                    }}
                                    className={`cursor-pointer h-20 border rounded text-center p-1 ${dia ? getCorDoDia(dia) : ''} ${diaFiltrado ? '' : 'opacity-50 pointer-events-none'}`}
                                >
                                    {dia && <div className="font-bold">{dia}</div>}
                                    {dia && (
                                        <>
                                            <div className="text-sm">Trades: {resumoDoDia.trades}</div>
                                            <div className={resumoDoDia.resultado >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                                                {resumoDoDia.resultado >= 0 ? '+' : ''}{moeda}{resumoDoDia.resultado.toFixed(2)}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md relative">
                            <button onClick={() => {
                                setShowModal(false);
                                setEditingIndex(null);
                                setNovoTrade({
                                    data: '',
                                    ativo: "",
                                    resultado: "Win",
                                    valor: "",
                                    comentario: "",
                                    imagens: [
                                        { url: "", comment: "" },
                                        { url: "", comment: "" },
                                        { url: "", comment: "" },
                                        { url: "", comment: "" },
                                        { url: "", comment: "" },
                                    ] });
                            }} className="absolute top-2 right-3 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white">&times;</button>
                            <h2 className="text-lg font-bold mb-4">{editingIndex !== null ? 'Editar Operação' : 'Registrar Operação'}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <input
                                    type="date"
                                    value={novoTrade.data}
                                    onChange={(e) => setNovoTrade({ ...novoTrade, data: e.target.value })}
                                    className="border p-2 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
                                    placeholder="Data"
                                />
                                <input
                                    type="text"
                                    placeholder="Ativo (ex: XAU/USD)"
                                    value={novoTrade.ativo}
                                    onChange={(e) => setNovoTrade({ ...novoTrade, ativo: e.target.value })}
                                    className="border p-2 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
                                />
                                <select
                                    value={novoTrade.resultado}
                                    onChange={(e) => setNovoTrade({ ...novoTrade, resultado: e.target.value })}
                                    className="border p-2 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
                                >
                                    <option value="Win">Win</option>
                                    <option value="Loss">Loss</option>
                                    <option value="Breakeven">Breakeven</option>
                                </select>
                                <input
                                    type="number"
                                    placeholder="Resultado Financeiro (ex: 100.50)"
                                    value={novoTrade.valor}
                                    onChange={(e) => setNovoTrade({ ...novoTrade, valor: e.target.value })}
                                    className="border p-2 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
                                />
                            </div>
                            <textarea
                                placeholder="Comentários gerais sobre a operação"
                                value={novoTrade.comentario}
                                onChange={(e) => setNovoTrade({ ...novoTrade, comentario: e.target.value })}
                                className="border p-2 rounded w-full mb-6 bg-white dark:bg-gray-700 text-black dark:text-white"
                            />
                            {/* Inputs para até 5 imagens e seus comentários */}
                            <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Imagens e Comentários</h3>
                            <div className="space-y-4">
                                {novoTrade.imagens.map((imagem, index) => (
                                    <div
                                        key={index}
                                        className="border rounded-lg p-4 bg-gray-100 dark:bg-gray-700 text-black dark:text-white shadow-sm"
                                    >
                                        <div className="mb-3">
                                            <input
                                                type="text"
                                                placeholder={`URL da Imagem ${index + 1}`}
                                                value={imagem.url}
                                                onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                                                className="border p-2 rounded w-full bg-white dark:bg-gray-800 text-black dark:text-white"
                                            />
                                        </div>
                                        <textarea
                                            placeholder={`Comentário da Imagem ${index + 1}`}
                                            value={imagem.comment}
                                            onChange={(e) => handleImageChange(index, 'comment', e.target.value)}
                                            className="border p-2 rounded w-full bg-white dark:bg-gray-800 text-black dark:text-white"
                                        />
                                        <div className="flex justify-end mt-3">
                                            <button
                                                onClick={() => {
                                                    const novasImagens = novoTrade.imagens.filter((_, i) => i !== index);
                                                    setNovoTrade({ ...novoTrade, imagens: novasImagens });
                                                }}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/*Botões */}
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingIndex(null);
                                        setNovoTrade({ data: '', ativo: "", resultado: "Win", valor: "", comentario: "", imagens: [
                                            { url: "", comment: "" },
                                            { url: "", comment: "" },
                                            { url: "", comment: "" },
                                            { url: "", comment: "" },
                                            { url: "", comment: "" },
                                        ] });
                                    }}
                                    className="bg-gray-300 dark:bg-gray-500 text-gray-700 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-600 w-24"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={adicionarTrade}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-24"
                                >
                                    {editingIndex !== null ? 'Salvar Edição' : 'Salvar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

{modalDia && (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
        <div className="bg-gray-800 text-white p-6 rounded shadow-lg max-w-md w-full relative">
            {/* Botão para fechar o modal */}
            <button onClick={() => setModalDia(null)} className="absolute top-2 right-3 text-gray-400 hover:text-white">
                &times;
            </button>

            {/* Título do modal */}
            <h2 className="text-lg font-bold mb-4">{`Trades do dia ${modalDia.dia}`}</h2>

            {/* Loop para exibir os trades do dia */}
            {modalDia.doDia.length === 0 ? (
                <p className="text-sm text-gray-400">Nenhuma operação registrada nesse dia.</p>
            ) : (
                modalDia.doDia.map((trade, index) => (
                    <div key={index} className="bg-gray-700 p-4 rounded mb-4">
                        {/* Exibição do ativo, resultado e valor */}
                        <h3
                            className={`font-bold ${
                                trade.resultado === "Win"
                                    ? "text-green-400"
                                    : trade.resultado === "Loss"
                                    ? "text-red-400"
                                    : "text-yellow-400"
                            }`}
                        >
                            {`${trade.ativo || "Ativo Desconhecido"} - ${trade.resultado} - ${trade.valor >= 0 ? "+" : ""}$${trade.valor}`}
                        </h3>
                        {/* Comentário opcional */}
                        {trade.comentario && (
                            <p className="text-sm text-gray-400 italic mt-2">{trade.comentario}</p>
                        )}
                        {/* Imagem do trade com efeito de zoom no hover */}
                        {trade.imagem && (
                            <div className="mt-4">
                                <img
                                    src={trade.imagem}
                                    alt="Gráfico do Trade"
                                    className="rounded trade-image cursor-pointer"
                                    style={{ width: "100%", height: "auto" }}
                                    onClick={() => {
                                        // Abrir a imagem em tela cheia
                                        const newWindow = window.open(trade.imagem, '_blank');
                                        if (newWindow) newWindow.focus();
                                    }}
                                />
                            </div>
                        )}

                        {/* Botões de ação (Editar e Remover) */}
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={() => editarTrade(index)}
                                className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                                ✏️ Editar
                            </button>
                            <button
                                onClick={() => removerTrade(index)}
                                className="text-red-400 hover:text-red-300 text-sm"
                            >
                                🗑️ Remover
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
    )}
        </div>
            </div>
        
    
            
    );
}

export default App;

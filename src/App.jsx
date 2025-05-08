import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { PlusCircle, ChevronLeft, ChevronRight, Edit, Trash2, Moon, Sun } from 'lucide-react';
import Login from './Login';

// Configuração do ChartJS
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function App() {


    const [checklist, setChecklist] = useState({
        macro: [], // Inicialmente vazio
        micro: [], // Inicialmente vazio
        execução: [], // Inicialmente vazio
    });

    const [newTask, setNewTask] = useState('');
    const [showChecklist, setShowChecklist] = useState(false);

    // Função para adicionar uma nova tarefa em uma seção específica
    const handleAddTask = (section) => {
        if (newTask.trim()) {
            setChecklist({
                ...checklist,
                [section]: [...checklist[section], { task: newTask, completed: false }],
            });
            setNewTask('');
        }
    };


    // Função para remover uma tarefa em uma seção específica
    const handleToggleComplete = (section, index) => {
        // Faz uma cópia do checklist atual
        const updatedChecklist = { ...checklist };
    
        // Atualiza o item específico dentro da seção
        updatedChecklist[section][index].completed = !updatedChecklist[section][index].completed;
    
        // Atualiza o estado do checklist
        setChecklist(updatedChecklist);
    };

    const handleRemoveTask = (section, index) => {
        // Faz uma cópia do checklist atual
        const updatedChecklist = { ...checklist };
    
        // Remove o item específico da seção
        updatedChecklist[section] = updatedChecklist[section].filter((_, i) => i !== index);
    
        // Atualiza o estado do checklist
        setChecklist(updatedChecklist);
    };
    const tradesSectionRef = React.createRef();
    const handleDateClick = (dataStr) => {
        // Rola para a seção de Trades Cadastrados
        tradesSectionRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });

        // Destacar o trade correspondente (opcional, pode ser visualmente ajustado)
        const tradeRow = document.querySelector(`[data-trade-date="${dataStr}"]`);
        if (tradeRow) {
            tradeRow.classList.add("bg-yellow-200");
            setTimeout(() => tradeRow.classList.remove("bg-yellow-200"), 2000); // Remove o destaque após 2 segundos
        }
    };

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
            document.documentElement.classList.add('dark');
        } else {
            setDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Aplicar modo escuro e salvar no localStorage
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
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

    // Função para atualizar URLs e comentários das imagens
    const handleImageChange = (index, field, value) => {
        const updatedImages = [...novoTrade.imagens];
        updatedImages[index][field] = value; // Atualiza o campo (url ou comment) no índice especificado
        setNovoTrade({ ...novoTrade, imagens: updatedImages }); // Atualiza o estado de novoTrade
    };

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
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white p-4 sm:p-6 relative flex justify-center">
            <div className="w-full max-w-screen-xl">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-gray-800 dark:text-gray-100">Diário de Trade</h1>
                <div className="flex justify-end mb-4">

                    <button 
                        onClick={handleLogout}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                        Sair
                    </button>
                </div>

                {/* Botão para exibir/esconder o checklist */}
                <div className="fixed bottom-4 right-4">
                    <button 
                        onClick={() => setShowChecklist(!showChecklist)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        {showChecklist ? 'Fechar Checklist' : 'Abrir Checklist'}
                    </button>
                </div>

                {/* Checklist Operacional */}
                {showChecklist && (
                    <div className="fixed bottom-16 right-4 bg-white dark:bg-gray-800 border rounded-lg shadow-lg w-full sm:w-96 p-4">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                            Checklist Operacional
                        </h3>

                        {/* Área rolável com altura fixa */}
                        <div className="h-80 sm:h-[600px] overflow-y-auto">
                            {/* Renderizar seções do checklist */}
                            {Object.entries(checklist).map(([section, tasks]) => (
                                <div key={section} className="mb-6">
                                    <h4 className="text-md font-semibold mb-2 capitalize">{section}</h4>
                                    <ul className="space-y-2">
                                        {tasks.map((item, index) => (
                                            <li
                                                key={index}
                                                className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded"
                                            >
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.completed}
                                                        onChange={() => handleToggleComplete(section, index)} // Passa a seção e o índice
                                                        className="form-checkbox h-5 w-5 text-blue-600"
                                                    />
                                                    <span
                                                        className={`text-sm ${
                                                            item.completed ? 'line-through text-gray-500' : ''
                                                        }`}
                                                    >
                                                        {item.task}
                                                    </span>
                                                </label>
                                                <button
                                                    onClick={() => handleRemoveTask(section, index)} // Passa a seção e o índice
                                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                                                >
                                                    Remover
                                                </button>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Campo para adicionar nova tarefa */}
                                    <div className="flex items-center space-x-2 mt-2">
                                        <input
                                            type="text"
                                            value={newTask}
                                            onChange={(e) => setNewTask(e.target.value)}
                                            placeholder={`Adicionar tarefa em ${section}`}
                                            className="border rounded px-2 py-1 flex-grow bg-gray-100 dark:bg-gray-700 text-black dark:text-white"
                                        />
                                        <button
                                            onClick={() => handleAddTask(section)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                                        >
                                            Adicionar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Botões principais */}
                <div className="flex flex-wrap justify-end items-center gap-2 sm:gap-4 mb-4">
                    <button
                        onClick={() => setDarkMode(prev => !prev)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        title={darkMode ? "Modo Claro" : "Modo Escuro"}
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

                {/* Resumo*/}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <h3 className="font-semibold mb-1">Taxa de Acerto</h3>
                        <p className="text-xl font-bold">{taxaAcerto}%</p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${taxaAcerto}%` }}></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <h3 className="font-semibold mb-1">Resultado</h3>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">{`${moeda}${resultadoFinal.toFixed(2)}`}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ganhos: {`${moeda}${ganhos.toFixed(2)}`} • Perdas: {`${moeda}${perdas.toFixed(2)}`}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                                        handleDateClick(resumoDoDia.dataStr)  // Clique na data
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


                {/* Seção de Trades Cadastrados */}
                <div ref={tradesSectionRef} className="bg-white dark:bg-gray-800 border rounded p-4 mt-6 overflow-x-auto">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Trades Cadastrados</h2>
                    {trades.length === 0 ? (
                        <p className="text-sm text-gray-600 dark:text-gray-400">Nenhum trade cadastrado ainda.</p>
                    ) : (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="text-left bg-gray-100 dark:bg-gray-700">
                                    <th className="p-2 border dark:border-gray-600">Data</th>
                                    <th className="p-2 border dark:border-gray-600">Ativo</th>
                                    <th className="p-2 border dark:border-gray-600">Resultado</th>
                                    <th className="p-2 border dark:border-gray-600">Valor</th>
                                    <th className="p-2 border dark:border-gray-600">Imagens e Comentários</th>
                                    <th className="p-2 border dark:border-gray-600">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trades.map((trade, index) => (
                                    <tr
                                        key={index}
                                        data-trade-date={trade.data} // Adiciona um atributo para identificar a data

                                        className={`hover:bg-gray-100 dark:hover:bg-gray-700 ${index % 2 === 0
                                            ? "bg-gray-50 dark:bg-gray-800"
                                            : ""
                                            }`}

                                    >
                                        <td className="p-2 border dark:border-gray-600">{trade.data}</td>
                                        <td className="p-2 border dark:border-gray-600">{trade.ativo || "N/A"}</td>
                                        <td className="p-2 border dark:border-gray-600">{trade.resultado}</td>
                                        <td className="p-2 border dark:border-gray-600">{`${moeda}${trade.valor.toFixed(2)}`}</td>
                                        <td className="p-2 border dark:border-gray-600">
                                            {trade.data}
                                        </td>
                                        <td className="p-2 border dark:border-gray-600">
                                            {trade.ativo || "N/A"}
                                        </td>
                                        <td
                                            className={`p-2 border dark:border-gray-600 ${trade.resultado === "Win"
                                                ? "text-green-500"
                                                : trade.resultado === "Loss"
                                                    ? "text-red-500"
                                                    : "text-yellow-500"
                                                }`}
                                        >
                                            {trade.resultado}
                                        </td>
                                        <td className="p-2 border dark:border-gray-600">
                                            {`${moeda}${trade.valor.toFixed(2)}`}
                                        </td>
                                        <td className="p-2 border dark:border-gray-600">
                                            {/* Imagens */}
                                            <div className="flex space-x-2 overflow-x-scroll">
                                                {trade.imagens && trade.imagens.length > 0 ? (
                                                    trade.imagens.map((imagem, imgIndex) => (
                                                        imagem.url ? (
                                                            <a
                                                                key={imgIndex}
                                                                href={imagem.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="block w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden hover:opacity-90"
                                                            >
                                                                <img
                                                                    src={imagem.url}
                                                                    alt={`Imagem ${imgIndex + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </a>
                                                        ) : (
                                                            <div
                                                                key={imgIndex}
                                                                className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs text-gray-500 dark:text-gray-400"
                                                            >
                                                                N/A
                                                            </div>
                                                        )
                                                    ))
                                                ) : (
                                                    <div className="flex items-center space-x-2">
                                                        {[...Array(5)].map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs text-gray-500 dark:text-gray-400"
                                                            >
                                                                N/A
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Comentários */}
                                            {trade.imagens.map((imagem, imgIndex) => (
                                                <div key={imgIndex} className="mt-2">
                                                    {imagem.comment && (
                                                        <details className="mt-1">
                                                            <summary className="text-blue-500 hover:underline cursor-pointer text-sm">
                                                                Ver comentário{" "}
                                                                {imgIndex + 1}
                                                            </summary>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                {imagem.comment}
                                                            </p>
                                                        </details>
                                                    )}
                                                </div>
                                            ))}
                                        </td>
                                        <td className="p-2 border dark:border-gray-600">
                                            <button
                                                onClick={() => editarTrade(index)}
                                                className="text-blue-500 hover:underline mr-2"
                                                title="Editar este trade"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => removerTrade(index)}
                                                className="text-red-500 hover:underline"
                                                title="Remover este trade"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
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
                                    ]
                                });
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
                                        setNovoTrade({
                                            data: '', ativo: "", resultado: "Win", valor: "", comentario: "", imagens: [
                                                { url: "", comment: "" },
                                                { url: "", comment: "" },
                                                { url: "", comment: "" },
                                                { url: "", comment: "" },
                                                { url: "", comment: "" },
                                            ]
                                        });
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

                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                        <div
                            className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md relative overflow-y-auto"
                            style={{
                                maxHeight: "90vh", // Limita a altura máxima para 90% da altura da viewport
                            }}
                        >
                            {/* Botão para fechar o modal */}
                            <button
                                onClick={() => {
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
                                        ],
                                    });
                                }}
                                className="absolute top-2 right-3 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                            >
                                &times;
                            </button>
                            <h2 className="text-lg font-bold mb-4">
                                {editingIndex !== null ? "Editar Operação" : "Registrar Operação"}
                            </h2>
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
                            <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
                                Imagens e Comentários
                            </h3>
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
                                                onChange={(e) => handleImageChange(index, "url", e.target.value)}
                                                className="border p-2 rounded w-full bg-white dark:bg-gray-800 text-black dark:text-white"
                                            />
                                        </div>
                                        <textarea
                                            placeholder={`Comentário da Imagem ${index + 1}`}
                                            value={imagem.comment}
                                            onChange={(e) => handleImageChange(index, "comment", e.target.value)}
                                            className="border p-2 rounded w-full bg-white dark:bg-gray-800 text-black dark:text-white"
                                        />
                                        <div className="flex justify-end mt-3">
                                            <button
                                                onClick={() => {
                                                    const novasImagens = novoTrade.imagens.filter(
                                                        (_, i) => i !== index
                                                    );
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

                            {/* Botões */}
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={() => {
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
                                            ],
                                        });
                                    }}
                                    className="bg-gray-300 dark:bg-gray-500 text-gray-700 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-600 w-24"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={adicionarTrade}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-24"
                                >
                                    {editingIndex !== null ? "Salvar Edição" : "Salvar"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>



        </div>
    );

}
export default App;

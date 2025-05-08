import React, { useState, useEffect } from 'react';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false); // Alternar entre Login e Cadastro
    const [showResetModal, setShowResetModal] = useState(false); // Mostrar o modal de "Esqueci Minha Senha"
    const [resetEmail, setResetEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetError, setResetError] = useState('');
    const [resetSuccess, setResetSuccess] = useState('');

    useEffect(() => {
        const request = indexedDB.open('UserDB', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains('users')) {
                db.createObjectStore('users', { keyPath: 'email' });
            }
        };

        request.onerror = () => {
            console.error('Erro ao abrir o IndexedDB');
        };

        request.onsuccess = () => {
            console.log('IndexedDB configurado com sucesso!');
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Por favor, preencha todos os campos.');
            return;
        }

        if (isRegistering) {
            // Lógica de cadastro
            const newUser = { email, password };

            const request = indexedDB.open('UserDB', 1);

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction('users', 'readwrite');
                const store = transaction.objectStore('users');

                const addRequest = store.add(newUser);

                addRequest.onsuccess = () => {
                    alert('Usuário cadastrado com sucesso!');
                    setIsRegistering(false); // Voltar para login após o cadastro
                    setEmail('');
                    setPassword('');
                };

                addRequest.onerror = () => {
                    setError('Erro: Este email já está cadastrado.');
                };
            };

            request.onerror = () => {
                console.error('Erro ao conectar ao IndexedDB');
                setError('Erro ao cadastrar o usuário.');
            };
        } else {
            // Lógica de login
            setLoading(true);

            const request = indexedDB.open('UserDB', 1);

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction('users', 'readonly');
                const store = transaction.objectStore('users');

                const getRequest = store.get(email);

                getRequest.onsuccess = () => {
                    const user = getRequest.result;

                    if (user && user.password === password) {
                        setError('');
                        onLogin();
                    } else {
                        setError('Email ou senha inválidos.');
                    }
                    setLoading(false);
                };

                getRequest.onerror = () => {
                    console.error('Erro ao buscar usuário no IndexedDB');
                    setError('Erro ao validar o login.');
                    setLoading(false);
                };
            };

            request.onerror = () => {
                console.error('Erro ao conectar ao IndexedDB');
                setError('Erro ao conectar ao banco de dados.');
                setLoading(false);
            };
        }
    };

    const handleResetPassword = () => {
        setResetError('');
        setResetSuccess('');

        if (!resetEmail || !newPassword) {
            setResetError('Por favor, preencha todos os campos.');
            return;
        }

        const request = indexedDB.open('UserDB', 1);

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction('users', 'readwrite');
            const store = transaction.objectStore('users');

            const getRequest = store.get(resetEmail);

            getRequest.onsuccess = () => {
                const user = getRequest.result;

                if (user) {
                    user.password = newPassword;
                    const updateRequest = store.put(user);

                    updateRequest.onsuccess = () => {
                        setResetSuccess('Senha redefinida com sucesso!');
                        setResetEmail('');
                        setNewPassword('');
                    };

                    updateRequest.onerror = () => {
                        setResetError('Erro ao redefinir a senha.');
                    };
                } else {
                    setResetError('Email não encontrado.');
                }
            };

            getRequest.onerror = () => {
                setResetError('Erro ao buscar o usuário.');
            };
        };

        request.onerror = () => {
            setResetError('Erro ao conectar ao banco de dados.');
        };
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 max-w-md w-full">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-6">
                    {isRegistering ? 'Cadastrar-se' : 'Faça login na sua conta'}
                </h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Digite seu email"
                            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-6">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            Senha
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Digite sua senha"
                            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {error && (
                        <div className="mb-4 text-sm text-red-500">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
                        disabled={loading}
                    >
                        {loading
                            ? isRegistering
                                ? 'Cadastrando...'
                                : 'Entrando...'
                            : isRegistering
                            ? 'Cadastrar'
                            : 'Entrar'}
                    </button>
                </form>

                {!isRegistering && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-6">
                        Esqueceu sua senha?{' '}
                        <button
                            onClick={() => setShowResetModal(true)}
                            className="text-blue-500 hover:underline"
                        >
                            Redefinir
                        </button>
                    </p>
                )}

                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-6">
                    {isRegistering ? (
                        <>
                            Já tem uma conta?{' '}
                            <button
                                onClick={() => setIsRegistering(false)}
                                className="text-blue-500 hover:underline"
                            >
                                Faça login
                            </button>
                        </>
                    ) : (
                        <>
                            Não tem uma conta?{' '}
                            <button
                                onClick={() => setIsRegistering(true)}
                                className="text-blue-500 hover:underline"
                            >
                                Cadastre-se
                            </button>
                        </>
                    )}
                </p>
            </div>

            {/* Modal de Redefinição de Senha */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 max-w-sm w-full">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
                            Redefinir Senha
                        </h2>
                        <div className="mb-4">
                            <label
                                htmlFor="resetEmail"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                id="resetEmail"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                placeholder="Digite seu email"
                                className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="newPassword"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                                Nova Senha
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Digite sua nova senha"
                                className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        {resetError && (
                            <div className="mb-4 text-sm text-red-500">
                                {resetError}
                            </div>
                        )}
                        {resetSuccess && (
                            <div className="mb-4 text-sm text-green-500">
                                {resetSuccess}
                            </div>
                        )}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowResetModal(false)}
                                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleResetPassword}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Redefinir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Login;
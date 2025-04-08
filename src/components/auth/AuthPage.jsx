import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Простая валидация
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    if (isLogin) {
      // Логика входа
      login({ email, password });
    } else {
      // Логика регистрации
      if (password !== confirmPassword) {
        setError('Пароли не совпадают');
        return;
      }

      register({ email, password });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">GamAlun</h1>
        <p className="text-gray-500">Инновационные решения для будущего</p>
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
          {isLogin ? 'Вход' : 'Регистрация'}
        </h2>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-gray-700 mb-2">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          
          {!isLogin && (
            <div>
              <label htmlFor="confirm-password" className="block text-gray-700 mb-2">
                Подтвердите пароль
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-blue-800 hover:bg-indigo-700 text-white p-2 rounded mt-4"
          >
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>
        
        <div className="text-center mt-4">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-800 hover:underline"
          >
            {isLogin 
              ? 'Нет аккаунта? Зарегистрируйтесь' 
              : 'Уже есть аккаунт? Войдите'}
          </button>
        </div>
        
        <p className="mt-4 text-xs text-center text-gray-500">
          Продолжая, вы соглашаетесь с нашими 
          <a href="#" className="text-blue-800 hover:underline"> Условиями использования</a> и
          <a href="#" className="text-blue-800 hover:underline"> Политикой конфиденциальности</a>.
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
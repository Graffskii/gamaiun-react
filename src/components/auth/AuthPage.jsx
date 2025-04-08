import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Путь может отличаться
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  // Состояния для всех полей
  const [name, setName] = useState(''); // Добавлено
  const [company, setCompany] = useState(''); // Добавлено
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Используем authError из контекста для отображения серверных ошибок
  // Локальный error для валидации на фронте
  const [formError, setFormError] = useState('');

  // Берем нужные функции и состояния из контекста
  const { login, register, isAuthenticated, isLoading, authError } = useAuth();
  const navigate = useNavigate();

  // Перенаправляем, если пользователь уже аутентифицирован
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); // Или на другую защищенную страницу
    }
  }, [isAuthenticated, navigate]);

  // Сбрасываем ошибку формы при переключении режима
  useEffect(() => {
    setFormError('');
  }, [isLogin]);

  // Отображаем серверную ошибку, если она есть
  useEffect(() => {
    if (authError) {
        setFormError(authError); // Показываем ошибку от API
    }
  }, [authError]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(''); // Сбрасываем локальную ошибку перед попыткой

    // --- Валидация на фронте ---
    if (!email || !password || (!isLogin && (!name || !company))) {
      setFormError('Пожалуйста, заполните все обязательные поля');
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      setFormError('Пароли не совпадают');
      return;
    }
     if (password.length < 6) { // Пример валидации длины пароля
        setFormError('Пароль должен быть не менее 6 символов');
        return;
    }
    // TODO: Добавить валидацию формата email

    try {
      if (isLogin) {
        // --- Попытка входа ---
        await login({ email, password });
        // При успехе, useEffect выше перенаправит пользователя
      } else {
        // --- Попытка регистрации ---
        await register({ name, email, password, company });
         // При успехе, useEffect выше перенаправит пользователя
      }
      // Если дошли сюда без ошибок - логин/регистрация успешны
      // navigate('/'); // Можно и здесь, но useEffect надежнее
    } catch (error) {
      // Ошибки (включая ошибки от API) уже обработаны в AuthContext
      // и установлены в authError, который мы отображаем через useEffect
      // Можно добавить дополнительное логирование здесь, если нужно
      console.error("AuthPage handleSubmit error:", error.message);
      // Сообщение об ошибке уже будет в formError благодаря useEffect [authError]
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="text-center mb-6">
        {/* Лого или название */}
        <h1 className="text-3xl font-bold text-blue-800">Gamaiun</h1>
        <p className="text-gray-500">Инновационные решения для будущего</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          {isLogin ? 'Вход в систему' : 'Создание аккаунта'}
        </h2>

        {/* Отображение ошибки */}
        {formError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Поле Имя (только для регистрации) */}
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required={!isLogin} // Обязательно для регистрации
              />
            </div>
          )}

           {/* Поле Компания (только для регистрации) */}
           {!isLogin && (
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Компания</label>
              <input
                type="text"
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required={!isLogin} // Обязательно для регистрации
              />
            </div>
          )}

          {/* Поле Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              autoComplete="email"
            />
          </div>

          {/* Поле Пароль */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          {/* Поле Подтверждение пароля (только для регистрации) */}
          {!isLogin && (
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Подтвердите пароль
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required={!isLogin}
                autoComplete="new-password"
              />
            </div>
          )}

          {/* Кнопка Отправить */}
          <button
            type="submit"
            disabled={isLoading} // Блокируем кнопку во время загрузки
            className={`w-full text-white p-2.5 rounded-lg mt-4 transition duration-200 ease-in-out ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isLoading ? 'Обработка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>

        {/* Переключение между Входом и Регистрацией */}
        <div className="text-center mt-6">
          <button
            onClick={() => {setIsLogin(!isLogin); setFormError(''); /* Сбрасываем ошибку при переключении */}}
            className="text-sm text-blue-700 hover:text-blue-900 hover:underline"
            disabled={isLoading} // Блокируем и эту кнопку во время загрузки
          >
            {isLogin
              ? 'Нет аккаунта? Создать аккаунт'
              : 'Уже есть аккаунт? Войти'}
          </button>
        </div>

        {/* Ссылки на политику (пример) */}
        <p className="mt-6 text-xs text-center text-gray-500">
          Продолжая, вы соглашаетесь с нашими
          <a href="/terms" className="text-blue-700 hover:underline mx-1">Условиями использования</a> и
          <a href="/privacy" className="text-blue-700 hover:underline ml-1">Политикой конфиденциальности</a>.
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
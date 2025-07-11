import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
// import { v4 as uuidv4 } from 'uuid'; // uuid больше не нужен для ID чатов/сообщений от бэка
import { useAuth } from './AuthContext'; // Импортируем useAuth

const API_BASE_URL = 'http://localhost:5000/api';

const AppContext = createContext();

// --- Вспомогательная функция для API запросов с токеном ---
// (Можно вынести в отдельный файл api.js)
const apiFetch = async (url, options = {}, token) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers, // Позволяет переопределить заголовки
    };
    // Добавляем токен авторизации, если он есть
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });

    // Попытаемся распарсить тело ответа, даже если статус не ОК (для сообщений об ошибках)
    let data;
    try {
        data = await response.json();
    } catch (e) {
        // Если тело не JSON или пустое, data останется undefined
        // Это нормально для ответов типа 204 No Content
        if (response.status === 204) {
            return { response, data: null }; // Возвращаем null для 204
        }
    }


    if (!response.ok) {
        // Бросаем ошибку с сообщением от сервера, если оно есть, или статус-текстом
        const errorMessage = data?.message || response.statusText || `HTTP error ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status; // Добавляем статус к объекту ошибки
        error.data = data; // Добавляем тело ответа к ошибке для возможного анализа
        throw error;
    }

    return { response, data }; // Возвращаем и ответ, и данные
};


export const AppProvider = ({ children }) => {
    const { token, user, logout } = useAuth(); // Получаем токен, пользователя и logout из AuthContext

    // Состояния чатов и сообщений
    const [chats, setChats] = useState([]); // Список всех чатов пользователя
    const [currentChat, setCurrentChat] = useState(null); // Выбранный чат (объект)
    const [messages, setMessages] = useState([]); // Сообщения текущего чата

    // Состояния загрузки
    const [isLoadingChats, setIsLoadingChats] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false); // Для индикации отправки

    // Состояние ошибок
    const [chatError, setChatError] = useState(null);

    // Состояние выбора модели для ответа
    const [chatMode, setChatMode] = useState('gen');

    // Состояние для индикации удаления
    const [isDeletingChat, setIsDeletingChat] = useState(false); 

    // --- НОВЫЕ СОСТОЯНИЯ для Google Drive ---
    const [driveItemsTree, setDriveItemsTree] = useState([]); // Хранит дерево файлов/папок
    const [selectedDriveItemIds, setSelectedDriveItemIds] = useState(new Set()); // Хранит google_id выбранных элементов
    const [isLoadingDriveItems, setIsLoadingDriveItems] = useState(false);
    const [driveItemsError, setDriveItemsError] = useState(null);

    // --- Получение структуры Google Drive ---
    const fetchDriveItems = useCallback(async () => {
        if (!token) return; // Нужен токен
        setIsLoadingDriveItems(true);
        setDriveItemsError(null);
        try {
            const { data: fetchedTree } = await apiFetch('/drive/items', {}, token);
            setDriveItemsTree(fetchedTree || []); // Устанавливаем полученное дерево
            console.log('Drive items fetched successfully.');
        } catch (error) {
            console.error("Failed to fetch drive items:", error);
            setDriveItemsError(`Не удалось загрузить структуру Диска: ${error.message}`);
            setDriveItemsTree([]); // Сбрасываем в случае ошибки
             if (error.status === 401) {
                logout(); // Разлогиниваем, если токен невалиден
            }
        } finally {
            setIsLoadingDriveItems(false);
        }
    }, [token, logout]); // Зависимости

    // Вспомогательная рекурсивная функция для получения всех ID в поддереве
    const getAllDescendantIds = useCallback((itemId, nodeMap) => {
        const ids = new Set([itemId]);
        const node = nodeMap[itemId];
        if (node && node.item_type === 'folder' && node.children) {
            node.children.forEach(child => {
                getAllDescendantIds(child.google_id, nodeMap).forEach(id => ids.add(id));
            });
        }
        return ids;
    }, []);

    // Вспомогательная функция для построения карты узлов по ID (чтобы не делать это каждый раз)
    const buildNodeMap = useCallback((tree) => {
        const map = {};
        const traverse = (nodes) => {
            nodes.forEach(node => {
                map[node.google_id] = node;
                if (node.children && node.children.length > 0) {
                    traverse(node.children);
                }
            });
        };
        traverse(tree);
        return map;
    }, []);

    const toggleDriveItemSelection = useCallback((itemId, itemType) => {
        setSelectedDriveItemIds(prevSelectedIds => {
            const newSelectedIds = new Set(prevSelectedIds); // Копируем текущий Set
            const nodeMap = buildNodeMap(driveItemsTree); // Строим карту узлов для поиска детей
            const isCurrentlySelected = newSelectedIds.has(itemId);

            if (itemType === 'file') {
                // Для файла просто добавляем или удаляем
                if (isCurrentlySelected) {
                    newSelectedIds.delete(itemId);
                } else {
                    newSelectedIds.add(itemId);
                }
            } else if (itemType === 'folder') {
                // Для папки получаем все дочерние ID
                const allIdsToToggle = getAllDescendantIds(itemId, nodeMap);

                // Определяем новое состояние: если папка была выбрана (или частично), снимаем выбор со всех.
                // Если не была выбрана, выбираем все.
                const shouldSelectAll = !isCurrentlySelected; // Простое переключение для начала

                allIdsToToggle.forEach(id => {
                    if (shouldSelectAll) {
                        newSelectedIds.add(id);
                    } else {
                        newSelectedIds.delete(id);
                    }
                });
            }
            console.log('Selected Drive IDs:', Array.from(newSelectedIds)); // Логируем для отладки
            return newSelectedIds; // Возвращаем новый Set
        });
    }, [driveItemsTree, getAllDescendantIds, buildNodeMap]); // Зависимости



    // --- Функция обновления состояния сообщения (добавление/изменение фидбека) ---
    const updateMessageFeedbackStatus = useCallback((messageId, status) => {
        setMessages(prevMessages =>
            prevMessages.map(msg =>
                msg.id === messageId
                    ? { ...msg, feedbackStatus: status } // Добавляем/обновляем поле feedbackStatus
                    : msg
            )
        );
    }, []); // Нет зависимостей, т.к. setMessages стабильна

    // --- Функция для отправки фидбека на бэкенд ---
    const submitFeedback = useCallback(async (messageId, rating, comment = null, chatId) => {
        console.log(`AppContext: submitFeedback called. messageId: ${messageId}, rating: ${rating}, comment: ${comment ? 'Present' : 'Absent'}`); // <--- ЛОГ 1

        if (!token) {
            console.error("Cannot submit feedback: Not authenticated.");
            throw new Error("Необходимо войти в систему для отправки отзыва.");
        }

        if (!chatId) { // Простая проверка, что chatId передан
            console.error("AppContext: chatId was not provided to submitFeedback.");
            throw new Error("Не удалось определить чат для отправки отзыва.");
        }

        // Оптимистичное обновление UI (сразу показываем выбранный статус)
        updateMessageFeedbackStatus(messageId, rating);

        try {
            const body = { rating };
            if (rating === 'dislike' && comment) {
                body.comment = comment;
            }

            // Находим chatId для нужного messageId
            // Это не самый эффективный способ, но рабочий для текущей структуры
            // let chatId = null;
            // console.log('AppContext: Searching for chatId...'); // <--- ЛОГ 2
            // if (currentChat && messages.some(msg => msg.id === messageId)) {
            //     chatId = currentChat.id;
            //     console.log(`AppContext: Found chatId in currentChat: ${chatId}`); // <--- ЛОГ 3а
            // } else { chats.forEach(chat => {
            //     if (currentChat?.id === chat.id && messages.some(msg => msg.id === messageId)) {
            //         chatId = chat.id;
            //     }
            //     // if (chat.messages?.find(msg => msg.id === messageId) || currentChat?.id === chat.id) {
            //     //      // Если сообщение нашлось в истории чата или это текущий чат
            //     //      // (сообщения текущего чата могут быть только в `messages`, а не в `chats` массиве)
            //     //      // Для надежности лучше бы знать chatId заранее
            //     //      chatId = chat.id;
            //     // }
            //     console.log(`AppContext: Found chatId by searching chats history (less reliable): ${chatId}`); // <--- ЛОГ 3б
            // }
            // )}

            // Если сообщение принадлежит текущему чату, берем его ID
            // const messageInCurrentChat = messages.find(msg => msg.id === messageId);
            //  if (messageInCurrentChat && currentChat) {
            //     chatId = currentChat.id;
            //  }


            // if (!chatId) {
            //     console.error(`Could not find chat ID for message ID: ${messageId}`);
            //      // Откатываем оптимистичное обновление
            //     updateMessageFeedbackStatus(messageId, undefined); // Сбрасываем статус
            //     throw new Error("Не удалось определить чат для этого сообщения.");
            // }


            // Формируем URL для API
            const apiUrl = `/chats/${chatId}/messages/${messageId}/feedback`;

            await apiFetch(apiUrl, {
                method: 'POST',
                body: JSON.stringify(body)
            }, token);

            console.log(`Feedback (${rating}) submitted successfully for message ${messageId}`);
            // Статус уже обновлен оптимистично

        } catch (error) {
            console.error("AppContext: Failed to submit feedback:", error); // <--- ЛОГ 6 (ОШИБКА)
            // Откатываем оптимистичное обновление в случае ошибки
            updateMessageFeedbackStatus(messageId, undefined); // Сбрасываем статус
            setChatError(`Ошибка отправки отзыва: ${error.message}`); // Показываем ошибку
            // Перебрасываем ошибку, чтобы модальное окно могло ее поймать
            throw error;
        }
    }, [token, updateMessageFeedbackStatus, setChatError]); // Добавили зависимости

    // --- Загрузка списка чатов пользователя ---
    const fetchChats = useCallback(async () => {
        if (!token) {
             setChats([]); // Если токена нет, очищаем чаты
             setCurrentChat(null);
             setMessages([]);
             return; // Выходим, если нет токена
        }
        setIsLoadingChats(true);
        setChatError(null);
        try {
            const { data: fetchedChats } = await apiFetch('/chats', {}, token);
            // Сортируем чаты по дате обновления (или создания), самые новые сверху
            const sortedChats = fetchedChats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            setChats(sortedChats);
            // // Автоматически выбираем самый последний чат, если он есть
            // if (sortedChats.length > 0 && !currentChat) {
            //     // Вызываем функцию выбора чата, чтобы загрузить сообщения
            //     await selectChat(sortedChats[0].id);
            // } else if (sortedChats.length === 0) {
            //     setCurrentChat(null); // Нет чатов - нет текущего
            //     setMessages([]);
            // }
            // // Если currentChat уже был, но его удалили (нет в fetchedChats), сбросим его
            // else if (currentChat && !sortedChats.find(c => c.id === currentChat.id)) {
            //     setCurrentChat(sortedChats.length > 0 ? sortedChats[0] : null);
            //     setMessages(sortedChats.length > 0 ? [] : []); // Очищаем сообщения или ставим пустой массив
            //     if (sortedChats.length > 0) {
            //        await selectChat(sortedChats[0].id); // Загружаем сообщения для нового текущего чата
            //     }
            // }

        } catch (error) {
            console.error("Failed to fetch chats:", error);
            setChatError(`Не удалось загрузить чаты: ${error.message}`);
            setChats([]); // Очищаем в случае ошибки
            setCurrentChat(null);
            setMessages([]);
            if (error.status === 401) { // Если токен невалиден/протух
                logout(); // Разлогиниваем пользователя
            }
        } finally {
            setIsLoadingChats(false);
        }
    }, [token, logout]); // Добавляем currentChat в зависимости, чтобы обработать его удаление

    // --- Загрузка сообщений для конкретного чата ---
    const fetchMessagesForChat = useCallback(async (chatId) => {
        if (!token || !chatId) return; // Нужен токен и ID чата
        setIsLoadingMessages(true);
        setChatError(null);
        setMessages([]); // Очищаем предыдущие сообщения перед загрузкой
        try {
            const { data: fetchedMessages } = await apiFetch(`/chats/${chatId}/messages`, {}, token);
             // Маппинг ответа бэкенда к структуре фронтенда, если нужно
             const formattedMessages = fetchedMessages.map(msg => ({
                id: msg.id,
                text: msg.content,
                isUser: msg.sender === 'user', // Определяем по полю sender
                timestamp: new Date(msg.timestamp), // Преобразуем строку в дату
                metadata: msg.metadata, // Сохраняем метаданные, если они есть
                feedbackStatus: msg.userFeedback || undefined
                // Добавь другие поля при необходимости
            }));
            setMessages(formattedMessages);
        } catch (error) {
            console.error(`Failed to fetch messages for chat ${chatId}:`, error);
            setChatError(`Не удалось загрузить сообщения: ${error.message}`);
            setMessages([]); // Очищаем в случае ошибки
             if (error.status === 401) {
                logout();
            } else if (error.status === 403 || error.status === 404) {
                // Чат не найден или нет доступа, возможно его удалили
                // Перезагружаем список чатов, чтобы убрать его из списка
                await fetchChats();
            }
        } finally {
            setIsLoadingMessages(false);
        }
    }, [token, logout, fetchChats]);

    // --- Выбор текущего чата ---
    const selectChat = useCallback(async (chatId) => {
        if (chatId === null || typeof chatId === 'undefined') {
            setCurrentChat(null);
            setMessages([]);
            return;
        }
        const chatToSelect = chats.find(c => c.id === chatId);
        if (chatToSelect && (!currentChat || currentChat.id !== chatId)) {
            setCurrentChat(chatToSelect);
            await fetchMessagesForChat(chatId); // Загружаем сообщения для выбранного чата
        } else if (!chatToSelect) {
            console.warn(`Attempted to select non-existent chat ID: ${chatId}`);
            // Возможно, чат был удален, перезагрузим список
            await fetchChats();
        }
    }, [chats, currentChat, fetchMessagesForChat]); // Добавили fetchChats


    // --- Создание нового чата ---
    const createNewChat = useCallback(async (title = null) => { // Принимаем опциональный title
        if (!token) return; // Нужен токен
        setIsLoadingChats(true); // Можно использовать isLoadingChats или добавить новый флаг
        setChatError(null);
        try {
            // Отправляем запрос на создание чата
            const body = title ? { title } : {}; // Отправляем title, если он есть
            const { data: newChatFromApi } = await apiFetch('/chats', {
                method: 'POST',
                body: JSON.stringify(body)
            }, token);

            // Форматируем ответ API под структуру фронтенда (добавляем пустые сообщения)
            const newChatForState = {
                ...newChatFromApi,
                 // На бэке нет поля date, используем createdAt или updatedAt
                date: new Date(newChatFromApi.updatedAt || newChatFromApi.createdAt).toLocaleDateString(),
                messages: [] // Новый чат начинается без сообщений
                // selectedFiles пока не трогаем, если они не хранятся на бэке для чата
            };

            // Добавляем новый чат в начало списка и делаем его текущим
            setChats(prevChats => [newChatForState, ...prevChats]);
            setCurrentChat(newChatForState);
            setMessages([]); // У нового чата нет сообщений

        } catch (error) {
            console.error("Failed to create new chat:", error);
            setChatError(`Не удалось создать чат: ${error.message}`);
             if (error.status === 401) {
                logout();
            }
        } finally {
            setIsLoadingChats(false);
        }
    }, [token, logout]);

    const sendMessageInternal = useCallback(async (chatId, messageData) => {
        // messageData: { content: string, mode?: 'gen'|'rag', metadata?: object }
        if (!token || !chatId) throw new Error("Authentication or Chat ID missing.");

        setIsSendingMessage(true);
        setChatError(null);

        console.log(messageData)

        try {
            const { response, data: apiResponse } = await apiFetch(`/chats/${chatId}/messages`, {
                method: 'POST',
                body: JSON.stringify(messageData)
            }, token);

            // Ожидаем { userMessage: {...} | null, aiMessage: {...} }
            if (!apiResponse || !apiResponse.aiMessage) {
               throw new Error("Invalid response structure received from server after sending message.");
            }
            return apiResponse; // Возвращаем весь ответ { userMessage, aiMessage }

        } catch (error) {
             console.error("Failed to send message via internal function:", error);
             setChatError(`Ошибка отправки сообщения: ${error.message}`);
             // Перебрасываем ошибку для обработки выше (например, для статуса 'error')
             throw error;
        } finally {
             setIsSendingMessage(false);
        }

   }, [token, setChatError]); // Основные зависимости

    // --- Старая функция sendMessage (для обычных запросов из ChatInput) ---
    const sendMessage = useCallback(async (messageContent) => {
        if (!currentChat || !messageContent.trim()) return;

        const optimisticUserMessage = {
            id: `temp-${Date.now()}`,
            text: messageContent.trim(),
            isUser: true,
            timestamp: new Date(),
            status: 'sending'
        };
        setMessages(prev => [...prev, optimisticUserMessage]);

        try {
            const messageData = {
                content: messageContent.trim(),
                mode: chatMode // Используем текущий режим из состояния
            };
            const apiResponse = await sendMessageInternal(currentChat.id, messageData);

            // Обрабатываем ответ для обычного запроса
            const userMessageFromApi = apiResponse.userMessage; // Должен быть не null
            const aiMessageFromApi = apiResponse.aiMessage;

            setMessages(prev => {
                const updatedMessages = prev.map(msg =>
                    msg.id === optimisticUserMessage.id
                        ? {
                            id: userMessageFromApi.id,
                            text: userMessageFromApi.content,
                            isUser: true,
                            timestamp: new Date(userMessageFromApi.timestamp),
                            metadata: userMessageFromApi.metadata, // <- Не уверен, что у userMessage есть metadata? Проверь модель
                            status: 'sent'
                          }
                        : msg
                );
                updatedMessages.push({
                    id: aiMessageFromApi.id,
                    text: aiMessageFromApi.content,
                    isUser: false,
                    timestamp: new Date(aiMessageFromApi.timestamp),
                    metadata: aiMessageFromApi.metadata, // Включая originalQuery для RAG
                     // feedbackStatus не приходит в этом ответе, он загружается отдельно
                });
                return updatedMessages;
            });

            // Обновляем дату чата
             setChats(prev => prev.map(chat =>
                chat.id === currentChat.id
                    ? { ...chat, updatedAt: aiMessageFromApi.timestamp }
                    : chat
            ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));

        } catch (error) {
             // Ошибка уже залогирована в sendMessageInternal
             setMessages(prev => prev.map(msg =>
                    msg.id === optimisticUserMessage.id
                        ? { ...msg, status: 'error' }
                        : msg
                ));
             if (error.status === 401) logout(); // Разлогиниваем, если нужно
        }

    }, [currentChat, chatMode, sendMessageInternal, setMessages, setChats, logout]);

    // --- НОВАЯ ФУНКЦИЯ: Генерация по клику на файл ---
    const generateFromFileClick = useCallback(async (aiMessageId, fileInfo) => {
        if (!currentChat) return;

        // 1. Найти оригинальное AI сообщение
        const originalAiMessage = messages.find(msg => msg.id === aiMessageId);
        if (!originalAiMessage || !originalAiMessage.metadata?.originalQuery) {
            console.error("Could not find original AI message or original query in metadata for ID:", aiMessageId);
            setChatError("Не удалось найти исходный запрос для этого файла.");
            return;
        }

        const originalQuery = originalAiMessage.metadata.originalQuery;
        console.log(originalAiMessage)
        const targetFileName = fileInfo.file_name;

        // 2. Добавить "фейковое" сообщение пользователя
        const userActionMessage = {
            id: `temp-file-req-${Date.now()}`,
            text: `Запрос по файлу: ${targetFileName}`,
            isUser: true, // Отображаем как сообщение пользователя
            timestamp: new Date(),
            // Можно добавить специальный тип или метаданные, если нужно его отличать
            // type: 'file_query_trigger',
             status: 'info' // Используем статус info или другой, чтобы не показывать ошибку/отправку
        };
        setMessages(prev => [...prev, userActionMessage]);

        // 3. Вызвать внутреннюю функцию отправки с нужными параметрами
        try {
            const messageData = {
                content: originalQuery, // Используем исходный вопрос
                mode: 'rag', // Можно передать RAG или убрать, бэк решит по metadata
                metadata: { targetFileName: targetFileName } // Передаем имя файла
            };
             // Показываем индикатор загрузки
            setIsSendingMessage(true); // Используем тот же флаг
            const apiResponse = await sendMessageInternal(currentChat.id, messageData);

            // Ожидаем ответ ТОЛЬКО с aiMessage
            const aiMessageFromFile = apiResponse.aiMessage;

             if (aiMessageFromFile) {
                  // Добавляем ответ от AI
                 setMessages(prev => [
                    ...prev,
                    {
                        id: aiMessageFromFile.id,
                        text: aiMessageFromFile.content,
                        isUser: false,
                        timestamp: new Date(aiMessageFromFile.timestamp),
                        metadata: aiMessageFromFile.metadata
                    }
                 ]);

                  // Обновляем дату чата
                 setChats(prev => prev.map(chat =>
                    chat.id === currentChat.id
                        ? { ...chat, updatedAt: aiMessageFromFile.timestamp }
                        : chat
                  ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
             } else {
                 // Если бэкенд не вернул aiMessage (хотя должен был)
                  throw new Error("Server did not return an AI message for the file-specific request.");
             }

        } catch (error) {
             // Ошибка уже залогирована в sendMessageInternal
             // Можно добавить специфичное сообщение
             console.error("Error during generateFromFileClick:", error);
              setChatError(`Ошибка при запросе по файлу: ${error.message}`);
             // Можно добавить сообщение об ошибке в чат
               setMessages(prev => [
                    ...prev,
                    {
                        id: `error-${Date.now()}`,
                        text: `Не удалось получить ответ по файлу "${targetFileName}". Ошибка: ${error.message}`,
                        isUser: false,
                        timestamp: new Date(),
                        isError: true // Флаг для стилизации ошибки
                    }
                ]);

              if (error.status === 401) logout();
        } finally {
              setIsSendingMessage(false); // Убираем индикатор загрузки
        }


    }, [currentChat, messages, sendMessageInternal, setMessages, setChats, logout, setChatError]); // Зависимости

    // --- НОВАЯ ФУНКЦИЯ: Удаление чата ---
    const deleteChat = useCallback(async (chatIdToDelete) => {
        if (!token) {
            console.error("Cannot delete chat: Not authenticated.");
            throw new Error("Необходимо войти в систему для удаления чата.");
        }
        // Проверяем, не идет ли уже удаление другого чата (простая блокировка)
        if (isDeletingChat) {
            console.warn("Deletion already in progress.");
            return;
        }

        setIsDeletingChat(true);
        setChatError(null); // Сбрасываем предыдущие ошибки

        try {
            // Выполняем DELETE запрос
            const { response } = await apiFetch(`/chats/${chatIdToDelete}`, {
                method: 'DELETE'
            }, token);

            // Бэкенд должен вернуть 204 No Content при успехе
            if (response.status === 204) {
                console.log(`Chat ${chatIdToDelete} deleted successfully.`);

                // Обновляем состояние на фронтенде
                setChats(prevChats => prevChats.filter(chat => chat.id !== chatIdToDelete));

                // Если удалили текущий выбранный чат
                if (currentChat?.id === chatIdToDelete) {
                    // Сбрасываем текущий чат и сообщения
                    setCurrentChat(null);
                    setMessages([]);
                    // Можно опционально выбрать следующий чат в списке, если он есть,
                    // но пока проще просто сбросить
                    // const remainingChats = chats.filter(chat => chat.id !== chatIdToDelete);
                    // if (remainingChats.length > 0) {
                    //     selectChat(remainingChats[0].id); // Выбрать первый из оставшихся
                    // }
                }
            } else {
                // Если статус не 204, считаем это неожиданным ответом
                // (хотя apiFetch должен был выбросить ошибку для 4xx/5xx)
                throw new Error(`Unexpected status code ${response.status} after delete request.`);
            }

        } catch (error) {
            console.error(`Failed to delete chat ${chatIdToDelete}:`, error);
            setChatError(`Ошибка удаления чата: ${error.message}`);
            // Перебрасываем ошибку, чтобы компонент мог ее обработать при необходимости
            throw error;
        } finally {
            setIsDeletingChat(false); // Сбрасываем флаг загрузки в любом случае
        }
    }, [token, currentChat, isDeletingChat, setChatError, selectChat]); // Добавили isDeletingChat, setChatError, selectChat


    // --- Эффект для первоначальной загрузки ---
    useEffect(() => {
        if (token) { // Загружаем, только если есть токен
            fetchChats();
            fetchDriveItems(); // Вызываем загрузку структуры Диска
        } else {
            // Если токена нет, очищаем состояния
            setChats([]);
            setCurrentChat(null);
            setMessages([]);
            setDriveItemsTree([]);
            setSelectedDriveItemIds(new Set());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]); // Зависимость от токена

    // --- Эффект для первоначальной загрузки чатов при монтировании или при появлении токена ---
    // useEffect(() => {
    //     fetchChats();
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [token]); // Зависимость только от токена, fetchChats - useCallback

    useEffect(() => {
        // Этот эффект сработает, когда isLoadingChats станет false ПОСЛЕ загрузки
        if (!isLoadingChats && chats.length > 0 && !currentChat) {
            // Если чаты загружены, их больше нуля, и НИ ОДИН чат не выбран - выбираем первый (самый новый)
            selectChat(chats[0].id);
        }
        // Дополнительная проверка: если currentChat установлен, но его больше нет в списке chats (например, удалили)
        else if (!isLoadingChats && currentChat && !chats.find(c => c.id === currentChat.id)) {
             // Выбираем первый из оставшихся или null, если список пуст
             selectChat(chats.length > 0 ? chats[0].id : null);
        }

    // Зависимости: этот эффект должен реагировать на изменение состояния загрузки, списка чатов и текущего чата
    }, [chats, currentChat, isLoadingChats, selectChat]);

    // ------------ Остальные состояния и функции (sources, chatMode и т.д.) пока оставляем без изменений -----------
    // Их нужно будет либо тоже связать с бэкендом (если они там хранятся), либо оставить как локальное состояние UI
    const [selectedFiles, setSelectedFiles] = useState([]); // Это, вероятно, UI состояние
    const [sources, setSources] = useState([ /* ... твои sources ... */ ]); // Это тоже может быть UI или загружаться откуда-то
    
    const [showSupportModal, setShowSupportModal] = useState(false); // UI состояние
    const [activeSources, setActiveSources] = useState([]); // UI состояние

    const updateSelectedFiles = useCallback((files) => { setSelectedFiles(files); }, []);
    const toggleSupportModal = () => { setShowSupportModal(prev => !prev); };
    //------------------------------------------------------------------------------------------------------------


    return (
        <AppContext.Provider value={{
            // Данные
            chats,
            currentChat,
            messages,
            sources, // Оставляем пока
            selectedFiles, // Оставляем пока
            activeSources, // Оставляем пока

            // Состояния UI и загрузки
            isLoadingChats,
            isLoadingMessages,
            isSendingMessage,
            chatError,
            chatMode, 
            showSupportModal, // Оставляем пока
            isDeletingChat,

            driveItemsTree,
            selectedDriveItemIds,
            isLoadingDriveItems,
            driveItemsError,

            
            
            

            // Функции
            fetchChats, // Можно вызывать для обновления списка
            selectChat,
            createNewChat,
            sendMessage, 
            setChatMode, 
            toggleSupportModal, // Оставляем пока
            updateSelectedFiles, // Оставляем пока
            setActiveSources, // Оставляем пока
            submitFeedback,
            deleteChat,
            fetchDriveItems, // Можно вызывать для ручного обновления
            toggleDriveItemSelection,

            generateFromFileClick, // Новая функция для клика по файлу

            // Старые функции (удалить или адаптировать)
            // setMessages, // Прямое изменение сообщений теперь не нужно
            // addMessage: sendMessage, // Переименовали
            // simulateAIResponse, // Заменено логикой в sendMessage
            // setChatHistory: setChats, // Прямое изменение чатов не нужно
            // chatHistory: chats, // Используем chats
            // setCurrentChat: selectChat // Используем selectChat
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
// src/pages/HelpPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HelpPage = () => {
  const [activeSection, setActiveSection] = useState('usageGuide'); // 'usageGuide', 'promptingTips', 'faq'

  const SectionButton = ({ sectionId, title }) => (
    <button
      onClick={() => setActiveSection(sectionId)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150
        ${activeSection === sectionId
          ? 'bg-primary text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
    >
      {title}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
      {/* Шапка с кнопкой "Вернуться" */}
      <header className="bg-gray-800 p-3 sticky top-0 z-10 shadow-md">
        <Link
          to="/" // Или на тот маршрут, где у тебя основной чат
          className="inline-flex items-center text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-150 text-sm"
        >
          <i className="ri-arrow-left-s-line mr-1 text-lg"></i>
          Вернуться в чат
        </Link>
      </header>

      {/* Основной контент */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Инструкция по использованию GamAIun</h1>

        {/* Кнопки переключения секций */}
        <div className="mb-8 flex justify-center space-x-2 sm:space-x-4 border-b border-gray-700 pb-4">
          <SectionButton sectionId="usageGuide" title="Пособие по использованию" />
          <SectionButton sectionId="promptingTips" title="Советы по промптингу" />
          <SectionButton sectionId="faq" title="FAQ" />
        </div>

        {/* Содержимое секций */}
        <div className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-lg">
          {activeSection === 'usageGuide' && <UsageGuideSection />}
          {activeSection === 'promptingTips' && <PromptingTipsSection />}
          {activeSection === 'faq' && <FaqSection />}
        </div>
      </main>

      <footer className="text-center p-4 text-sm text-gray-500 border-t border-gray-700 mt-auto">
        © {new Date().getFullYear()} GamAIun. Все права защищены.
      </footer>
    </div>
  );
};

// --- Секция "Пособие по использованию" ---
const UsageGuideSection = () => (
  <article className="prose prose-invert prose-sm sm:prose-base max-w-none space-y-6">
    <h2 className="text-2xl font-semibold text-primary">Пособие по использованию веб-приложения</h2>
    <p>
      Добро пожаловать в GamAIun – вашего интеллектуального помощника для работы с корпоративными документами!
      Это руководство поможет вам быстро освоиться и начать эффективно использовать все возможности приложения.
    </p>

    <section>
      <h3 className="text-xl font-medium">1. Начало работы и интерфейс</h3>
      <p>
        После входа в систему вы увидите основной интерфейс, состоящий из нескольких ключевых областей:
      </p>
      {/* TODO: ВСТАВИТЬ СКРИНШОТ 1: Общий вид интерфейса (левый сайдбар, центральная область чата, правый сайдбар). */}
      <figure className="my-4 p-2 bg-gray-700 rounded text-center">
          <img src="public/interface.png" alt="Общий вид интерфейса" className="mx-auto max-h-80 rounded"/>
          <figcaption className="text-xs text-gray-400 mt-1">Рис. 1: Общий вид интерфейса.</figcaption>
      </figure>
      <ul>
        <li><strong>Левый сайдбар:</strong> Здесь находится история ваших чатов и доступные источники документов (файлы и папки вашей компании).</li>
        <li><strong>Центральная область:</strong> Это ваше основное рабочее пространство для взаимодействия с AI-помощником – окно чата.</li>
        <li><strong>Правый сайдбар:</strong> Содержит информацию о вашем профиле, настройки и полезные ссылки.</li>
      </ul>
    </section>

    <section>
      <h3 className="text-xl font-medium">2. Работа с чатами</h3>
      <p>
        Вы можете создавать неограниченное количество чатов для разных задач или тем.
      </p>
      <ul>
        <li><strong>Создание нового чата:</strong> Нажмите кнопку <span className="inline-flex items-center bg-primary text-white px-1.5 py-0.5 rounded text-xs"><i className="ri-add-line mr-1"></i>Новый чат</span> в левом сайдбаре.</li>
        <li><strong>Переключение между чатами:</strong> Просто кликните на нужный чат в разделе "История чатов" в левом сайдбаре.</li>
        <li><strong>Удаление чата:</strong> Наведите курсор на чат в истории, появится иконка корзины <i className="ri-delete-bin-line"></i> для удаления (потребуется подтверждение).</li>
      </ul>
      {/* TODO: ВСТАВИТЬ СКРИНШОТ 2: Левый сайдбар с выделенной кнопкой "Новый чат" и списком чатов с иконкой удаления при наведении. */}
      <figure className="my-4 p-2 bg-gray-700 rounded text-center">
          <img src="public/chats.png" alt="Работа с чатами в левом сайдбаре" className="mx-auto max-h-60 rounded"/>
          <figcaption className="text-xs text-gray-400 mt-1">Рис. 2: Управление чатами.</figcaption>
      </figure>
    </section>

    <section>
      <h3 className="text-xl font-medium">3. Взаимодействие с AI-помощником</h3>
      <p>
        В центральной области чата вы можете задавать вопросы AI-помощнику.
      </p>
      <ul>
        <li><strong>Отправка запроса:</strong> Введите ваш вопрос в поле внизу чата и нажмите "Отправить" или клавишу Enter.</li>
        <li><strong>Выбор режима работы AI:</strong> Рядом с полем ввода есть переключатель режимов (например, "Gen" для общей генерации и "RAG" для поиска по документам). Выберите подходящий режим перед отправкой запроса.</li>
        {/* TODO: ВСТАВИТЬ СКРИНШОТ 3: Область ввода сообщения с выделенным полем ввода и переключателем режимов. */}
        <figure className="my-4 p-2 bg-gray-700 rounded text-center">
            <img src="public/changemode.png" alt="Поле ввода и выбор режима AI" className="mx-auto max-h-40 rounded"/>
            <figcaption className="text-xs text-gray-400 mt-1">Рис. 3: Отправка запроса AI.</figcaption>
        </figure>
        <li><strong>Получение ответов:</strong> AI обработает ваш запрос и предоставит ответ. Если используется режим RAG, ответ может включать ссылки на исходные документы.</li>
        <li><strong>Уточнение по файлу (для RAG):</strong> Если AI в режиме RAG предоставил список файлов, вы можете нажать на название конкретного файла в ответе, чтобы AI дал более детальный ответ, сфокусированный на этом документе.</li>
        {/* TODO: ВСТАВИТЬ СКРИНШОТ 4: Пример ответа RAG-модели со списком файлов, один из которых подсвечен для клика. */}
        <figure className="my-4 p-2 bg-gray-700 rounded text-center">
            <img src="public/fileanswerlike.png" alt="Ответ RAG-модели с файлами" className="mx-auto max-h-60 rounded"/>
            <figcaption className="text-xs text-gray-400 mt-1">Рис. 4: Уточнение ответа по файлу.</figcaption>
        </figure>
        <li><strong>Обратная связь:</strong> Вы можете оценить ответы AI, используя иконки "палец вверх" <i className="ri-thumb-up-line"></i> / "палец вниз" <i className="ri-thumb-down-line"></i>, появляющиеся при наведении на сообщение AI. Это помогает нам улучшать систему.</li>
      </ul>
    </section>

    <section>
      <h3 className="text-xl font-medium">4. Работа с источниками документов</h3>
      <p>
        В левом сайдбаре, под историей чатов, находится раздел "Источники (Диск)". Здесь отображается структура папок и файлов вашей компании, к которым у вас есть доступ.
      </p>
      <ul>
        <li><strong>Навигация по папкам:</strong> Кликайте на папки, чтобы раскрывать их и просматривать содержимое.</li>
        <li><strong>Выбор файлов для контекста:</strong> Вы можете выбирать файлы или папки с помощью чекбоксов. Выбранные файлы могут использоваться AI для более точных ответов (функционал может зависеть от текущих настроек).</li>
      </ul>
      {/* TODO: ВСТАВИТЬ СКРИНШОТ 5: Левый сайдбар с раскрытым деревом файлов и выделенными чекбоксами. */}
      <figure className="my-4 p-2 bg-gray-700 rounded text-center">
          <img src="public/choosefile.png" alt="Работа с источниками документов" className="mx-auto max-h-72 rounded"/>
          <figcaption className="text-xs text-gray-400 mt-1">Рис. 5: Просмотр и выбор источников.</figcaption>
      </figure>
      <p>
        Если у вас возникнут вопросы, не стесняйтесь обращаться в поддержку через кнопку в правом сайдбаре.
      </p>
    </section>
  </article>
);

// --- Секция "Советы по промптингу" ---
const PromptingTipsSection = () => (
  <article className="prose prose-invert prose-sm sm:prose-base max-w-none space-y-4">
    <h2 className="text-2xl font-semibold text-primary">Советы по составлению запросов (Промптинг)</h2>
    <p>Привет, коллега! Я — твой корпоративный помощник по поиску знаний. За секунды нахожу нужные документы в наших хранилищах и ищу ответы по твоим запросам.</p>
    <p>Моя «подкапотная» связка проста и надёжна: векторная модель E5 сканирует базы и отбирает самые релевантные фрагменты, а Mistral-7B превращает их в понятное объяснение, а также ты можешь получить прямую ссылку на источник.</p>
    <p>Главная цель — повысить твою продуктивность, убрать информационные «стены» и сэкономить время и бюджет на ручной работе с данными.</p>
    <p className="font-semibold">Чтобы результаты были максимально точными:</p>
    <ul className="list-disc pl-5 space-y-1">
      <li>Формулируй запрос полным, осмысленным предложением ― например: «процедура согласования договора аренды, сроки, чек-лист».</li>
      <li>Пиши естественным языком, без хаотичного набора ключевых слов.</li>
      <li>Избегай абстрактных или двусмысленных формулировок — чем яснее вопрос, тем точнее ответ.</li>
    </ul>
    <p>Задавай уточняющие вопросы, если нужно больше деталей — я помню контекст диалога и подтяну дополнительные фрагменты. Давай экономить время и работать умнее!</p>
  </article>
);

// --- Секция "FAQ" ---
const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-700 py-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left hover:text-primary transition-colors"
      >
        <h4 className="font-medium">{question}</h4>
        <i className={`ri-arrow-down-s-line transform transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      {isOpen && <div className="mt-2 text-gray-400 text-sm leading-relaxed">{answer}</div>}
    </div>
  );
};

const FaqSection = () => {
  const faqs = [
    {
      question: "Как обеспечивается безопасность моих данных?",
      answer: "Мы используем шифрование для защиты данных при передаче и хранении. Доступ к документам строго регламентирован на основе вашей роли и принадлежности к компании. Вся обработка запросов происходит в защищенной корпоративной среде."
    },
    {
      question: "Какие типы файлов я могу использовать для поиска информации?",
      answer: "Система способна работать с большинством распространенных текстовых форматов документов, таких как PDF, DOCX, TXT, Markdown. Точный список поддерживаемых форматов может обновляться."
    },
    {
      question: "Может ли AI-помощник выполнять действия, например, отправлять email или создавать задачи?",
      answer: "На данный момент основная функция AI-помощника — это поиск информации и генерация ответов на основе корпоративных документов. Возможности выполнения действий могут быть добавлены в будущих обновлениях."
    },
    {
      question: "Что делать, если я не нахожу нужный документ или ответ?",
      answer: "Попробуйте переформулировать ваш запрос, используя советы по промптингу. Если проблема сохраняется, обратитесь к администратору или в службу поддержки."
    },
  ];

  return (
    <article className="max-w-none space-y-3">
      <h2 className="text-2xl font-semibold text-primary mb-4">Часто Задаваемые Вопросы (FAQ)</h2>
      {faqs.map((faq, index) => (
        <FaqItem key={index} question={faq.question} answer={faq.answer} />
      ))}
    </article>
  );
};

export default HelpPage;
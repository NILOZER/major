// ===== TRAINING MODULE =====
// Тактическая медицина — образовательный раздел

// ===== MODULE DATA =====

const TRAINING_MODULES = [
  {
    id: 'tactical-med-basics',
    title: 'Основы тактической медицины',
    description: 'Базовые принципы оказания первой помощи в условиях боевых действий. Понимание алгоритмов и приоритетов.',
    icon: '🏥',
    sections: [
      { type: 'description', content: 'Тактическая медицина — это оказание первой помощи в условиях боевых действий. Главное отличие от гражданской медицины — приоритет на остановку массивного кровотечения и эвакуацию, а не на окончательное лечение на поле боя.' },
      {
        type: 'theory', title: 'Три фазы тактической медицины',
        items: [
          { heading: 'Фаза 1: Помощь под огнём', text: 'Оказание помощи непосредственно в зоне обстрела. Минимум действий — только остановка массивного кровотечения (турникет). Эвакуация в укрытие — главная цель.' },
          { heading: 'Фаза 2: Тактическая помощь', text: 'Помощь в укрытии вне прямой линии огня. Полный осмотр, остановка всех кровотечений, обеспечение дыхания, иммобилизация переломов.' },
          { heading: 'Фаза 3: Эвакуация', text: 'Транспортировка пострадавшего в медицинское учреждение. Поддержание жизненно важных функций во время эвакуации.' }
        ]
      },
      {
        type: 'theory', title: 'Золотой час',
        items: [
          { heading: 'Критическое время', text: 'Первый час после получения ранения является критическим для выживания. Чем быстрее пострадавший получит квалифицированную помощь, тем выше шансы на выживание.' },
          { heading: 'Платиновые 10 минут', text: 'Первые 10 минут после ранения наиболее критичны. Массивное кровотечение без остановки приводит к смерти за 2-3 минуты.' }
        ]
      }
    ],
    illustrations: ['Схема фаз тактической медицины', 'Иллюстрация "золотого часа"'],
    questions: [
      { question: 'Сколько фаз включает тактическая медицина?', options: ['Две', 'Три', 'Четыре', 'Пять'], correct: 1, explanation: 'Тактическая медицина включает три фазы: помощь под огнём, тактическая помощь в укрытии и эвакуация.' },
      { question: 'Что является главным приоритетом в фазе "Помощь под огнём"?', options: ['Проверка пульса', 'Остановка массивного кровотечения', 'Искусственное дыхание', 'Осмотр головы'], correct: 1, explanation: 'Под огнём единственное действие — остановка массивного кровотечения с помощью турникета.' },
      { question: 'Что означает понятие "Золотой час"?', options: ['Время, через которое помощь уже не нужна', 'Первый час после ранения, критический для выживания', 'Время, необходимое для подготовки аптечки', 'Оптимальное время для проведения операции'], correct: 1, explanation: '"Золотой час" — первый час после получения ранения, в течение которого пострадавший должен получить квалифицированную помощь.' },
      { question: 'Сколько минут требуется для смерти от массивного кровотечения без остановки?', options: ['10-15 минут', '30-40 минут', '2-3 минуты', '1 час'], correct: 2, explanation: 'Массивное кровотечение без остановки приводит к смерти за 2-3 минуты.' },
      { question: 'Где оказывается помощь в фазе "Тактическая помощь"?', options: ['На открытой местности', 'В укрытии вне линии огня', 'В госпитале', 'Во время движения'], correct: 1, explanation: 'Тактическая помощь оказывается в укрытии, вне прямой линии огня.' }
    ]
  },
  {
    id: 'march-algorithm',
    title: 'Алгоритм MARCH',
    description: 'MARCH — последовательность оказания помощи пострадавшему в условиях боевых действий.',
    icon: '🩺',
    sections: [
      { type: 'description', content: 'Алгоритм MARCH — это последовательность оказания помощи пострадавшему в условиях боевых действий. Он позволяет определить наиболее опасные для жизни состояния и устранять их в правильном порядке.' },
      {
        type: 'theory', title: 'Что такое MARCH?',
        items: [{ heading: 'Определение', text: 'Алгоритм MARCH используется для оказания помощи пострадавшему в условиях боевых действий. Его главная задача — устранить угрозы жизни в порядке их критичности.' }]
      },
      {
        type: 'theory', title: 'Расшифровка',
        items: [
          { heading: 'M — Massive bleeding', text: 'Остановка массивного кровотечения. Самый важный этап. Без остановки крови пострадавший может умереть за 2-3 минуты.' },
          { heading: 'A — Airway', text: 'Обеспечение проходимости дыхательных путей.' },
          { heading: 'R — Respiration', text: 'Контроль дыхания и устранение повреждений грудной клетки.' },
          { heading: 'C — Circulation', text: 'Оценка кровообращения и профилактика шока.' },
          { heading: 'H — Hypothermia', text: 'Предотвращение переохлаждения и защита пострадавшего.' }
        ]
      },
      {
        type: 'theory', title: 'Основные принципы',
        items: [
          { heading: 'Последовательность', text: 'Соблюдать последовательность действий — M → A → R → C → H.' },
          { heading: 'Контроль состояния', text: 'Постоянно контролировать состояние пострадавшего.' },
          { heading: 'Приоритет угроз', text: 'Устранять наиболее опасные угрозы жизни в первую очередь.' },
          { heading: 'Скорость', text: 'Действовать быстро и безопасно.' }
        ]
      }
    ],
    illustrations: ['Схема алгоритма MARCH', 'Порядок действий MARCH'],
    questions: [
      { question: 'Что необходимо сделать первым при массивном кровотечении?', options: ['Проверить дыхание', 'Осмотреть голову', 'Наложить турникет', 'Проверить сознание'], correct: 2, explanation: 'При массивном кровотечении приоритет — его немедленная остановка.' },
      { question: 'Как расшифровывается A в MARCH?', options: ['Assessment', 'Airway', 'Arms', 'Abdominal'], correct: 1, explanation: 'A — Airway, обеспечение проходимости дыхательных путей.' },
      { question: 'Что делать при открытом пневмотораксе?', options: ['Наложить жгут', 'Сделать искусственное дыхание', 'Наложить окклюзионную повязку', 'Зафиксировать шею'], correct: 2, explanation: 'Необходимо наложить окклюзионную (герметизирующую) повязку.' },
      { question: 'Что означает H в MARCH?', options: ['Hemorrhage', 'Hypothermia', 'Head', 'Help'], correct: 1, explanation: 'H — Hypothermia (переохлаждение).' },
      { question: 'Почему важна последовательность MARCH?', options: ['Упрощает запоминание', 'Каждый этап устраняет наиболее критичную угрозу', 'Так принято', 'Не важна'], correct: 1, explanation: 'Последовательность построена по принципу критичности угроз.' }
    ]
  },
  {
    id: 'massive-bleeding',
    title: 'Остановка массивного кровотечения',
    description: 'Методы остановки массивного кровотечения: турникеты, давящие повязки, тампонада ран.',
    icon: '🩸',
    sections: [
      { type: 'description', content: 'Остановка массивного кровотечения — самый приоритетный этап оказания помощи в тактической медицине.' },
      {
        type: 'theory', title: 'Методы остановки кровотечения',
        items: [
          { heading: 'Прямое давление', text: 'Прямая компрессия раны стерильной салфеткой с сильным нажатием.' },
          { heading: 'Давящая повязка', text: 'Тугое бинтование поверх раны. Эффективна при венозном и капиллярном кровотечении.' },
          { heading: 'Турникет (жгут)', text: 'Накладывается выше места кровотечения на конечность при артериальном кровотечении.' },
          { heading: 'Тампонада раны', text: 'Плотное заполнение раневой полости марлей. При глубоких ранениях.' }
        ]
      },
      {
        type: 'theory', title: 'Правила наложения турникета',
        items: [
          { heading: 'Положение', text: 'Выше раны на 5-7 см, на одежду или подкладку. Не на сустав.' },
          { heading: 'Затягивание', text: 'До полной остановки кровотечения. Пульс ниже турникета исчезает.' },
          { heading: 'Время', text: 'ОБЯЗАТЕЛЬНО записать время наложения.' },
          { heading: 'Контроль', text: 'Не более 2 часов летом, 1 часа зимой.' }
        ]
      }
    ],
    illustrations: ['Схема наложения турникета', 'Методы остановки кровотечения', 'Давящая повязка'],
    questions: [
      { question: 'На каком расстоянии выше раны накладывается турникет?', options: ['2-3 см', '5-7 см', '10-15 см', '20 см'], correct: 1, explanation: 'Турникет накладывается выше раны на 5-7 см.' },
      { question: 'Сколько времени турникет может быть наложен летом?', options: ['30 минут', '1 час', '2 часа', '4 часа'], correct: 2, explanation: 'Летом — до 2 часов, зимой — до 1 часа.' },
      { question: 'Какой метод при артериальном кровотечении?', options: ['Давящая повязка', 'Турникет', 'Прямое давление', 'Холодный компресс'], correct: 1, explanation: 'При артериальном кровотечении наиболее эффективен турникет.' },
      { question: 'Что обязательно сделать после наложения турникета?', options: ['Наложить шину', 'Записать время', 'Сделать искусственное дыхание', 'Обработать рану'], correct: 1, explanation: 'Необходимо записать время наложения для контроля.' },
      { question: 'Какой метод при глубоких ранах с узким каналом?', options: ['Турникет', 'Тампонада раны', 'Давящая повязка', 'Прямое давление'], correct: 1, explanation: 'Наиболее эффективна тампонада — плотное заполнение раны.' }
    ]
  },
  {
    id: 'tourniquets', title: 'Турникеты', description: 'Виды турникетов, техника наложения, контроль времени.', icon: '🔴',
    sections: [
      { type: 'description', content: 'Турникет (жгут) — основное средство остановки артериального кровотечения.' },
      {
        type: 'theory', title: 'Виды турникетов',
        items: [
          { heading: 'CAT (Combat Application Tourniquet)', text: 'Самый распространённый. Накладывается одной рукой.' },
          { heading: 'SOFT-T', text: 'Усиленный турникет для крупных конечностей.' },
          { heading: 'Импровизированный жгут', text: 'Ремень, бинт, косынка с палкой-закруткой.' }
        ]
      },
      {
        type: 'theory', title: 'Техника наложения',
        items: [
          { heading: 'Подготовка', text: 'Освободить конечность от одежды.' },
          { heading: 'Позиция', text: '5-7 см выше раны, не на сустав.' },
          { heading: 'Затягивание', text: 'До исчезновения пульса ниже турникета.' },
          { heading: 'Фиксация', text: 'Записать время. Не закрывать одеждой.' }
        ]
      }
    ],
    illustrations: ['CAT турникет', 'SOFT-T турникет', 'Правильное наложение'],
    questions: [
      { question: 'Какой турникет самый распространённый?', options: ['SOFT-T', 'CAT', 'Импровизированный', 'Эластичный бинт'], correct: 1, explanation: 'CAT — самый распространённый тактический турникет.' },
      { question: 'Куда НЕЛЬЗЯ накладывать турникет?', options: ['На плечо', 'На бедро', 'На сустав', 'На голень'], correct: 2, explanation: 'Турникет нельзя накладывать на сустав.' },
      { question: 'Чем заменить штатный турникет?', options: ['Скотчем', 'Ремнем с закруткой', 'Шнурками', 'Проволокой'], correct: 1, explanation: 'Импровизированный жгут из ремня или бинта с палкой-закруткой.' },
      { question: 'Как проверить правильность наложения?', options: ['По цвету кожи', 'По отсутствию пульса ниже', 'По жалобам', 'По виду раны'], correct: 1, explanation: 'Проверяется по отсутствию пульса ниже турникета.' },
      { question: 'Можно ли закрывать турникет одеждой?', options: ['Да', 'Нет, он должен быть виден', 'Только зимой', 'Только если зафиксирован'], correct: 1, explanation: 'Турникет должен быть виден для контроля времени.' }
    ]
  },
  {
    id: 'wound-packing', title: 'Тампонада ран', description: 'Техника тампонады глубоких ран, использование гемостатических средств.', icon: '🩹',
    sections: [
      { type: 'description', content: 'Тампонада — метод остановки кровотечения путём плотного заполнения раневой полости перевязочным материалом.' },
      {
        type: 'theory', title: 'Когда применяется тампонада',
        items: [
          { heading: 'Области применения', text: 'Шея, пах, подмышечная впадина, ягодицы — где невозможен турникет.' },
          { heading: 'Глубокие раны', text: 'С узким раневым каналом, когда прямое давление неэффективно.' }
        ]
      },
      {
        type: 'theory', title: 'Техника выполнения',
        items: [
          { heading: 'Подготовка', text: 'Открыть рану. НЕ извлекать предмет ранения.' },
          { heading: 'Заполнение', text: 'Плотно заполнять с самого глубокого места.' },
          { heading: 'Компрессия', text: 'Удерживать давление 3-5 минут.' },
          { heading: 'Повязка', text: 'Поверх тампонады — тугая давящая повязка.' }
        ]
      }
    ],
    illustrations: ['Техника тампонады', 'Зоны применения'],
    questions: [
      { question: 'Где применяется тампонада?', options: ['На руке и ноге', 'Шея, пах, подмышки', 'Только на голове', 'На любых конечностях'], correct: 1, explanation: 'Там, где невозможен турникет: шея, пах, подмышки.' },
      { question: 'Сколько минут компрессии?', options: ['30 секунд', '1-2 минуты', '3-5 минут', '10 минут'], correct: 2, explanation: 'Не менее 3-5 минут для гемостаза.' },
      { question: 'Нужно ли извлекать предмет ранения?', options: ['Да', 'Нет'], correct: 1, explanation: 'Не извлекать — он тампонирует рану изнутри.' },
      { question: 'С какого места заполнять?', options: ['С края', 'С самого глубокого', 'С поверхности', 'Произвольно'], correct: 1, explanation: 'С самого глубокого места, продвигаясь к поверхности.' },
      { question: 'Что накладывается поверх тампонады?', options: ['Турникет', 'Шина', 'Тугая давящая повязка', 'Холодный компресс'], correct: 2, explanation: 'Тугая давящая повязка для фиксации и компрессии.' }
    ]
  },
  {
    id: 'bandages', title: 'Повязки', description: 'Виды повязок, техника наложения, особенности для разных частей тела.', icon: '🩻',
    sections: [
      { type: 'description', content: 'Повязки используются для защиты раны, остановки кровотечения, фиксации материала.' },
      {
        type: 'theory', title: 'Виды повязок',
        items: [
          { heading: 'Давящая повязка', text: 'Тугое бинтование для остановки кровотечения.' },
          { heading: 'Окклюзионная повязка', text: 'Герметичная — при открытом пневмотораксе.' },
          { heading: 'Защитная повязка', text: 'Предотвращает инфицирование.' },
          { heading: 'Иммобилизирующая повязка', text: 'Фиксирует конечность при переломах.' }
        ]
      },
      {
        type: 'theory', title: 'Общие правила',
        items: [
          { heading: 'Подготовка', text: 'Стерильный материал, обработать руки.' },
          { heading: 'Направление', text: 'От периферии к центру.' },
          { heading: 'Натяжение', text: 'Каждый тур перекрывает предыдущий на половину.' },
          { heading: 'Контроль', text: 'Проверить пульс ниже повязки.' }
        ]
      }
    ],
    illustrations: ['Виды повязок', 'Техника бинтования', 'Окклюзионная повязка'],
    questions: [
      { question: 'Как бинтуется конечность?', options: ['От центра к периферии', 'От периферии к центру', 'Спирально', 'Поперечно'], correct: 1, explanation: 'От периферии к центру (от пальцев к туловищу).' },
      { question: 'Какая повязка при пневмотораксе?', options: ['Давящая', 'Окклюзионная', 'Защитная', 'Иммобилизирующая'], correct: 1, explanation: 'Окклюзионная (герметичная) повязка.' },
      { question: 'На сколько перекрывает предыдущий тур?', options: ['На четверть', 'На половину', 'На две трети', 'Полностью'], correct: 1, explanation: 'Каждый тур перекрывает предыдущий на половину.' },
      { question: 'Что проверить после наложения?', options: ['Цвет бинта', 'Пульс ниже повязки', 'Температуру', 'Всё'], correct: 1, explanation: 'Пульс ниже повязки — не пережата ли конечность.' },
      { question: 'Какая повязка предотвращает инфицирование?', options: ['Давящая', 'Окклюзионная', 'Защитная', 'Иммобилизирующая'], correct: 2, explanation: 'Защитная повязка предохраняет от инфекции.' }
    ]
  },
  {
    id: 'airway', title: 'Проходимость дыхательных путей', description: 'Техники восстановления и поддержания проходимости дыхательных путей.', icon: '💨',
    sections: [
      { type: 'description', content: 'Обеспечение проходимости дыхательных путей — второй этап алгоритма MARCH.' },
      {
        type: 'theory', title: 'Методы',
        items: [
          { heading: 'Запрокидывание головы', text: 'При отсутствии травмы шеи.' },
          { heading: 'Выдвижение челюсти', text: 'При подозрении на травму шеи.' },
          { heading: 'Воздуховод', text: 'S-образная трубка для фиксации языка.' },
          { heading: 'Ларингеальная маска', text: 'Для подготовленного персонала.' }
        ]
      },
      {
        type: 'theory', title: 'Признаки нарушения',
        items: [
          { heading: 'Хриплое дыхание', text: 'Частичная обструкция.' },
          { heading: 'Отсутствие дыхания', text: 'Критическое состояние.' },
          { heading: 'Цианоз', text: 'Посинение кожи — кислородное голодание.' },
          { heading: 'Парадоксальное дыхание', text: 'Повреждение грудной клетки.' }
        ]
      }
    ],
    illustrations: ['Приёмы восстановления', 'Воздуховод', 'Положение пострадавшего'],
    questions: [
      { question: 'Какой метод при травме шеи?', options: ['Запрокидывание', 'Выдвижение челюсти', 'Поворот на бок', 'Искусственное дыхание'], correct: 1, explanation: 'Выдвижение челюсти без движения головы.' },
      { question: 'Для чего воздуховод?', options: ['Подача кислорода', 'Фиксация языка', 'Вентиляция', 'Отсасывание'], correct: 1, explanation: 'Для фиксации корня языка и проходимости.' },
      { question: 'Признак частичной обструкции?', options: ['Быстрый пульс', 'Хриплое дыхание', 'Температура', 'Головная боль'], correct: 1, explanation: 'Хриплое или шумное дыхание.' },
      { question: 'Что такое цианоз?', options: ['Понижение давления', 'Посинение кожи', 'Учащение пульса', 'Повышение температуры'], correct: 1, explanation: 'Посинение кожи из-за кислородного голодания.' },
      { question: 'Время до повреждений мозга без кислорода?', options: ['1-2 мин', '4-6 мин', '10-15 мин', '30 мин'], correct: 1, explanation: 'Необратимые повреждения через 4-6 минут.' }
    ]
  },
  {
    id: 'chest-injuries', title: 'Ранения грудной клетки', description: 'Виды ранений: пневмоторакс, гемоторакс. Первая помощь.', icon: '🫁',
    sections: [
      { type: 'description', content: 'Ранения грудной клетки — одни из самых опасных, быстро приводят к смерти.' },
      {
        type: 'theory', title: 'Виды ранений',
        items: [
          { heading: 'Открытый пневмоторакс', text: 'Воздух поступает в плевральную полость через рану.' },
          { heading: 'Напряжённый пневмоторакс', text: 'Воздух накапливается и смещает органы.' },
          { heading: 'Гемоторакс', text: 'Скопление крови в плевральной полости.' },
          { heading: 'Флотирующая грудь', text: 'Множественные переломы рёбер.' }
        ]
      },
      {
        type: 'theory', title: 'Первая помощь',
        items: [
          { heading: 'Окклюзионная повязка', text: 'Фиксировать с трёх сторон (клапан).' },
          { heading: 'Декомпрессия', text: 'Во 2-м межреберье. Только обученным.' },
          { heading: 'Положение', text: 'Полусидя или на повреждённый бок.' },
          { heading: 'Мониторинг', text: 'Следить за дыханием и пульсом.' }
        ]
      }
    ],
    illustrations: ['Схема пневмоторакса', 'Окклюзионная повязка', 'Точка декомпрессии'],
    questions: [
      { question: 'Как фиксируется окклюзионная повязка?', options: ['Со всех сторон', 'С трёх сторон', 'Только сверху', 'Не фиксируется'], correct: 1, explanation: 'С трёх сторон — клапанный механизм.' },
      { question: 'Что такое напряжённый пневмоторакс?', options: ['Небольшое скопление', 'Накопление под давлением', 'Ушиб', 'Перелом'], correct: 1, explanation: 'Воздух под давлением, смещающий органы средостения.' },
      { question: 'Положение пострадавшего?', options: ['На спине', 'Полусидя', 'На животе', 'С опущенной головой'], correct: 1, explanation: 'Полусидя или на повреждённом боку.' },
      { question: 'Что такое гемоторакс?', options: ['Скопление воздуха', 'Скопление крови', 'Воспаление', 'Отёк'], correct: 1, explanation: 'Скопление крови в плевральной полости.' },
      { question: 'Межреберье для декомпрессии?', options: ['1-е', '2-е', '4-е', '5-е'], correct: 1, explanation: 'Во втором межреберье по среднеключичной линии.' }
    ]
  },
  {
    id: 'hypothermia', title: 'Гипотермия', description: 'Предотвращение и лечение переохлаждения.', icon: '❄️',
    sections: [
      { type: 'description', content: 'Гипотермия — опасное состояние, усугубляющее все ранения.' },
      {
        type: 'theory', title: 'Причины',
        items: [
          { heading: 'Кровопотеря', text: 'Снижает способность поддерживать температуру.' },
          { heading: 'Внешняя среда', text: 'Ветер, влажность, холод. Мокрая одежда ×25 теплопотери.' },
          { heading: 'Иммобилизация', text: 'Отсутствие мышечной активности.' },
          { heading: 'Шок', text: 'Нарушает терморегуляцию.' }
        ]
      },
      {
        type: 'theory', title: 'Профилактика',
        items: [
          { heading: 'Термоизоляция', text: 'Укрыть термоодеялом. Изолировать от земли.' },
          { heading: 'Мокрая одежда', text: 'Снять, заменить сухой.' },
          { heading: 'Согревание', text: 'Тепло в пах, подмышки, шею.' },
          { heading: 'Питьё', text: 'Тёплое (не алкоголь!).' }
        ]
      }
    ],
    illustrations: ['Зоны теплопотери', 'Термоодеяло', 'Методы согревания'],
    questions: [
      { question: 'Во сколько раз мокрая одежда увеличивает теплопотерю?', options: ['×5', '×10', '×25', '×50'], correct: 2, explanation: 'В 25 раз.' },
      { question: 'Куда прикладывать тепло?', options: ['Спина и грудь', 'Пах, подмышки, шея', 'Голова', 'Конечности'], correct: 1, explanation: 'К местам крупных сосудов.' },
      { question: 'Можно ли алкоголь?', options: ['Да', 'Нет'], correct: 1, explanation: 'Алкоголь расширяет сосуды и усиливает теплопотерю.' },
      { question: 'Что усугубляет гипотермию?', options: ['Повышение давления', 'Кровопотеря', 'Учащение пульса', 'Жар'], correct: 1, explanation: 'Кровопотеря снижает способность сохранять тепло.' },
      { question: 'Что делать с мокрой одеждой?', options: ['Оставить', 'Снять, заменить сухой', 'Выжать и надеть', 'Накрыть сверху'], correct: 1, explanation: 'Снять или разрезать, заменить сухой.' }
    ]
  },
  {
    id: 'evacuation', title: 'Эвакуация раненого', description: 'Методы транспортировки пострадавшего.', icon: '🚑',
    sections: [
      { type: 'description', content: 'Эвакуация — заключительный этап тактической медицины.' },
      {
        type: 'theory', title: 'Способы эвакуации',
        items: [
          { heading: 'Самостоятельно', text: 'При лёгких ранениях с поддержкой.' },
          { heading: 'Волоком', text: 'Под огнём, за снаряжение или одежду.' },
          { heading: 'На спине/руках', text: 'Одним спасателем.' },
          { heading: 'На носилках', text: 'Самый безопасный способ.' }
        ]
      },
      {
        type: 'theory', title: 'Правила',
        items: [
          { heading: 'Приоритет', text: 'В первую очередь — с массивным кровотечением.' },
          { heading: 'Фиксация', text: 'Зафиксировать на носилках.' },
          { heading: 'Мониторинг', text: 'Постоянно контролировать состояние.' },
          { heading: 'Связь', text: 'Сообщить количество, характер ранений, время.' }
        ]
      }
    ],
    illustrations: ['Способы эвакуации', 'Импровизированные носилки', 'Фиксация'],
    questions: [
      { question: 'Способ эвакуации под огнём?', options: ['На носилках', 'На спине', 'Волоком', 'На руках'], correct: 2, explanation: 'Волоком — самый быстрый под огнём.' },
      { question: 'Кто эвакуируется первым?', options: ['Легкораненые', 'С массивным кровотечением', 'С ушибами', 'Все сразу'], correct: 1, explanation: 'В первую очередь — с массивным кровотечением.' },
      { question: 'Что использовать вместо носилок?', options: ['Доски и ремни', 'Ветки и куртки', 'Плащ-палатку', 'Всё выше'], correct: 3, explanation: 'Любые подручные средства.' },
      { question: 'Что передать на медпункт?', options: ['Количество', 'Количество + характер + время', 'Имена', 'Ничего'], correct: 1, explanation: 'Количество, характер ранений, время прибытия.' },
      { question: 'Самый безопасный способ?', options: ['Волоком', 'На спине', 'На носилках', 'Самостоятельно'], correct: 2, explanation: 'На носилках — минимальная дополнительная травматизация.' }
    ]
  }
];

// ===== REFERENCE DATA =====

const REFERENCE_ITEMS = [
  {
    id: 'ref-march',
    title: 'Алгоритм MARCH',
    content: `<h3>MARCH — порядок оказания помощи</h3>
    <div class="theory-card"><strong>M</strong> — Massive bleeding — остановка массивного кровотечения.</div>
    <div class="theory-card"><strong>A</strong> — Airway — обеспечение проходимости дыхательных путей.</div>
    <div class="theory-card"><strong>R</strong> — Respiration — контроль дыхания, окклюзионная повязка.</div>
    <div class="theory-card"><strong>C</strong> — Circulation — оценка пульса, профилактика шока.</div>
    <div class="theory-card"><strong>H</strong> — Hypothermia — термоизоляция, согревание.</div>`
  },
  {
    id: 'ref-bleeding-types',
    title: 'Виды кровотечений',
    content: `<h3>Классификация</h3>
    <div class="theory-card"><strong>Капиллярное</strong> — останавливается самостоятельно или давящей повязкой.</div>
    <div class="theory-card"><strong>Венозное</strong> — тёмная кровь ровной струёй. Давящая повязка.</div>
    <div class="theory-card"><strong>Артериальное</strong> — алая пульсирующая струя. Турникет.</div>
    <div class="theory-card"><strong>Смешанное</strong> — при глубоких ранах. Комплекс методов.</div>`
  },
  {
    id: 'ref-tourniquet-rules',
    title: 'Правила наложения турникета',
    content: `<h3>Техника</h3>
    <div class="theory-card"><strong>Положение</strong> — выше раны на 5-7 см, не на сустав.</div>
    <div class="theory-card"><strong>Затягивание</strong> — до остановки кровотечения.</div>
    <div class="theory-card"><strong>Время</strong> — записать. Летом до 2 ч, зимой до 1 ч.</div>
    <div class="theory-card"><strong>Контроль</strong> — не закрывать одеждой. Ослаблять через 1-2 ч.</div>`
  },
  {
    id: 'ref-wound-packing',
    title: 'Тампонада ран',
    content: `<h3>Техника</h3>
    <div class="theory-card"><strong>Показания</strong> — шея, пах, подмышки, глубокие раны.</div>
    <div class="theory-card"><strong>Заполнение</strong> — с самого глубокого места.</div>
    <div class="theory-card"><strong>Компрессия</strong> — 3-5 минут.</div>
    <div class="theory-card"><strong>Повязка</strong> — тугая давящая поверх.</div>
    <div class="theory-card"><strong>Важно</strong> — не извлекать предмет ранения!</div>`
  },
  {
    id: 'ref-bandages',
    title: 'Повязки',
    content: `<h3>Правила</h3>
    <div class="theory-card"><strong>Давящая</strong> — несколько слоёв марли, тугое бинтование.</div>
    <div class="theory-card"><strong>Окклюзионная</strong> — герметичная, при пневмотораксе.</div>
    <div class="theory-card"><strong>Защитная</strong> — после обработки раны.</div>
    <div class="theory-card"><strong>Бинтование</strong> — от периферии к центру, каждый тур на половину.</div>
    <div class="theory-card"><strong>Контроль</strong> — пульс ниже повязки.</div>`
  },
  {
    id: 'ref-airway',
    title: 'Проходимость дыхательных путей',
    content: `<h3>Методы</h3>
    <div class="theory-card"><strong>Запрокидывание головы</strong> — без травмы шеи.</div>
    <div class="theory-card"><strong>Выдвижение челюсти</strong> — при травме шеи.</div>
    <div class="theory-card"><strong>Воздуховод</strong> — фиксация языка.</div>
    <div class="theory-card"><strong>Критическое время</strong> — 4-6 минут без кислорода.</div>`
  },
  {
    id: 'ref-chest-injuries',
    title: 'Ранения грудной клетки',
    content: `<h3>Помощь</h3>
    <div class="theory-card"><strong>Открытый пневмоторакс</strong> — окклюзионная повязка с 3 сторон.</div>
    <div class="theory-card"><strong>Напряжённый пневмоторакс</strong> — декомпрессия во 2-м межреберье.</div>
    <div class="theory-card"><strong>Гемоторакс</strong> — на повреждённом боку.</div>
    <div class="theory-card"><strong>Флотирующая грудь</strong> — фиксация, кислород.</div>`
  },
  {
    id: 'ref-hypothermia',
    title: 'Гипотермия',
    content: `<h3>Профилактика</h3>
    <div class="theory-card"><strong>Причины</strong> — кровопотеря, холод, влажность.</div>
    <div class="theory-card"><strong>Термоизоляция</strong> — укрыть, изолировать от земли.</div>
    <div class="theory-card"><strong>Мокрая одежда</strong> — снять, заменить сухой.</div>
    <div class="theory-card"><strong>Согревание</strong> — тепло в пах, подмышки, шею.</div>
    <div class="theory-card"><strong>Питьё</strong> — тёплое, не алкоголь!</div>`
  },
  {
    id: 'ref-evacuation',
    title: 'Эвакуация пострадавшего',
    content: `<h3>Организация</h3>
    <div class="theory-card"><strong>Приоритет</strong> — с массивным кровотечением.</div>
    <div class="theory-card"><strong>Под огнём</strong> — волоком.</div>
    <div class="theory-card"><strong>Носилки</strong> — фиксация, мониторинг.</div>
    <div class="theory-card"><strong>Связь</strong> — количество, характер, время.</div>`
  }
];

// ===== STATE =====

let currentTrainingView = 'modules';
let currentModuleId = null;
let currentReferenceId = null;
let quizAnswers = {};

// ===== RENDER =====

function initTrainingScreen() {
  currentTrainingView = 'modules';
  currentModuleId = null;
  quizAnswers = {};
  renderTrainingScreen();
}

function renderTrainingScreen() {
  const screenId = currentUserRole === 'instructor' ? 'instructor-screen' : 'cadet-screen';
  const screen = document.getElementById(screenId);
  screen.innerHTML = `
    <div class="training-container">
      <div class="training-header">
        <h1 class="training-page-title">Обучение</h1>
        <div class="training-sub-nav">
          <button class="training-nav-btn ${currentTrainingView === 'modules' || currentTrainingView === 'module' ? 'active' : ''}" onclick="switchTrainingView('modules')">
            <span>📚</span> Курсы
          </button>
          <button class="training-nav-btn ${currentTrainingView === 'reference' || currentTrainingView === 'reference-item' ? 'active' : ''}" onclick="switchTrainingView('reference')">
            <span>📖</span> Справочник
          </button>
        </div>
      </div>
      ${currentTrainingView === 'modules' ? renderModuleGrid() : ''}
      ${currentTrainingView === 'module' ? renderModuleDetail() : ''}
      ${currentTrainingView === 'reference' ? renderReferenceList() : ''}
      ${currentTrainingView === 'reference-item' ? renderReferenceContent() : ''}
    </div>
  `;
}

function switchTrainingView(view) {
  currentTrainingView = view;
  currentModuleId = null;
  quizAnswers = {};
  renderTrainingScreen();
}

// ===== MODULE GRID =====

function renderModuleGrid() {
  return `
    <div class="training-module-grid">
      ${TRAINING_MODULES.map(mod => `
        <div class="training-module-card" onclick="openTrainingModule('${mod.id}')">
          <div class="training-module-icon">${mod.icon}</div>
          <div class="training-module-info">
            <h3 class="training-module-title">${mod.title}</h3>
            <p class="training-module-desc">${mod.description}</p>
          </div>
          <button class="btn btn-primary btn-sm training-module-btn">Открыть</button>
        </div>
      `).join('')}
    </div>
  `;
}

function openTrainingModule(moduleId) {
  const mod = TRAINING_MODULES.find(m => m.id === moduleId);
  if (!mod) return;
  currentModuleId = moduleId;
  currentTrainingView = 'module';
  quizAnswers = {};
  renderTrainingScreen();
}

// ===== MODULE DETAIL =====

function renderModuleDetail() {
  const mod = TRAINING_MODULES.find(m => m.id === currentModuleId);
  if (!mod) return '<div class="loading">Модуль не найден</div>';

  const total = mod.questions.length;
  const answered = Object.keys(quizAnswers).length;

  return `
    <div class="training-module-detail">
      <button class="btn btn-ghost btn-sm training-back-btn" onclick="switchTrainingView('modules')">← К списку курсов</button>

      <div class="training-module-hero">
        <span class="training-module-hero-icon">${mod.icon}</span>
        <div>
          <h2 class="training-module-hero-title">${mod.title}</h2>
          <p class="training-module-hero-desc">${mod.description}</p>
        </div>
      </div>

      ${mod.sections.map(s => renderSection(s)).join('')}

      <!-- ILLUSTRATIONS -->
      <div class="training-block">
        <div class="training-block-header">
          <span class="training-block-icon">🎨</span>
          <h3 class="training-block-title">Иллюстрации</h3>
        </div>
        <div class="training-illustrations-grid">
          ${mod.illustrations.map((ill, i) => `
            <div class="training-illustration-card">
              <div class="training-illustration-placeholder">
                <span>📷</span>
                <span>${ill}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- VIDEO -->
      <div class="training-block">
        <div class="training-block-header">
          <span class="training-block-icon">🎬</span>
          <h3 class="training-block-title">Видеоматериалы</h3>
        </div>
        <div class="training-video-placeholder">
          <div class="training-video-placeholder-icon">▶</div>
          <p>В данном разделе будут размещены обучающие видеоматериалы по данной теме.</p>
        </div>
      </div>

      <!-- QUIZ -->
      <div class="training-block">
        <div class="training-block-header">
          <span class="training-block-icon">✍️</span>
          <h3 class="training-block-title">Проверка знаний</h3>
          <span class="training-quiz-progress">${answered}/${total}</span>
        </div>

        ${mod.questions.map((q, i) => renderQuestion(q, i, mod)).join('')}

        ${answered === total ? '<div class="training-quiz-done">✓ Все вопросы пройдены</div>' : ''}
      </div>
    </div>
  `;
}

function renderSection(section) {
  if (section.type === 'description') {
    return `<div class="training-block training-block-description"><p>${section.content}</p></div>`;
  }
  if (section.type === 'theory') {
    return `
      <div class="training-block">
        <div class="training-block-header">
          <span class="training-block-icon">📖</span>
          <h3 class="training-block-title">${section.title}</h3>
        </div>
        <div class="training-theory-grid">
          ${section.items.map(item => `
            <div class="theory-card">
              <h4 class="theory-card-title">${item.heading}</h4>
              <p class="theory-card-text">${item.text}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  return '';
}

function renderQuestion(q, index, mod) {
  const selected = quizAnswers[index];
  const showResult = selected !== undefined;

  return `
    <div class="training-question-card ${showResult ? (selected === q.correct ? 'correct' : 'wrong') : ''}">
      <div class="training-question-num">Вопрос ${index + 1}</div>
      <div class="training-question-text">${q.question}</div>
      <div class="training-question-options">
        ${q.options.map((opt, oi) => {
          let cls = 'training-option';
          if (showResult) {
            if (oi === q.correct) cls += ' correct';
            else if (oi === selected && oi !== q.correct) cls += ' wrong';
          }
          return `<button class="${cls}" onclick="answerQuiz('${mod.id}', ${index}, ${oi})" ${showResult ? 'disabled' : ''}>${opt}</button>`;
        }).join('')}
      </div>
      ${showResult ? `<div class="training-answer-explain">${q.explanation}</div>` : ''}
    </div>
  `;
}

function answerQuiz(moduleId, qIndex, answerIndex) {
  const mod = TRAINING_MODULES.find(m => m.id === moduleId);
  if (!mod) return;

  quizAnswers[qIndex] = answerIndex;
  renderTrainingScreen();

  // Scroll to this question
  setTimeout(() => {
    const cards = document.querySelectorAll('.training-question-card');
    if (cards[qIndex]) {
      cards[qIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
}

// ===== REFERENCE =====

function renderReferenceList() {
  return `
    <div class="training-reference-grid">
      ${REFERENCE_ITEMS.map(ref => `
        <div class="training-reference-card" onclick="openReference('${ref.id}')">
          <div class="training-reference-icon">📄</div>
          <div class="training-reference-info">
            <h3 class="training-reference-title">${ref.title}</h3>
            <span class="training-reference-arrow">→</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function openReference(refId) {
  currentReferenceId = refId;
  currentTrainingView = 'reference-item';
  renderTrainingScreen();
}

function renderReferenceContent() {
  const ref = REFERENCE_ITEMS.find(r => r.id === currentReferenceId);
  if (!ref) return '<div class="loading">Раздел не найден</div>';

  return `
    <div class="training-reference-content">
      <button class="btn btn-ghost btn-sm training-back-btn" onclick="switchTrainingView('reference')">← К списку разделов</button>
      <div class="training-reference-content-inner">
        ${ref.content}
      </div>
    </div>
  `;
}

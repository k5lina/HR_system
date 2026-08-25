# ИС «Подбор персонала» — ООО «Эко-Меню»

## Техническое задание для Antigravity

\---

## 1\. Постановка задачи

Разработать информационную систему подбора персонала для ООО «Эко-Меню», устраняющую следующие недостатки текущего процесса:

* Отсутствие централизованного хранения данных о кандидатах, заявках и вакансиях
* Дублирование данных в отдельных документах Word и таблицах Excel
* Высокая доля ручной обработки информации о кандидатах и вакансиях

### 1.1 Стек технологий (фактический)

|Уровень|Технология|Описание|
|-|-|-|
|Frontend|React 18 + TypeScript|SPA-приложение (Vite)|
|Стейт|React Context + хук `usePersisted`|Глобальный `AppContext`, синхронизация с `localStorage` по ключам `hr_*`|
|Маршрутизация|React Router v6|Навигация между модулями, ролевой `PrivateRoute`|
|Графики|Recharts ^2.13|Bar/Pie диаграммы в отчётах|
|Стили|CSS Modules + CSS-переменные|Без Tailwind; общая палитра в `index.css`|
|Сборка|Vite 5|Dev-сервер + production build (`tsc && vite build`)|
|E2E-тесты|Playwright|Конфиги `test-save*.spec.ts` (smoke)|
|Backend|—|Не реализован, реализация чисто frontend-only|
|БД|—|Не реализована; SQL-скрипт в разделе 7 — справочный (целевая модель)|

### 1.2 Важные замечания

**Замечание 1 — Ориентация на демо:**
Проект учебный. Приоритет — демонстрация интерфейса: нажатие кнопок, заполнение форм, смена статусов, переход документов между этапами. Серверной бизнес-логики нет.

**Замечание 2 — Frontend-only:**
Все данные (справочники, заявки, вакансии, кандидаты, интервью, проверки, офферы) хранятся в `localStorage` под префиксом `hr_*`. Первичная инициализация выполняется из модуля `src/data/initialData.ts`. Сброс к начальным данным — через кнопку «Сбросить данные» в шапке (доступна Администратору, см. `resetAllData` в `src/context/AppContext.tsx`).

**Замечание 3 — Демо-учётные записи:**
В сидовых данных предзаполнены 5 пользователей. Быстрый вход доступен с экрана `/login`:

|Email|Пароль|Роль|
|-|-|-|
|`admin@ecomenu.ru`|`admin123`|Администратор|
|`manager@ecomenu.ru`|`manager123`|Менеджер по подбору персонала|
|`head@ecomenu.ru`|`head123`|Руководитель подразделения (нач. хлебобулочного цеха)|
|`head2@ecomenu.ru`|`head123`|Руководитель подразделения (главный технолог)|
|`head3@ecomenu.ru`|`head123`|Руководитель подразделения (нач. отдела МТС)|

\---

## 2\. Роли пользователей

|Роль|ID|Описание|
|-|-|-|
|Администратор|1|Все модули + ведение справочников, пользователей, настройка системы|
|Менеджер по подбору персонала|2|Обработка заявок, создание вакансий, работа с кандидатами, аналитика|
|Руководитель подразделения|3|Создание заявок, участие в собеседовании, просмотр аналитики|

\---

## 3\. Модули системы

|Модуль|Форма|ID формы|Доступ|
|-|-|-|-|
|Авторизация|Форма авторизации|LoginPage|Все роли|
|Главная|Дашборд + хаб аналитики|HomePage|Все роли (контент адаптируется по роли)|
|Заявки на подбор|Список заявок|RequestList|Все роли|
|Заявки на подбор|Форма заявки|RequestForm|Все роли|
|Вакансии|Список вакансий|VacancyList|Менеджер, Админ|
|Вакансии|Форма вакансии|VacancyForm|Менеджер, Админ|
|Опубл. вакансии|Список публикаций|PublishedVacancyList|Менеджер, Админ|
|Опубл. вакансии|Карточка вакансии (канбан)|PublishedVacancyCard|Менеджер, Админ|
|Опубл. вакансии|Профиль кандидата|CandidateProfile|Все роли (Рук. видит только своих)|
|Отбор кандидатов|Сводная воронка по этапам|SelectionPage|Менеджер, Рук., Админ|
|Отбор кандидатов|Телефонное интервью|PhoneInterviewForm|Менеджер, Админ|
|Отбор кандидатов|Собеседование с руководителем|MainInterviewForm|Менеджер, Рук., Админ|
|Отбор кандидатов|Проверка СБ|SecurityCheckForm|Менеджер, Админ|
|Отбор кандидатов|Медицинская проверка|MedicalCheckForm|Менеджер, Админ|
|Отбор кандидатов|Предложение о трудоустройстве|OfferForm|Менеджер, Админ|
|Аналитика|Хаб отчётов (3 карточки)|AnalyticsPage|Менеджер, Рук., Админ|
|Аналитика|Воронка кандидатов|FunnelReport|Менеджер, Рук., Админ|
|Аналитика|Среднее время закрытия вакансий|TimeReport|Менеджер, Рук., Админ|
|Аналитика|Причины отказов|ReasonsReport|Менеджер, Рук., Админ|
|Справочники|Управление справочниками (8 вкладок)|DirectoriesPage|Только Админ|

\---

## 4\. Описание форм

### 4.1 Форма авторизации (LoginPage)

|Элемент|Тип|Поведение|
|-|-|-|
|Email (логин)|input\[type=email]|Обязательное|
|Пароль|input\[type=password]|Обязательное|
|Кнопка «Войти»|button|`login(email, password)` ищет пользователя в `users` (`is_active=true`); при успехе сохраняет `hr_current_user` и редиректит на `/home`|
|Быстрый вход (демо)|3 кнопки|Подставляют credentials демо-пользователей (Админ / Менеджер / Руководитель)|

### 4.1.1 Главная страница (HomePage)

Сводный дашборд + хаб аналитики; контент зависит от роли.

* **Менеджер / Администратор:** 4 stat-карточки — «Новых заявок», «Неопубликованных вакансий», «Активных публикаций», «Собеседований» (запланированных). Под ними — таблица «Опубликованные вакансии» (10 строк/стр., поиск, фильтр по отделу, сортировка по дате публикации).
* **Руководитель подразделения:** 2 stat-карточки — «Открытых заявок» (свои, статус ≠ «Выполнена»/«Отклонена»), «Собеседований» (этап 3, привязанные к пользователю, статус «Запланировано»). Таблица не отображается.
* **Хаб аналитики:** 3 кликабельные карточки → `/analytics/funnel`, `/analytics/time`, `/analytics/reasons`.

\---

### 4.2 Форма заявки на подбор (RequestForm)

|Поле|Тип|Источник / поведение|
|-|-|-|
|ID заявки|readonly|Авто (форматируется через `fmtRequestId` → `YY-MM-NN`)|
|Дата создания|readonly|Авто (текущая дата при создании)|
|Автор заявки|readonly|Авто (`currentUser.full_name`)|
|Отдел|select|Из справочника `departments`. Для Руководителя — только отделы, к которым привязана его должность через `Department_Position`|
|Должность|select|Каскад от выбранного отдела (`departmentPositions` → `positions`)|
|Тип занятости|select|Полная / Частичная / Проектная|
|Опыт (лет)|number|—|
|Зарплата от|number|Необязательное|
|Зарплата до|number|Необязательное|
|Образование|textarea|—|
|Обязанности|textarea|—|
|Требования|textarea|—|

**Кнопки (видимость зависит от роли и текущего статуса):**

* **«Сохранить»** — статус «Новая» (`status_id = 1`).
* **«Отправить на согласование»** — для Руководителя при создании или статусе «Новая» (а также Админ); статус → «В работе» (`= 2`).
* **«Создать вакансию»** — Менеджер / Админ при существующей заявке с любым статусом, кроме «Отклонена»; ведёт на `/vacancies/new?requestId=:id` с предзаполнением полей.
* **«Отклонить»** — Менеджер / Админ; статус → «Отклонена» (`= 4`).

> Примечание: смена статуса заявки на «Выполнена» (`= 3`) выполняется автоматически при закрытии связанной вакансии. Вакансия закрывается в момент принятия кандидатом предложения о трудоустройстве (см. `OfferForm.handleApprove`). Создание вакансии из заявки статус заявки не меняет.

\---

### 4.3 Форма вакансии (VacancyForm)

Создаётся из утверждённой заявки (`/vacancies/new?requestId=:id`); часть полей предзаполняется. Название и описание вакансии не редактируются вручную: `title` берётся из связанной должности, `description` пустое (зарезервировано). Статус вакансии задаётся не в форме: «Опубликована» — действием «Опубликовать» из списка, «Закрыта» — автоматически при принятии кандидатом предложения о трудоустройстве.

|Поле|Тип|Источник данных|
|-|-|-|
|ID вакансии|readonly|Авто (`fmtVacancyId` → `YY-MM-NN`)|
|Связанная заявка|readonly|Из `request_id` (отдел/должность/автор)|
|Требуемый опыт (лет)|number|Из заявки, редактируется|
|Тип занятости|select|Из заявки, редактируется|
|График работы|textarea|Ввод вручную|
|Информация о зарплате|textarea|Из заявки (`"от X до Y руб."`), редактируется|
|Обязанности|textarea|Из заявки, редактируется|
|Требования|textarea|Из заявки, редактируется|
|Условия работы|textarea|Ввод вручную|

**Кнопки:**

* **«Сохранить»** — `vacancy_status_id = 1` (Открыта) для новой; для существующей — обновляет поля.
* **«Опубликовать»** — доступна на странице `VacancyList`/`VacancyForm`; открывает модал «Канал поиска + дата публикации» → создаёт запись `Vacancy_publication`, статус вакансии → 2 (Опубликована).

\---

### 4.4 Карточка опубликованной вакансии (PublishedVacancyCard)

Объединённая страница: шапка вакансии (название, отдел, статус, каналы публикации, статистика просмотров/откликов) + таблица кандидатов с разбивкой по этапам отбора. Кандидаты не drag-and-drop'аются — переход между этапами происходит из форм этапа («Одобрить» / «Отклонить»).

|Этап|stage\_id|Открываемая форма|
|-|-|-|
|Анализ резюме|1|Профиль кандидата (`/candidates/:id`)|
|Телефонное интервью|2|`PhoneInterviewForm`|
|Собеседование с руководителем|3|`MainInterviewForm`|
|Проверка СБ|4|`SecurityCheckForm`|
|Медицинская проверка|5|`MedicalCheckForm`|
|Предложение о трудоустройстве|6|`OfferForm`|

В таблице — фильтры по этапу/каналу/статусу, поиск по ФИО, пагинация, цветной бэдж этапа/статуса.

### 4.4.1 Список опубликованных вакансий (PublishedVacancyList)

Сводная таблица всех публикаций: ID публикации, вакансия, канал (HH/Superjob с иконкой), дата публикации, просмотры, отклики, статус (активна/снята). Поиск, фильтры, пагинация. Переход в `PublishedVacancyCard` по клику.

\---

### 4.5 Профиль кандидата (CandidateProfile)

Отображает: ФИО, телефон, email (readonly), дата рождения, город, опыт работы, образование, текст резюме, текущий этап, привязка к публикации.

Редактируемые поля (через «Сохранить»): телефон, дата рождения, город, опыт, образование, текст резюме.

**Кнопки:**

* «Скачать резюме» (mock — disabled).
* «Одобрить» — на этапе 1 (Анализ резюме): переводит кандидата на этап 2.
* «Отклонить» — модал с выбором причины отказа (`Rejection_reason`) → фиксация `rejection_reason_id` и завершение отбора.
* «История отбора» — модал со списком всех связанных интервью / проверок / оффера и их статусами.

Скоринг резюме (`Resume_analysis.score` 0–100) отображается в верхней части (опционально, если анализ был запущен).

\---

### 4.5.1 Сводная воронка отбора (SelectionPage, маршрут `/selection`)

Страница «Отбор кандидатов» с переключением вкладок по этапам и ролевыми представлениями.

* **Менеджер / Администратор** видят все 5 действенных этапов — Телефонное интервью, Собеседование, Проверка СБ, Медпроверка, Оффер; плюс отдельная вкладка «Подходящие кандидаты» (готовы к проверке СБ).
* **Руководитель подразделения** видит только этап «Собеседование с руководителем» по своим публикациям и вкладку «Подходящие кандидаты».

В каждой вкладке: таблица кандидатов с фильтрами (отдел, статус), поиском, сортировкой по дате/приоритету статуса, пагинацией. Действия: «Открыть» (карточка этапа), «Отправить на проверку СБ» (для подходящих кандидатов).

\---

### 4.6 Форма телефонного интервью (PhoneInterviewForm)

|Поле|Тип|Поведение|
|-|-|-|
|ID интервью|readonly|`fmtInterviewId` → `2-YY-MM-NN`|
|ФИО кандидата / должность / отдел|readonly|Авто из публикации/вакансии|
|Дата и время|datetime-local|Авто (текущая) при создании|
|Список вопросов|textarea|—|
|Ответы кандидата|textarea|—|
|Оценка кандидата|textarea|Свободный комментарий (не число)|
|Статус|readonly|Авто по действию кнопки|

**Кнопки:**

* **«Сохранить»** — фиксирует поля, статус «Запланировано» (`= 1`).
* **«Одобрить»** — статус «Проведено успешно» (`= 2`), `candidate.stage_id` → 3, автоматически создаётся запись `Interview` для следующего этапа.
* **«Отклонить»** — модал «Причина отказа» (`Rejection_reason`); статус «Кандидат не подходит» (`= 4`), фиксируется `rejection_reason_id`.

\---

### 4.7 Форма собеседования с руководителем (MainInterviewForm)

|Поле|Тип|Поведение|
|-|-|-|
|ID интервью|readonly|`fmtInterviewId` → `3-YY-MM-NN`|
|Руководитель|readonly|Из автора заявки (`User`)|
|Дата и время|datetime-local|Авто при создании|
|Оценка кандидата|textarea|Свободный комментарий|
|Статус|readonly|Авто по действию кнопки|

Доступ: Менеджер, Руководитель подразделения, Админ.

**Кнопки:** «Сохранить» / «Одобрить» (→ переводит кандидата в «Подходящие», следующий этап выбирается через действие «Отправить на проверку СБ») / «Отклонить» (модал с причиной отказа).

\---

### 4.8 Форма проверки службой безопасности (SecurityCheckForm)

Двухколонный макет.

|Поле|Тип|Заполнение|
|-|-|-|
|ID проверки|readonly|`fmtSecurityCheckId` → `YY-MM-NN`|
|ФИО кандидата|text readonly|Авто из профиля|
|Дата рождения|date readonly|Авто из профиля|
|Должность / отдел|text readonly|Авто из вакансии|
|Серия паспорта|text|Вручную|
|Номер паспорта|text|Вручную|
|Дата выдачи паспорта|date|Вручную|
|ИНН|text|Вручную|
|Адрес регистрации|text|Вручную|
|Дата начала проверки|date readonly|Авто при «Отправить запрос»|
|ID отчёта (mock Spectrum)|number readonly|Генерируется `generateMockSpectrumId()` (9-значное число)|
|Дата завершения|date|Авто при сохранении результата|
|Результат проверки|select|— / Пройдена / Не пройдена|
|Файл заключения|file upload|UI присутствует, загрузка disabled (mock)|

**Кнопки:**

* **«Отправить запрос в СБ»** — фиксирует `created_at` и `report_id` (mock Spectrum).
* **«Сохранить»** — обновляет поля без перехода.
* **«Одобрить»** — `result = true`, `candidate.stage_id` → 5 (для производственного персонала автоматически создаётся `Medical_check`) либо → 6 для непроизводственного (создаётся `Job_offer`).
* **«Отклонить»** — модал с причиной (`= 4 Неуспешная проверка СБ`); `result = false`, фиксируется отказ.

\---

### 4.9 Форма медицинской проверки (MedicalCheckForm)

Чек-лист этапов медпроверки. Переход между подэтапами осуществляется кнопкой «Применить» рядом с каждой подсекцией; статус (`Medical_check_status`) автоматически меняется в зависимости от заполненных шагов.

|Поле|Тип|Поведение|
|-|-|-|
|ID проверки|readonly|`fmtMedicalCheckId` → `YY-MM-NN`|
|ФИО / Должность / Отдел|readonly|Авто|
|Наличие медкнижки|toggle (Да / Нет)|+ кнопка «Применить»|
|Результат проверки медкнижки|select (Корректна / Некорректна)|+ кнопка «Применить»|
|Дата медосмотра|date|—|
|Результат медосмотра|select (Удовлетворительный / Неудовлетворительный)|+ кнопка «Применить»|
|Медкнижка оформлена|checkbox|—|
|Файл заключения|file upload (mock disabled)|—|
|Статус медпроверки|readonly|Из справочника `Medical_check_status` (7 значений)|

**Кнопки:** «Сохранить» (фиксирует поля). При успешном завершении (медкнижка корректна + медосмотр пройден) автоматически создаётся `Job_offer` и `candidate.stage_id` → 6. При неуспехе — фиксируется `rejection_reason_id` (5/6/7) и кандидат завершает отбор.

\---

### 4.10 Форма предложения о трудоустройстве (OfferForm)

Сетка 3×3 в верхней части + три текстарии снизу.

|Поле|Тип|Заполнение|
|-|-|-|
|ID оффера|readonly|`fmtOfferId` → `YY-MM-NN`|
|Дата создания|readonly|Авто|
|ФИО кандидата|readonly|Авто|
|Отдел / Должность|readonly|Авто из вакансии|
|Руководитель|readonly|Из автора заявки (`User`)|
|Тип трудового договора|select|Срочный / Бессрочный|
|Предлагаемая зарплата|number|Вручную|
|Дата выхода на работу|date|Вручную|
|График работы|textarea readonly|Авто из вакансии|
|Обязанности|textarea readonly|Авто из вакансии|
|Условия работы|textarea readonly|Авто из вакансии|
|Заметки по обсуждению|textarea|Вручную|
|Статус предложения|readonly|Из справочника `Offer_status`|

**Кнопки:**

* **«Сохранить»** — фиксирует поля, статус «В процессе» (`= 1`).
* **«Одобрить (Принято)»** — статус «Принято» (`= 2`); это финальное состояние удачного отбора. Дополнительно закрывает связанную вакансию (`vacancy_status_id = 3`, фиксируется `closed_at`, активные публикации снимаются) и переводит связанную заявку в «Выполнена» (`request_status_id = 3`).
* **«Отклонить»** — модал-подтверждение, статус «Отклонено» (`= 3`).
* **«Скачать предложение»** — UI присутствует, действие disabled (mock).

\---

## 5\. Аналитические отчёты

Все отчёты доступны Менеджеру / Руководителю / Админу. Точка входа — `AnalyticsPage` (`/analytics`) с тремя кликабельными карточками; каждый отчёт — отдельная страница.

### 5.1 Воронка кандидатов (FunnelReport, `/analytics/funnel`)

Каскадные фильтры: отдел → должность → вакансия. Кнопка «Сформировать отчёт». Таблица по этапам отбора: этап, визуальная полоса (масштаб от максимального этапа), количество кандидатов, относительная и абсолютная конверсия (%). Кнопка «Скачать отчёт» — disabled (mock).

```
// Конверсия перехода между этапами:
C\_этап = (K\_n / K\_{n-1}) × 100%

// Абсолютная конверсия n-го этапа:
C\_n\_абс = (K\_n / M) × 100%

// K\_n    — кол-во кандидатов на этапе n
// K\_{n-1} — кол-во кандидатов на предыдущем этапе
// M      — общее количество откликов на вакансию
```

\---

### 5.2 Среднее время закрытия вакансий (TimeReport, `/analytics/time`)

Фильтры: дата от / дата до, отдел, вакансия. Recharts `BarChart` со средним временем по 5 этапам. Отдельный блок «Среднее время закрытия вакансии» в днях. По умолчанию используется stub-набор (`USE_STUB = true` в коде) для наглядного отчёта при пустой БД. «Скачать отчёт» — disabled (mock).

```
// Среднее время этапа (дни):
T = Σ(t\_конец\_k - t\_начало\_k) / N

// Итоговое среднее время закрытия вакансии:
T\_закр = Σ T\_m  (сумма по 5 этапам, m = 1..5)

// N   — количество кандидатов, завершивших этап
// T\_m — среднее время m-го этапа
```

\---

### 5.3 Причины отказов кандидатам (ReasonsReport, `/analytics/reasons`)

Фильтры: дата от / дата до, отдел, вакансия. Recharts `PieChart` с распределением отказов по причинам (`Rejection_reason`); легенда сбоку, проценты — на сегментах. «Скачать отчёт» — disabled (mock).

```
// Доля отказов по причине p:
D\_p = (K\_p / K\_отказ) × 100%

// K\_p      — количество отказов по причине p
// K\_отказ  — общее количество отказов за период
```

\---

### 5.4 Оценка кандидата по резюме

|Критерий|Вес (w\_i)|
|-|-|
|Наличие требуемых профессиональных навыков|0.35|
|Соответствие опыта работы требованиям вакансии|0.30|
|Соответствие уровня образования|0.20|
|Наличие профильных сертификатов и курсов|0.10|
|Профессиональные достижения|0.05|

```
// Итоговая взвешенная оценка по критериям (0–10):
S = Σ (w_i × s_i),  i = 1..5      // см. utils/calcResumeScore

// Статусы по диапазону S (utils/getResumeStatusLabel, шкала 0–10):
S ∈ [0,   3.99] → «Не подходит»
S ∈ [4,   5.99] → «Частично подходит»
S ∈ [6,   7.99] → «Хороший кандидат»
S ∈ [8,  10   ] → «Отличный кандидат»
Ошибка LLM      → «Требует ручной проверки»
```

> Примечание: в справочнике `Resume_analysis_status` (см. `initialData.ts`) границы заданы в шкале 0–100 (например, «Хороший кандидат» = 60–79). Поле `Resume_analysis.score` использует ту же шкалу 0–100 (`NUMERIC(4,2)`). Утилитарная функция `getResumeStatusLabel` в `src/utils` пока работает по упрощённой шкале 0–10 — расхождение зафиксировано, нормализация шкал — задел на доработку.

\---

## 6\. Справочники

### 6.1 Перечень справочников

|Справочник|Поля|Значения / Особенности|
|-|-|-|
|Роли|название|1-Администратор, 2-Менеджер, 3-Руководитель|
|Отделы|название, должности|12 отделов; связь многие-ко-многим с должностями (`Department_Position`)|
|Должности|название, тип персонала|29 должностей|
|Типы персонала|название|1-Производственный, 2-Непроизводственный|
|Типы занятости|название|1-Полная, 2-Частичная, 3-Проектная|
|Типы трудового договора|название|1-Срочный, 2-Бессрочный|
|Каналы поиска|название, описание, URL|1-HeadHunter, 2-Superjob|
|Этапы отбора|название|6 этапов (1-Анализ резюме … 6-Предложение)|
|Причины отказа|название|7 причин|
|Статусы заявки|название|1-Новая, 2-В работе, 3-Выполнена, 4-Отклонена|
|Статусы вакансии|название|1-Открыта, 2-Опубликована, 3-Закрыта|
|Статусы собеседования|название|4 значения|
|Статусы анализа резюме|название, min\_score, max\_score|5 значений; диапазоны оценок 0–100|
|Статусы медпроверки|название|7 значений|
|Статусы предложения|название|1-В процессе, 2-Принято, 3-Отклонено|
|Шаблоны письма|название, тема, текст|8 шаблонов автоуведомлений|
|Пользователи|ФИО, email, телефон, пароль, активен, роль, должность|Управление учётными записями|

> **UI-замечание:** в реализации `DirectoriesPage` (`/directories`) присутствует 8 вкладок: Отделы, Должности, Типы занятости, Типы договора, Каналы поиска, Причины отказа, Шаблоны писем, Пользователи. Прочие справочники (статусы, роли, типы персонала, этапы отбора) считаются системными и редактируются только через сидовый файл `src/data/initialData.ts`.

\---

### 6.2 Значения справочника «Должности» (29 позиций)

|ID|Должность|ID|Должность|
|-|-|-|-|
|1|Генеральный директор|16|Нач. отдела по сбыту продукции|
|2|Финансовый директор|17|Менеджер по сбыту продукции|
|3|Бухгалтер|18|Главный технолог|
|4|Экономист|19|Технолог|
|5|Нач. отдела МТС|20|Главный инженер|
|6|Агент по снабжению|21|Инженер-механик|
|7|Кладовщик|22|Нач. отдела маркетинга|
|8|Товаровед|23|Специалист по маркетингу|
|9|Директор ИВЦ|24|Начальник хлебобулочного цеха|
|10|Инженер-программист|25|Мастер хлебобулочного цеха|
|11|Системный администратор|26|Начальник салатного цеха|
|12|Специалист по безопасности|27|Мастер салатного цеха|
|13|Директор по кадрам|28|Начальник кондитерского цеха|
|14|Менеджер по персоналу|29|Мастер кондитерского цеха|
|15|Специалист по кадрам|—|—|

\---

### 6.3 Значения справочника «Этапы отбора»

|ID|Название|
|-|-|
|1|Анализ резюме|
|2|Телефонное интервью|
|3|Собеседование с руководителем|
|4|Проверка СБ|
|5|Медицинская проверка|
|6|Предложение о трудоустройстве|

\---

### 6.4 Значения справочника «Причины отказа»

|ID|Название|
|-|-|
|1|Несоответствие вакансии|
|2|Неуспешное интервью|
|3|Неуспешное собеседование|
|4|Неуспешная проверка СБ|
|5|Некорректная медкнижка|
|6|Неуспешный медосмотр|
|7|Невыполнение условий оформления медкнижки|

\---

### 6.5 Значения справочника «Статусы медицинской проверки»

|ID|Название|
|-|-|
|1|Ожидает проверки медкнижки|
|2|Ожидает медосмотра|
|3|Ожидает оформления медкнижки|
|4|Пройдена|
|5|Медкнижка некорректна|
|6|Медкнижка не оформлена|
|7|Медосмотр не пройден|

\---

### 6.6 Шаблоны писем (8 шаблонов)

|ID|Название|
|-|-|
|1|Несоответствие вакансии|
|2|Неуспешное интервью|
|3|Неуспешное собеседование|
|4|Неуспешная проверка СБ|
|5|Некорректная медкнижка|
|6|Напоминание об оформлении медкнижки|
|7|Неуспешный медосмотр|
|8|Невыполнение условий|

\---

## 7\. Физическая модель данных

### 7.1 Таблицы базы данных

|Таблица|Описание|PK|
|-|-|-|
|Role|Роли пользователей|role\_id|
|Department|Отделы организации|department\_id|
|Personnel\_type|Типы персонала|personnel\_type\_id|
|Position|Должности|position\_id|
|Employment\_type|Типы занятости|employment\_type\_id|
|Contract\_type|Типы трудового договора|contract\_type\_id|
|Search\_channel|Каналы поиска кандидатов|channel\_id|
|Selection\_stage|Этапы отбора|stage\_id|
|Rejection\_reason|Причины отказа|rejection\_reason\_id|
|Request\_status|Статусы заявки|request\_status\_id|
|Vacancy\_status|Статусы вакансии|vacancy\_status\_id|
|Interview\_status|Статусы собеседования|interview\_status\_id|
|Resume\_analysis\_status|Статусы анализа резюме|analysis\_status\_id|
|Medical\_check\_status|Статусы медпроверки|medical\_check\_status\_id|
|Offer\_status|Статусы предложения|offer\_status\_id|
|Email\_template|Шаблоны писем|template\_id|
|User|Пользователи системы|user\_id|
|Department\_Position|Связь отдел-должность|department\_position\_id|
|Recruitment\_request|Заявки на подбор персонала|request\_id|
|Vacancy|Вакансии|vacancy\_id|
|Vacancy\_publication|Публикации вакансий|publication\_id|
|Candidate|Кандидаты|candidate\_id|
|Resume\_analysis|Результаты анализа резюме|analysis\_id|
|Interview|Собеседования|interview\_id|
|Security\_check|Проверки СБ|security\_check\_id|
|Medical\_check|Медицинские проверки|medical\_check\_id|
|Job\_offer|Предложения о трудоустройстве|offer\_id|

\---

### 7.2 SQL-скрипт создания базы данных

```sql
-- =============================================
-- СПРАВОЧНИКИ (без зависимостей)
-- =============================================

CREATE TABLE Role (
    role\_id   INTEGER PRIMARY KEY,
    name      VARCHAR(50) NOT NULL
);

CREATE TABLE Department (
    department\_id INTEGER PRIMARY KEY,
    name          VARCHAR(50) NOT NULL
);

CREATE TABLE Personnel\_type (
    personnel\_type\_id INTEGER PRIMARY KEY,
    name              VARCHAR(50) NOT NULL
);

CREATE TABLE Employment\_type (
    employment\_type\_id INTEGER PRIMARY KEY,
    name               VARCHAR(50) NOT NULL
);

CREATE TABLE Contract\_type (
    contract\_type\_id INTEGER PRIMARY KEY,
    name             VARCHAR(50) NOT NULL
);

CREATE TABLE Search\_channel (
    channel\_id  INTEGER PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL,
    description VARCHAR(255) NOT NULL,
    url         VARCHAR(255) NOT NULL
);

CREATE TABLE Selection\_stage (
    stage\_id INTEGER PRIMARY KEY,
    name     VARCHAR(50) NOT NULL
);

CREATE TABLE Rejection\_reason (
    rejection\_reason\_id INTEGER PRIMARY KEY,
    name                VARCHAR(50) NOT NULL
);

CREATE TABLE Request\_status (
    request\_status\_id INTEGER PRIMARY KEY,
    name              VARCHAR(50) NOT NULL
);

CREATE TABLE Vacancy\_status (
    vacancy\_status\_id INTEGER PRIMARY KEY,
    name              VARCHAR(50) NOT NULL
);

CREATE TABLE Interview\_status (
    interview\_status\_id INTEGER PRIMARY KEY,
    name                VARCHAR(50) NOT NULL
);

CREATE TABLE Resume\_analysis\_status (
    analysis\_status\_id INTEGER PRIMARY KEY,
    name               VARCHAR(50) NOT NULL,
    min\_score          INTEGER NOT NULL,
    max\_score          INTEGER NOT NULL
);

CREATE TABLE Medical\_check\_status (
    medical\_check\_status\_id INTEGER PRIMARY KEY,
    name                    VARCHAR(50) NOT NULL
);

CREATE TABLE Offer\_status (
    offer\_status\_id INTEGER PRIMARY KEY,
    name            VARCHAR(50) NOT NULL
);

CREATE TABLE Email\_template (
    template\_id INTEGER PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    subject     VARCHAR(50) NOT NULL,
    body        TEXT NOT NULL
);

-- =============================================
-- ДОЛЖНОСТИ (зависит от Personnel\_type)
-- =============================================

CREATE TABLE Position (
    position\_id       INTEGER PRIMARY KEY,
    name              VARCHAR(50) NOT NULL,
    personnel\_type\_id INTEGER NOT NULL
        REFERENCES Personnel\_type(personnel\_type\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =============================================
-- ПОЛЬЗОВАТЕЛИ (зависит от Role, Position)
-- =============================================

CREATE TABLE "User" (
    user\_id      INTEGER PRIMARY KEY,
    last\_name    VARCHAR(50)  NOT NULL,
    first\_name   VARCHAR(50)  NOT NULL,
    middle\_name  VARCHAR(50),
    email        VARCHAR(100) NOT NULL,
    phone        VARCHAR(20)  NOT NULL,
    password     VARCHAR(255) NOT NULL,  -- в demo-реализации хранится в открытом виде; в production заменить на password_hash BYTEA
    is\_active    BOOLEAN      NOT NULL,
    role\_id      INTEGER      NOT NULL
        REFERENCES Role(role\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    position\_id  INTEGER      NOT NULL
        REFERENCES Position(position\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =============================================
-- СВЯЗЬ ОТДЕЛ-ДОЛЖНОСТЬ
-- =============================================

CREATE TABLE Department\_Position (
    department\_position\_id INTEGER PRIMARY KEY,
    department\_id          INTEGER NOT NULL
        REFERENCES Department(department\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    position\_id            INTEGER NOT NULL
        REFERENCES Position(position\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =============================================
-- ЗАЯВКИ НА ПОДБОР ПЕРСОНАЛА
-- =============================================

CREATE TABLE Recruitment\_request (
    request\_id             INTEGER PRIMARY KEY,
    created\_at             TIMESTAMP NOT NULL,
    responsibilities       TEXT      NOT NULL,
    requirements           TEXT      NOT NULL,
    experience             INTEGER   NOT NULL,
    salary\_min             INTEGER,
    salary\_max             INTEGER,
    education              TEXT      NOT NULL,
    user\_id                INTEGER   NOT NULL
        REFERENCES "User"(user\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    request\_status\_id      INTEGER   NOT NULL
        REFERENCES Request\_status(request\_status\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    employment\_type\_id     INTEGER   NOT NULL
        REFERENCES Employment\_type(employment\_type\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    department\_position\_id INTEGER   NOT NULL
        REFERENCES Department\_Position(department\_position\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =============================================
-- ВАКАНСИИ
-- =============================================

CREATE TABLE Vacancy (
    vacancy\_id         INTEGER      PRIMARY KEY,
    title              VARCHAR(255) NOT NULL,
    description        TEXT         NOT NULL,
    responsibilities   TEXT         NOT NULL,
    requirements       TEXT         NOT NULL,
    work\_schedule      TEXT         NOT NULL,
    created\_at         DATE         NOT NULL,
    closed\_at          DATE,
    updated\_at         TIMESTAMP    NOT NULL,
    salary\_info        TEXT         NOT NULL,
    work\_conditions    TEXT         NOT NULL,
    experience         INTEGER,                  -- кэш из заявки, редактируемый в форме
    employment\_type\_id INTEGER
        REFERENCES Employment\_type(employment\_type\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    request\_id         INTEGER      NOT NULL
        REFERENCES Recruitment\_request(request\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    vacancy\_status\_id  INTEGER      NOT NULL
        REFERENCES Vacancy\_status(vacancy\_status\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    user\_id            INTEGER      NOT NULL
        REFERENCES "User"(user\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =============================================
-- ПУБЛИКАЦИИ ВАКАНСИЙ
-- =============================================

CREATE TABLE Vacancy\_publication (
    publication\_id  INTEGER PRIMARY KEY,
    published\_at    DATE    NOT NULL,
    unpublished\_at  DATE,
    url             TEXT    NOT NULL,
    views\_count     INTEGER NOT NULL DEFAULT 0,
    responses\_count INTEGER NOT NULL DEFAULT 0,
    is\_active       BOOLEAN NOT NULL,
    vacancy\_id      INTEGER NOT NULL
        REFERENCES Vacancy(vacancy\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    channel\_id      INTEGER NOT NULL
        REFERENCES Search\_channel(channel\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =============================================
-- КАНДИДАТЫ
-- =============================================

CREATE TABLE Candidate (
    candidate\_id        INTEGER      PRIMARY KEY,
    last\_name           VARCHAR(50)  NOT NULL,
    first\_name          VARCHAR(50)  NOT NULL,
    middle\_name         VARCHAR(50),
    birth\_date          DATE,
    work\_experience     INTEGER      NOT NULL,
    resume\_path         TEXT         NOT NULL,
    resume\_text         TEXT,
    email               VARCHAR(100) NOT NULL,
    phone               VARCHAR(20)  NOT NULL,
    city                VARCHAR(50)  NOT NULL,
    education           VARCHAR(100) NOT NULL,
    publication\_id      INTEGER      NOT NULL
        REFERENCES Vacancy\_publication(publication\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    stage\_id            INTEGER      NOT NULL
        REFERENCES Selection\_stage(stage\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    rejection\_reason\_id INTEGER
        REFERENCES Rejection\_reason(rejection\_reason\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =============================================
-- АНАЛИЗ РЕЗЮМЕ
-- =============================================

CREATE TABLE Resume\_analysis (
    analysis\_id        INTEGER       PRIMARY KEY,
    started\_at         TIMESTAMP     NOT NULL,
    finished\_at        TIMESTAMP,
    score              NUMERIC(4,2),
    candidate\_id       INTEGER       NOT NULL
        REFERENCES Candidate(candidate\_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    analysis\_status\_id INTEGER       NOT NULL
        REFERENCES Resume\_analysis\_status(analysis\_status\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =============================================
-- СОБЕСЕДОВАНИЯ
-- =============================================

CREATE TABLE Interview (
    interview\_id        INTEGER   PRIMARY KEY,
    created\_at          TIMESTAMP NOT NULL,
    finished\_at         TIMESTAMP,
    scheduled\_at        TIMESTAMP NOT NULL,
    questions           TEXT      NOT NULL,
    answers             TEXT,
    score               INTEGER,
    notes               TEXT,                    -- свободный комментарий менеджера / руководителя
    candidate\_id        INTEGER   NOT NULL
        REFERENCES Candidate(candidate\_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    stage\_id            INTEGER   NOT NULL      -- 2 = телефонное, 3 = с руководителем
        REFERENCES Selection\_stage(stage\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    interview\_status\_id INTEGER   NOT NULL
        REFERENCES Interview\_status(interview\_status\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    user\_id             INTEGER   NOT NULL
        REFERENCES "User"(user\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =============================================
-- ПРОВЕРКА СЛУЖБЫ БЕЗОПАСНОСТИ
-- =============================================

CREATE TABLE Security\_check (
    security\_check\_id    INTEGER PRIMARY KEY,
    report\_id            INTEGER,                 -- mock Spectrum ID, генерируется generateMockSpectrumId()
    created\_at           DATE    NOT NULL,
    finished\_at          DATE,
    passport\_series      VARCHAR(10),
    passport\_number      VARCHAR(20),
    passport\_issued\_at   DATE,
    inn                  VARCHAR(20),
    registration\_address TEXT,
    conclusion\_path      TEXT,
    result               BOOLEAN,
    candidate\_id         INTEGER NOT NULL
        REFERENCES Candidate(candidate\_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================
-- МЕДИЦИНСКАЯ ПРОВЕРКА
-- =============================================

CREATE TABLE Medical\_check (
    medical\_check\_id          INTEGER PRIMARY KEY,
    created\_at                DATE    NOT NULL,
    finished\_at               TIMESTAMP,
    has\_medical\_book          BOOLEAN,
    medical\_book\_check\_result BOOLEAN,
    medical\_exam\_date         TIMESTAMP,
    is\_medical\_book\_prepared  BOOLEAN,
    medical\_exam\_result       BOOLEAN,
    conclusion\_path           TEXT,
    candidate\_id              INTEGER NOT NULL
        REFERENCES Candidate(candidate\_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    medical\_check\_status\_id   INTEGER NOT NULL
        REFERENCES Medical\_check\_status(medical\_check\_status\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =============================================
-- ПРЕДЛОЖЕНИЕ О ТРУДОУСТРОЙСТВЕ
-- =============================================

CREATE TABLE Job\_offer (
    offer\_id         INTEGER   PRIMARY KEY,
    created\_at       TIMESTAMP NOT NULL,
    finished\_at      TIMESTAMP,
    proposed\_salary  INTEGER   NOT NULL,
    start\_date       DATE      NOT NULL,
    notes            TEXT,
    work\_schedule    TEXT,                       -- кэш из вакансии (для оффлайн-просмотра)
    responsibilities TEXT,                       -- кэш из вакансии
    work\_conditions  TEXT,                       -- кэш из вакансии
    candidate\_id     INTEGER   NOT NULL
        REFERENCES Candidate(candidate\_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    contract\_type\_id INTEGER   NOT NULL
        REFERENCES Contract\_type(contract\_type\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    offer\_status\_id  INTEGER   NOT NULL
        REFERENCES Offer\_status(offer\_status\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =============================================
-- SEED DATA — начальные значения справочников
-- =============================================

INSERT INTO Role VALUES (1,'Администратор'),(2,'Менеджер по подбору персонала'),(3,'Руководитель подразделения');
INSERT INTO Personnel\_type VALUES (1,'Производственный'),(2,'Непроизводственный');
INSERT INTO Employment\_type VALUES (1,'Полная'),(2,'Частичная'),(3,'Проектная');
INSERT INTO Contract\_type VALUES (1,'Срочный'),(2,'Бессрочный');
INSERT INTO Request\_status VALUES (1,'Новая'),(2,'В работе'),(3,'Выполнена'),(4,'Отклонена');
INSERT INTO Vacancy\_status VALUES (1,'Открыта'),(2,'Опубликована'),(3,'Закрыта');
INSERT INTO Interview\_status VALUES (1,'Запланировано'),(2,'Проведено успешно'),(3,'Отменено'),(4,'Кандидат не подходит');
-- Шкала оценок 0–100 (синхронизировано с initialData.ts)
INSERT INTO Resume\_analysis\_status VALUES
    (1,'Не подходит',0,39),(2,'Частично подходит',40,59),
    (3,'Хороший кандидат',60,79),(4,'Отличный кандидат',80,100),
    (5,'Требует ручной проверки',0,0);
INSERT INTO Medical\_check\_status VALUES
    (1,'Ожидает проверки медкнижки'),(2,'Ожидает медосмотра'),
    (3,'Ожидает оформления медкнижки'),(4,'Пройдена'),
    (5,'Медкнижка некорректна'),(6,'Медкнижка не оформлена'),(7,'Медосмотр не пройден');
INSERT INTO Offer\_status VALUES (1,'В процессе'),(2,'Принято'),(3,'Отклонено');
INSERT INTO Selection\_stage VALUES
    (1,'Анализ резюме'),(2,'Телефонное интервью'),(3,'Собеседование с руководителем'),
    (4,'Проверка СБ'),(5,'Медицинская проверка'),(6,'Предложение о трудоустройстве');
INSERT INTO Rejection\_reason VALUES
    (1,'Несоответствие вакансии'),(2,'Неуспешное интервью'),(3,'Неуспешное собеседование'),
    (4,'Неуспешная проверка СБ'),(5,'Некорректная медкнижка'),
    (6,'Неуспешный медосмотр'),(7,'Невыполнение условий оформления медкнижки');
INSERT INTO Search\_channel VALUES
    (1,'HeadHunter','Крупнейший job-сайт России','https://hh.ru'),
    (2,'Superjob','Работный сайт','https://superjob.ru');
INSERT INTO Department VALUES
    (1,'Бухгалтерия'),(2,'Экономический отдел'),(3,'Отдел МТС'),(4,'ИТ-отдел'),
    (5,'Отдел кадров'),(6,'Отдел маркетинга'),(7,'Отдел продаж'),(8,'Лаборатория'),
    (9,'Технический отдел'),(10,'Хлебобулочный цех'),(11,'Салатный цех'),(12,'Кондитерский цех');
INSERT INTO Email\_template(template\_id,name,subject,body) VALUES
    (1,'Несоответствие вакансии','Результат рассмотрения резюме','К сожалению, ваше резюме не соответствует требованиям вакансии.'),
    (2,'Неуспешное интервью','Результат телефонного интервью','К сожалению, по итогам интервью мы не можем продолжить рассмотрение вашей кандидатуры.'),
    (3,'Неуспешное собеседование','Результат собеседования','К сожалению, по итогам собеседования кандидатура не подошла.'),
    (4,'Неуспешная проверка СБ','Результат проверки','К сожалению, проверка службой безопасности не пройдена.'),
    (5,'Некорректная медкнижка','Информация о медицинской книжке','Ваша медицинская книжка не прошла проверку.'),
    (6,'Напоминание об оформлении медкнижки','Напоминание','Просим оформить медицинскую книжку в установленные сроки.'),
    (7,'Неуспешный медосмотр','Результат медосмотра','К сожалению, медосмотр не пройден.'),
    (8,'Невыполнение условий','Уведомление','Условия трудоустройства не были выполнены в срок.');
```

\---

## 8\. Структура проекта и маршрутизация

### 8.1 Файловая структура (фактическая)

```
recruitment-system/
├── public/
│   └── logo.png
├── src/
│   ├── components/
│   │   ├── Auth/                  # LoginPage + CSS module
│   │   ├── Home/                  # HomePage (дашборд + хаб аналитики)
│   │   ├── Layout/                # Layout (sidebar, topbar, role-based nav)
│   │   ├── Requests/              # RequestList, RequestForm
│   │   ├── Vacancies/             # VacancyList, VacancyForm
│   │   ├── PublishedVacancies/    # PublishedVacancyList, PublishedVacancyCard
│   │   ├── Candidates/            # CandidateProfile
│   │   ├── Selection/             # SelectionPage + 5 форм этапов отбора
│   │   ├── Analytics/             # AnalyticsPage (хаб) + FunnelReport, TimeReport, ReasonsReport
│   │   └── Directories/           # DirectoriesPage (8 вкладок)
│   ├── context/
│   │   └── AppContext.tsx         # Глобальный стейт + login/logout + resetAllData
│   ├── hooks/
│   │   └── useLocalStorage.ts     # Утилитарный хук
│   ├── data/
│   │   └── initialData.ts         # Сидовые справочники + демо-данные (заявки, вакансии, кандидаты, интервью, …)
│   ├── types/
│   │   └── index.ts               # TypeScript-интерфейсы (модель данных)
│   ├── utils/
│   │   └── index.ts               # Скоринг, конверсия, форматирование ID/дат, generateMockSpectrumId
│   ├── App.tsx                    # Маршрутизация + PrivateRoute + AppProvider
│   ├── main.tsx
│   └── index.css                  # Базовая палитра + ресет
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── recruitment_IS_documentation.md
```

### 8.2 Маршруты приложения

|Маршрут|Компонент|Доступ|
|-|-|-|
|/login|LoginPage|Неавторизованный пользователь|
|/home|HomePage|Все роли|
|/requests|RequestList|Все роли|
|/requests/new|RequestForm|Все роли|
|/requests/:id|RequestForm|Все роли|
|/vacancies|VacancyList|Менеджер, Админ|
|/vacancies/new|VacancyForm|Менеджер, Админ|
|/vacancies/:id|VacancyForm|Менеджер, Админ|
|/published|PublishedVacancyList|Менеджер, Админ|
|/published/:id|PublishedVacancyCard|Менеджер, Админ|
|/candidates/:id|CandidateProfile|Все роли (без отдельного role-guard)|
|/selection|SelectionPage|Менеджер, Руководитель, Админ|
|/selection/:candidateId/phone-interview|PhoneInterviewForm|Менеджер, Админ|
|/selection/:candidateId/main-interview|MainInterviewForm|Менеджер, Руководитель, Админ|
|/selection/:candidateId/security-check|SecurityCheckForm|Менеджер, Админ|
|/selection/:candidateId/medical-check|MedicalCheckForm|Менеджер, Админ|
|/selection/:candidateId/offer|OfferForm|Менеджер, Админ|
|/analytics|AnalyticsPage (хаб)|Менеджер, Руководитель, Админ|
|/analytics/funnel|FunnelReport|Менеджер, Руководитель, Админ|
|/analytics/time|TimeReport|Менеджер, Руководитель, Админ|
|/analytics/reasons|ReasonsReport|Менеджер, Руководитель, Админ|
|/directories|DirectoriesPage|Только Админ|

### 8.3 Ключи `localStorage`

|Ключ|Содержимое|
|-|-|
|`hr_seeded`|Маркер первичной инициализации|
|`hr_current_user`|Объект `AuthUser` для текущей сессии|
|`hr_users`, `hr_email_templates`|Справочники, редактируемые в `DirectoriesPage`|
|`hr_requests`, `hr_vacancies`, `hr_publications`, `hr_candidates`|Основные сущности|
|`hr_resume_analyses`, `hr_interviews`, `hr_security_checks`, `hr_medical_checks`, `hr_job_offers`|Документы по этапам отбора|

Сброс всех ключей `hr_*` выполняется через кнопку «Сбросить данные» в шапке (только Администратор) → функция `resetAllData()` в `src/context/AppContext.tsx`.

\---



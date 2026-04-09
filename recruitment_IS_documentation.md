# ИС «Подбор персонала» — ООО «Эко-Меню»

## Техническое задание для Antigravity

\---

## 1\. Постановка задачи

Разработать информационную систему подбора персонала для ООО «Эко-Меню», устраняющую следующие недостатки текущего процесса:

* Отсутствие централизованного хранения данных о кандидатах, заявках и вакансиях
* Дублирование данных в отдельных документах Word и таблицах Excel
* Высокая доля ручной обработки информации о кандидатах и вакансиях

### 1.1 Стек технологий

|Уровень|Технология|Описание|
|-|-|-|
|Frontend|React 18 + TypeScript|SPA-приложение|
|Стейт|Zustand + localStorage|Хранение данных без бэкенда|
|Маршрутизация|React Router v6|Навигация между модулями|
|Графики|Recharts|Аналитические отчёты|
|Стили|Tailwind CSS|Утилитарные классы|
|Backend (опц.)|Python FastAPI|REST API при необходимости|
|БД (опц.)|PostgreSQL|Хранение данных|

### 1.2 Важные замечания

**Замечание 1 — Ориентация на демо:**
Проект учебный. Приоритет — демонстрация интерфейса: нажатие кнопок, заполнение форм, смена статусов, переход документов между вкладками. Бизнес-логика на бэкенде минимальна.

**Замечание 2 — Frontend-only подход:**
Рекомендуется реализовать без бэкенда. Все данные хранятся в localStorage. Это позволяет полностью продемонстрировать интерфейс без сервера.

**Замечание 3 — Загрузка макетов в Antigravity:**
Для передачи макетов интерфейса — создать скриншоты экранов (Figma / Draw.io), прикрепить как изображения в промпт. Указать: «Реализуй интерфейс точно по макету».

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
|Авторизация|Форма авторизации|Auth|Все роли|
|Заявки на подбор|Список заявок|RequestList|Все роли|
|Заявки на подбор|Форма заявки|RequestForm|Все роли|
|Вакансии|Список вакансий|VacancyList|Менеджер, Админ|
|Вакансии|Форма вакансии|VacancyForm|Менеджер, Админ|
|Опубл. вакансии|Список публикаций|PublishedVacancyList|Менеджер, Админ|
|Опубл. вакансии|Карточка вакансии|PublishedVacancyCard|Менеджер, Админ|
|Опубл. вакансии|Профиль кандидата|CandidateProfile|Менеджер, Админ|
|Отбор кандидатов|Телефонное интервью|PhoneInterviewForm|Менеджер, Админ|
|Отбор кандидатов|Собеседование с руководителем|MainInterviewForm|Менеджер, Рук., Админ|
|Отбор кандидатов|Проверка СБ|SecurityCheckForm|Менеджер, Админ|
|Отбор кандидатов|Медицинская проверка|MedicalCheckForm|Менеджер, Админ|
|Отбор кандидатов|Предложение о трудоустройстве|OfferForm|Менеджер, Админ|
|Аналитика|Воронка кандидатов|CandidateFunnel|Менеджер, Рук., Админ|
|Аналитика|Время закрытия вакансий|AvgTimeClosing|Менеджер, Рук., Админ|
|Аналитика|Причины отказов|RefusalReasons|Менеджер, Рук., Админ|
|Справочники|Форма справочника|DirectoryForm|Только Админ|

\---

## 4\. Описание форм

### 4.1 Форма авторизации (Auth)

|Элемент|Тип|Поведение|
|-|-|-|
|Email|input\[type=email]|Обязательное|
|Пароль|input\[type=password]|Обязательное|
|Кнопка «Войти»|button|Проверка credentials → редирект на главное меню по роли|

\---

### 4.2 Форма заявки на подбор (RequestForm)

|Поле|Тип|Обязательное|
|-|-|-|
|Дата создания|date (автозаполнение)|Да|
|Отдел|select (из справочника)|Да|
|Должность|select (фильтр по выбранному отделу)|Да|
|Тип занятости|select (Полная / Частичная / Проектная)|Да|
|Обязанности|textarea|Да|
|Требования|textarea|Да|
|Опыт (лет)|number|Да|
|Зарплата от|number|Нет|
|Зарплата до|number|Нет|
|Образование|textarea|Да|
|Статус|readonly (авто: «Новая»)|—|

**Кнопки и поведение:**

* «Сохранить черновик» — Руководитель, статус остаётся «Новая»
* «Отправить на согласование» — Руководитель → статус меняется на «В работе»
* «Утвердить» — Менеджер → статус «Выполнена», появляется кнопка «Создать вакансию»
* «Отклонить» — Менеджер → статус «Отклонена»

\---

### 4.3 Форма вакансии (VacancyForm)

Поля предзаполняются из утверждённой заявки, Менеджер может редактировать текст.

|Поле|Тип|Источник данных|
|-|-|-|
|Название вакансии|text|Ввод вручную|
|Описание вакансии|textarea|Ввод вручную|
|Обязанности|textarea|Из заявки|
|Требования|textarea|Из заявки|
|График работы|textarea|Ввод вручную|
|Условия работы|textarea|Ввод вручную|
|Информация о зарплате|textarea|Из заявки (salary\_min / salary\_max)|
|Статус вакансии|select|Открыта / Опубликована / Закрыта|

**Кнопки:**

* «Сохранить» — сохраняет вакансию
* «Опубликовать» — открывает модальное окно выбора каналов (HeadHunter / Superjob)

\---

### 4.4 Карточка опубликованной вакансии (PublishedVacancyCard)

Канбан-доска с колонками по этапам отбора. Кандидаты перемещаются между этапами.

|Этап|ID|Действие|
|-|-|-|
|Анализ резюме|1|Просмотр оценки, кнопки «Перейти к интервью» / «Отказать»|
|Телефонное интервью|2|Открыть PhoneInterviewForm|
|Собеседование с руководителем|3|Открыть MainInterviewForm|
|Проверка СБ|4|Открыть SecurityCheckForm|
|Медицинская проверка|5|Открыть MedicalCheckForm|
|Предложение о трудоустройстве|6|Открыть OfferForm|

\---

### 4.5 Профиль кандидата (CandidateProfile)

Отображает: ФИО, дата рождения, город, образование, опыт работы, email, телефон, текущий этап, оценка по резюме (0–10), кнопка «Скачать резюме», кнопки перехода на следующий этап.

\---

### 4.6 Форма телефонного интервью (PhoneInterviewForm)

|Поле|Тип|
|-|-|
|Дата и время интервью|datetime-local|
|Список вопросов|textarea|
|Ответы кандидата|textarea|
|Оценка (0–10)|number|
|Статус|select: Запланировано / Проведено успешно / Отменено / Кандидат не подходит|

**Кнопки:**

* «Завершить успешно» → кандидат переходит на этап 3
* «Кандидат не подходит» → выбор причины отказа → фиксация отказа

\---

### 4.7 Форма собеседования с руководителем (MainInterviewForm)

|Поле|Тип|
|-|-|
|Дата и время|datetime-local|
|Список вопросов|textarea|
|Ответы кандидата|textarea|
|Оценка (0–10)|number|
|Статус|select: Запланировано / Проведено успешно / Отменено / Кандидат не подходит|

Доступен: Менеджер + Руководитель подразделения.

\---

### 4.8 Форма проверки службой безопасности (SecurityCheckForm)

|Поле|Тип|Заполнение|
|-|-|-|
|ФИО кандидата|text readonly|Авто из профиля|
|Дата рождения|date readonly|Авто из профиля|
|Должность|text readonly|Авто из вакансии|
|Серия и номер паспорта|text|Вручную|
|Дата выдачи паспорта|date|Вручную|
|ИНН|text|Вручную|
|Адрес регистрации|text|Вручную|
|ID отчёта Spectrum|text readonly|Авто после отправки запроса|
|Дата начала проверки|date readonly|Авто при отправке|
|Дата завершения|date|Вручную|
|Результат проверки|select: Прошёл / Не прошёл|Вручную|
|Файл заключения|file upload|Загрузка PDF|

**Кнопки:**

* «Отправить запрос в СБ» → генерирует mock ID отчёта Spectrum, фиксирует дату начала
* «Сохранить результат» → переводит кандидата на следующий этап или отказывает

\---

### 4.9 Форма медицинской проверки (MedicalCheckForm)

|Поле|Тип|
|-|-|
|ФИО / Должность|readonly (авто)|
|Наличие медкнижки|checkbox|
|Результат проверки медкнижки|select: Корректна / Некорректна|
|Дата прохождения медосмотра|date|
|Результат медосмотра|select: Пройден / Не пройден|
|Медкнижка оформлена|checkbox|
|Файл заключения|file upload|
|Статус медпроверки|select (7 значений из справочника)|

\---

### 4.10 Форма предложения о трудоустройстве (OfferForm)

|Поле|Тип|Заполнение|
|-|-|-|
|ФИО кандидата|readonly|Авто|
|Отдел / Должность|readonly|Авто из вакансии|
|Предлагаемая зарплата|number|Вручную|
|Выход на работу|date|Вручную|
|График работы|textarea readonly|Авто из вакансии|
|Тип трудового договора|select|Срочный / Бессрочный|
|Обязанности|textarea readonly|Авто из вакансии|
|Условия работы|textarea readonly|Авто из вакансии|
|Заметки по обсуждению|textarea|Вручную|
|Статус предложения|select|В процессе / Принято / Отклонено|

**Кнопки:**

* «Сформировать предложение» — фиксирует данные
* «Скачать PDF» — генерирует печатную форму предложения
* «Принято кандидатом» / «Отклонено кандидатом» — меняет статус предложения

\---

## 5\. Аналитические отчёты

### 5.1 Воронка кандидатов (CandidateFunnel)

Воронкообразная диаграмма. Фильтр по вакансии.

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

### 5.2 Среднее время закрытия вакансий (AvgTimeClosing)

Горизонтальная столбчатая диаграмма. Фильтры: период, отдел, вакансия.

```
// Среднее время этапа (дни):
T = Σ(t\_конец\_k - t\_начало\_k) / N

// Итоговое среднее время закрытия вакансии:
T\_закр = Σ T\_m  (сумма по 5 этапам, m = 1..5)

// N   — количество кандидатов, завершивших этап
// T\_m — среднее время m-го этапа
```

\---

### 5.3 Причины отказов кандидатам (RefusalReasons)

Круговая диаграмма. Фильтр по периоду.

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
// Итоговая оценка (0–10):
S = Σ (w\_i × s\_i),  i = 1..5

// Статусы по диапазону S:
S ∈ \[0,   3.9] → «Не подходит»
S ∈ \[4,   5.9] → «Частично подходит»
S ∈ \[6,   7.9] → «Хороший кандидат»
S ∈ \[8,  10  ] → «Отличный кандидат»
Ошибка LLM     → «Требует ручной проверки»
```

\---

## 6\. Справочники

### 6.1 Перечень справочников

|Справочник|Поля|Значения / Особенности|
|-|-|-|
|Роли|название|1-Администратор, 2-Менеджер, 3-Руководитель|
|Отделы|название, должности|12 отделов; связь многие-ко-многим с должностями|
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
|Статусы анализа резюме|название, min\_score, max\_score|5 значений с диапазонами оценок|
|Статусы медпроверки|название|7 значений|
|Статусы предложения|название|1-В процессе, 2-Принято, 3-Отклонено|
|Шаблоны письма|название, тема, текст|8 шаблонов автоуведомлений|
|Пользователи|ФИО, email, телефон, пароль, активен, роль, должность|Управление учётными записями|

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
    user\_id       INTEGER PRIMARY KEY,
    last\_name     VARCHAR(50)  NOT NULL,
    first\_name    VARCHAR(50)  NOT NULL,
    middle\_name   VARCHAR(50),
    email         VARCHAR(100) NOT NULL,
    phone         VARCHAR(20)  NOT NULL,
    password\_hash BYTEA        NOT NULL,
    is\_active     BOOLEAN      NOT NULL,
    role\_id       INTEGER      NOT NULL
        REFERENCES Role(role\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    position\_id   INTEGER      NOT NULL
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
    vacancy\_id        INTEGER      PRIMARY KEY,
    title             VARCHAR(255) NOT NULL,
    description       TEXT         NOT NULL,
    responsibilities  TEXT         NOT NULL,
    requirements      TEXT         NOT NULL,
    work\_schedule     TEXT         NOT NULL,
    created\_at        DATE         NOT NULL,
    closed\_at         DATE,
    updated\_at        TIMESTAMP    NOT NULL,
    salary\_info       TEXT         NOT NULL,
    work\_conditions   TEXT         NOT NULL,
    request\_id        INTEGER      NOT NULL
        REFERENCES Recruitment\_request(request\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    vacancy\_status\_id INTEGER      NOT NULL
        REFERENCES Vacancy\_status(vacancy\_status\_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    user\_id           INTEGER      NOT NULL
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
    candidate\_id        INTEGER   NOT NULL
        REFERENCES Candidate(candidate\_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    stage\_id            INTEGER   NOT NULL
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
    security\_check\_id INTEGER PRIMARY KEY,
    report\_id         INTEGER,
    created\_at        DATE    NOT NULL,
    finished\_at       DATE,
    conclusion\_path   TEXT,
    result            BOOLEAN,
    candidate\_id      INTEGER NOT NULL
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
INSERT INTO Resume\_analysis\_status VALUES
    (1,'Не подходит',0,4),(2,'Частично подходит',4,6),
    (3,'Хороший кандидат',6,8),(4,'Отличный кандидат',8,10),
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

### 8.1 Файловая структура

```
recruitment-app/
├── src/
│   ├── components/
│   │   ├── Auth/                  # Форма авторизации
│   │   ├── Requests/              # Заявки на подбор персонала
│   │   ├── Vacancies/             # Вакансии
│   │   ├── PublishedVacancies/    # Опубликованные вакансии
│   │   ├── Candidates/            # Профили кандидатов
│   │   ├── Selection/             # Формы отбора (интервью, проверки, оффер)
│   │   ├── Analytics/             # Аналитические отчёты
│   │   └── Directories/           # Справочники
│   ├── store/                     # Zustand-хранилище
│   ├── types/                     # TypeScript-типы по таблицам БД
│   ├── data/                      # Начальные данные справочников
│   ├── utils/                     # Формулы, хелперы
│   └── App.tsx                    # Маршрутизация
```

### 8.2 Маршруты приложения

|Маршрут|Компонент|Доступ|
|-|-|-|
|/login|Auth|Все|
|/requests|RequestList|Все|
|/requests/new|RequestForm|Менеджер, Руководитель, Админ|
|/requests/:id|RequestForm|Все|
|/vacancies|VacancyList|Менеджер, Админ|
|/vacancies/:id|VacancyForm|Менеджер, Админ|
|/published|PublishedVacancyList|Менеджер, Админ|
|/published/:id|PublishedVacancyCard|Менеджер, Админ|
|/candidates/:id|CandidateProfile|Менеджер, Админ|
|/selection/:id/phone-interview|PhoneInterviewForm|Менеджер, Админ|
|/selection/:id/main-interview|MainInterviewForm|Менеджер, Руководитель, Админ|
|/selection/:id/security-check|SecurityCheckForm|Менеджер, Админ|
|/selection/:id/medical-check|MedicalCheckForm|Менеджер, Админ|
|/selection/:id/offer|OfferForm|Менеджер, Админ|
|/analytics|Analytics (вкладки)|Менеджер, Руководитель, Админ|
|/directories|DirectoryForm|Только Админ|

\---




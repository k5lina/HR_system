import type {
  Role, Department, PersonnelType, Position, EmploymentType, ContractType,
  SearchChannel, SelectionStage, RejectionReason, RequestStatus, VacancyStatus,
  InterviewStatus, ResumeAnalysisStatus, MedicalCheckStatus, OfferStatus,
  EmailTemplate, DepartmentPosition, User, RecruitmentRequest, Vacancy,
  VacancyPublication, Candidate, ResumeAnalysis, Interview, SecurityCheck,
  MedicalCheck, JobOffer
} from '../types';

export const roles: Role[] = [
  { role_id: 1, name: 'Администратор' },
  { role_id: 2, name: 'Менеджер по подбору персонала' },
  { role_id: 3, name: 'Руководитель подразделения' },
];

export const departments: Department[] = [
  { department_id: 1,  name: 'Бухгалтерия' },
  { department_id: 2,  name: 'Экономический отдел' },
  { department_id: 3,  name: 'Отдел материально-технического снабжения' },
  { department_id: 4,  name: 'ИТ-отдел' },
  { department_id: 5,  name: 'Отдел кадров' },
  { department_id: 6,  name: 'Отдел маркетинга' },
  { department_id: 7,  name: 'Отдел продаж' },
  { department_id: 8,  name: 'Лаборатория' },
  { department_id: 9,  name: 'Технический отдел' },
  { department_id: 10, name: 'Хлебобулочный цех' },
  { department_id: 11, name: 'Салатный цех' },
  { department_id: 12, name: 'Кондитерский цех' },
];

export const personnelTypes: PersonnelType[] = [
  { personnel_type_id: 1, name: 'Производственный' },
  { personnel_type_id: 2, name: 'Непроизводственный' },
];

export const positions: Position[] = [
  { position_id: 1, name: 'Генеральный директор', personnel_type_id: 2 },
  { position_id: 2, name: 'Финансовый директор', personnel_type_id: 2 },
  { position_id: 3, name: 'Бухгалтер', personnel_type_id: 2 },
  { position_id: 4, name: 'Экономист', personnel_type_id: 2 },
  { position_id: 5, name: 'Начальник отдела материально-технического снабжения', personnel_type_id: 2 },
  { position_id: 6, name: 'Агент по снабжению', personnel_type_id: 2 },
  { position_id: 7, name: 'Кладовщик', personnel_type_id: 2 },
  { position_id: 8, name: 'Товаровед', personnel_type_id: 2 },
  { position_id: 9, name: 'Директор информационно-вычислительного центра', personnel_type_id: 2 },
  { position_id: 10, name: 'Инженер-программист', personnel_type_id: 2 },
  { position_id: 11, name: 'Системный администратор информационно-коммуникационных систем', personnel_type_id: 2 },
  { position_id: 12, name: 'Специалист по безопасности компьютерных систем и сетей', personnel_type_id: 2 },
  { position_id: 13, name: 'Директор по кадрам и быту', personnel_type_id: 2 },
  { position_id: 14, name: 'Менеджер по персоналу', personnel_type_id: 2 },
  { position_id: 15, name: 'Специалист по кадрам', personnel_type_id: 2 },
  { position_id: 16, name: 'Начальник отдела по сбыту продукции', personnel_type_id: 2 },
  { position_id: 17, name: 'Менеджер по сбыту продукции', personnel_type_id: 2 },
  { position_id: 18, name: 'Главный технолог', personnel_type_id: 2 },
  { position_id: 19, name: 'Технолог', personnel_type_id: 2 },
  { position_id: 20, name: 'Главный инженер', personnel_type_id: 2 },
  { position_id: 21, name: 'Инженер-механик', personnel_type_id: 2 },
  { position_id: 22, name: 'Начальник отдела маркетинга', personnel_type_id: 2 },
  { position_id: 23, name: 'Специалист по маркетингу', personnel_type_id: 2 },
  { position_id: 24, name: 'Начальник хлебобулочного цеха', personnel_type_id: 1 },
  { position_id: 25, name: 'Мастер хлебобулочного цеха', personnel_type_id: 1 },
  { position_id: 26, name: 'Начальник салатного цеха', personnel_type_id: 1 },
  { position_id: 27, name: 'Мастер салатного цеха', personnel_type_id: 1 },
  { position_id: 28, name: 'Начальник кондитерского цеха', personnel_type_id: 1 },
  { position_id: 29, name: 'Мастер кондитерского цеха', personnel_type_id: 1 },
];

export const employmentTypes: EmploymentType[] = [
  { employment_type_id: 1, name: 'Полная' },
  { employment_type_id: 2, name: 'Частичная' },
  { employment_type_id: 3, name: 'Проектная' },
];

export const contractTypes: ContractType[] = [
  { contract_type_id: 1, name: 'Срочный' },
  { contract_type_id: 2, name: 'Бессрочный' },
];

export const searchChannels: SearchChannel[] = [
  { channel_id: 1, name: 'HeadHunter', description: 'Крупнейший сайт поиска работы', url: 'https://hh.ru' },
  { channel_id: 2, name: 'Superjob', description: 'Сайт поиска работы и сотрудников', url: 'https://superjob.ru' },
];

export const selectionStages: SelectionStage[] = [
  { stage_id: 1, name: 'Анализ резюме' },
  { stage_id: 2, name: 'Телефонное интервью' },
  { stage_id: 3, name: 'Собеседование с руководителем' },
  { stage_id: 4, name: 'Проверка СБ' },
  { stage_id: 5, name: 'Медицинская проверка' },
  { stage_id: 6, name: 'Предложение о трудоустройстве' },
];

export const rejectionReasons: RejectionReason[] = [
  { rejection_reason_id: 1, name: 'Несоответствие вакансии' },
  { rejection_reason_id: 2, name: 'Неуспешное интервью' },
  { rejection_reason_id: 3, name: 'Неуспешное собеседование' },
  { rejection_reason_id: 4, name: 'Неуспешная проверка СБ' },
  { rejection_reason_id: 5, name: 'Некорректная медкнижка' },
  { rejection_reason_id: 6, name: 'Неуспешный медосмотр' },
  { rejection_reason_id: 7, name: 'Невыполнение условий оформления медкнижки' },
];

export const requestStatuses: RequestStatus[] = [
  { request_status_id: 1, name: 'Новая' },
  { request_status_id: 2, name: 'В работе' },
  { request_status_id: 3, name: 'Выполнена' },
  { request_status_id: 4, name: 'Отклонена' },
];

export const vacancyStatuses: VacancyStatus[] = [
  { vacancy_status_id: 1, name: 'Открыта' },
  { vacancy_status_id: 2, name: 'Опубликована' },
  { vacancy_status_id: 3, name: 'Закрыта' },
];

export const interviewStatuses: InterviewStatus[] = [
  { interview_status_id: 1, name: 'Запланировано' },
  { interview_status_id: 2, name: 'Проведено успешно' },
  { interview_status_id: 3, name: 'Отменено' },
  { interview_status_id: 4, name: 'Кандидат не подходит' },
];

export const resumeAnalysisStatuses: ResumeAnalysisStatus[] = [
  { analysis_status_id: 1, name: 'Не подходит', min_score: 0, max_score: 39 },
  { analysis_status_id: 2, name: 'Частично подходит', min_score: 40, max_score: 59 },
  { analysis_status_id: 3, name: 'Хороший кандидат', min_score: 60, max_score: 79 },
  { analysis_status_id: 4, name: 'Отличный кандидат', min_score: 80, max_score: 100 },
  { analysis_status_id: 5, name: 'Требует ручной проверки', min_score: 0, max_score: 0 },
];

export const medicalCheckStatuses: MedicalCheckStatus[] = [
  { medical_check_status_id: 1, name: 'Ожидает проверки медкнижки' },
  { medical_check_status_id: 2, name: 'Ожидает медосмотра' },
  { medical_check_status_id: 3, name: 'Ожидает оформления медкнижки' },
  { medical_check_status_id: 4, name: 'Пройдена' },
  { medical_check_status_id: 5, name: 'Медкнижка некорректна' },
  { medical_check_status_id: 6, name: 'Медкнижка не оформлена' },
  { medical_check_status_id: 7, name: 'Медосмотр не пройден' },
];

export const offerStatuses: OfferStatus[] = [
  { offer_status_id: 1, name: 'В процессе' },
  { offer_status_id: 2, name: 'Принято' },
  { offer_status_id: 3, name: 'Отклонено' },
];

export const emailTemplates: EmailTemplate[] = [
  { template_id: 1, name: 'Несоответствие вакансии', subject: 'Результат рассмотрения вашего резюме', body: 'Уважаемый кандидат, к сожалению, ваше резюме не соответствует требованиям вакансии.' },
  { template_id: 2, name: 'Неуспешное интервью', subject: 'Результат телефонного интервью', body: 'Уважаемый кандидат, к сожалению, по результатам телефонного интервью мы не можем предложить вам продолжение отбора.' },
  { template_id: 3, name: 'Неуспешное собеседование', subject: 'Результат собеседования', body: 'Уважаемый кандидат, благодарим за участие в собеседовании. К сожалению, мы не можем сделать вам предложение.' },
  { template_id: 4, name: 'Неуспешная проверка СБ', subject: 'Результат проверки службой безопасности', body: 'Уважаемый кандидат, по результатам проверки службой безопасности мы вынуждены отказать вам.' },
  { template_id: 5, name: 'Некорректная медкнижка', subject: 'Результат проверки медицинской книжки', body: 'Уважаемый кандидат, ваша медицинская книжка не прошла проверку.' },
  { template_id: 6, name: 'Напоминание об оформлении медкнижки', subject: 'Необходимо оформить медицинскую книжку', body: 'Уважаемый кандидат, напоминаем о необходимости оформить медицинскую книжку.' },
  { template_id: 7, name: 'Неуспешный медосмотр', subject: 'Результат медицинского осмотра', body: 'Уважаемый кандидат, по результатам медицинского осмотра мы вынуждены отказать вам.' },
  { template_id: 8, name: 'Невыполнение условий', subject: 'Невыполнение условий трудоустройства', body: 'Уважаемый кандидат, к сожалению, условия трудоустройства не были выполнены в установленные сроки.' },
];

export const departmentPositions: DepartmentPosition[] = [
  { department_position_id: 1,  department_id: 1,  position_id: 3  },
  { department_position_id: 2,  department_id: 2,  position_id: 2  },
  { department_position_id: 3,  department_id: 2,  position_id: 4  },
  { department_position_id: 4,  department_id: 3,  position_id: 5  },
  { department_position_id: 5,  department_id: 3,  position_id: 6  },
  { department_position_id: 6,  department_id: 3,  position_id: 7  },
  { department_position_id: 7,  department_id: 3,  position_id: 8  },
  { department_position_id: 8,  department_id: 4,  position_id: 9  },
  { department_position_id: 9,  department_id: 4,  position_id: 10 },
  { department_position_id: 10, department_id: 4,  position_id: 11 },
  { department_position_id: 11, department_id: 4,  position_id: 12 },
  { department_position_id: 12, department_id: 5,  position_id: 13 },
  { department_position_id: 13, department_id: 5,  position_id: 14 },
  { department_position_id: 14, department_id: 5,  position_id: 15 },
  { department_position_id: 15, department_id: 6,  position_id: 22 },
  { department_position_id: 16, department_id: 6,  position_id: 23 },
  { department_position_id: 17, department_id: 7,  position_id: 16 },
  { department_position_id: 18, department_id: 7,  position_id: 17 },
  { department_position_id: 19, department_id: 8,  position_id: 18 },
  { department_position_id: 20, department_id: 8,  position_id: 19 },
  { department_position_id: 21, department_id: 9,  position_id: 20 },
  { department_position_id: 22, department_id: 9,  position_id: 21 },
  { department_position_id: 23, department_id: 10, position_id: 24 },
  { department_position_id: 24, department_id: 10, position_id: 25 },
  { department_position_id: 25, department_id: 11, position_id: 26 },
  { department_position_id: 26, department_id: 11, position_id: 27 },
  { department_position_id: 27, department_id: 12, position_id: 28 },
  { department_position_id: 28, department_id: 12, position_id: 29 },
];

export const initialUsers: User[] = [
  {
    user_id: 1, last_name: 'Иванов', first_name: 'Алексей', middle_name: 'Сергеевич',
    email: 'admin@ecomenu.ru', phone: '+7 (900) 000-00-01', password: 'admin123',
    is_active: true, role_id: 1, position_id: 11,
  },
  {
    user_id: 2, last_name: 'Петрова', first_name: 'Мария', middle_name: 'Ивановна',
    email: 'manager@ecomenu.ru', phone: '+7 (900) 000-00-02', password: 'manager123',
    is_active: true, role_id: 2, position_id: 14,
  },
  {
    user_id: 3, last_name: 'Сидоров', first_name: 'Пётр', middle_name: 'Николаевич',
    email: 'head@ecomenu.ru', phone: '+7 (900) 000-00-03', password: 'head123',
    is_active: true, role_id: 3, position_id: 24,
  },
];

export const initialRequests: RecruitmentRequest[] = [
  {
    request_id: 1,
    created_at: '2024-01-10T10:00:00',
    responsibilities: 'Ведение бухгалтерского учёта, подготовка отчётности, работа с первичной документацией.',
    requirements: 'Знание 1С:Бухгалтерия, опыт в производственной компании.',
    experience: 3,
    salary_min: 60000,
    salary_max: 80000,
    education: 'Высшее экономическое или бухгалтерское',
    user_id: 3,
    request_status_id: 3,
    employment_type_id: 1,
    department_position_id: 1,
  },
  {
    request_id: 2,
    created_at: '2024-02-05T09:30:00',
    responsibilities: 'Разработка и сопровождение программного обеспечения, администрирование баз данных.',
    requirements: 'Python/Java, опыт работы с PostgreSQL.',
    experience: 2,
    salary_min: 70000,
    salary_max: 100000,
    education: 'Высшее техническое',
    user_id: 3,
    request_status_id: 2,
    employment_type_id: 1,
    department_position_id: 9,
  },
  {
    request_id: 3,
    created_at: '2024-03-01T11:00:00',
    responsibilities: 'Контроль производственного процесса в хлебобулочном цехе.',
    requirements: 'Опыт в пищевом производстве, наличие медкнижки.',
    experience: 1,
    education: 'Среднее специальное или высшее',
    user_id: 3,
    request_status_id: 1,
    employment_type_id: 1,
    department_position_id: 24,
  },
];

export const initialVacancies: Vacancy[] = [
  {
    vacancy_id: 1,
    title: 'Бухгалтер',
    description: 'Требуется опытный бухгалтер в производственную компанию.',
    responsibilities: 'Ведение бухгалтерского учёта, подготовка отчётности, работа с первичной документацией.',
    requirements: 'Знание 1С:Бухгалтерия, опыт в производственной компании.',
    work_schedule: 'Пн-Пт, 09:00-18:00',
    created_at: '2024-01-12',
    updated_at: '2024-01-12T10:00:00',
    salary_info: 'от 60 000 до 80 000 руб.',
    work_conditions: 'Официальное трудоустройство, ДМС, корпоративное питание.',
    request_id: 1,
    vacancy_status_id: 2,
    user_id: 2,
  },
];

export const initialPublications: VacancyPublication[] = [
  {
    publication_id: 1,
    published_at: '2024-01-15',
    url: 'https://hh.ru/vacancy/12345',
    views_count: 245,
    responses_count: 18,
    is_active: true,
    vacancy_id: 1,
    channel_id: 1,
  },
  {
    publication_id: 2,
    published_at: '2024-01-15',
    url: 'https://superjob.ru/vacancy/67890',
    views_count: 120,
    responses_count: 7,
    is_active: true,
    vacancy_id: 1,
    channel_id: 2,
  },
];

export const initialCandidates: Candidate[] = [
  {
    candidate_id: 1,
    last_name: 'Козлова', first_name: 'Анна', middle_name: 'Дмитриевна',
    birth_date: '1992-05-14',
    work_experience: 5,
    resume_path: '/resumes/kozlova.pdf',
    email: 'kozlova@example.com',
    phone: '+7 (911) 111-11-11',
    city: 'Москва',
    education: 'Высшее экономическое, МГУ',
    publication_id: 1,
    stage_id: 3,
  },
  {
    candidate_id: 2,
    last_name: 'Новиков', first_name: 'Дмитрий', middle_name: 'Александрович',
    birth_date: '1988-11-23',
    work_experience: 8,
    resume_path: '/resumes/novikov.pdf',
    email: 'novikov@example.com',
    phone: '+7 (911) 222-22-22',
    city: 'Санкт-Петербург',
    education: 'Высшее экономическое, СПбГУ',
    publication_id: 1,
    stage_id: 2,
  },
  {
    candidate_id: 3,
    last_name: 'Морозова', first_name: 'Елена', middle_name: 'Павловна',
    birth_date: '1995-03-08',
    work_experience: 2,
    resume_path: '/resumes/morozova.pdf',
    email: 'morozova@example.com',
    phone: '+7 (911) 333-33-33',
    city: 'Москва',
    education: 'Высшее финансовое, ВШЭ',
    publication_id: 2,
    stage_id: 1,
    rejection_reason_id: 1,
  },
];

export const initialResumeAnalyses: ResumeAnalysis[] = [
  {
    analysis_id: 1,
    started_at: '2024-01-16T09:00:00',
    finished_at: '2024-01-16T09:05:00',
    score: 8.2,
    candidate_id: 1,
    analysis_status_id: 4,
  },
  {
    analysis_id: 2,
    started_at: '2024-01-16T09:06:00',
    finished_at: '2024-01-16T09:11:00',
    score: 7.1,
    candidate_id: 2,
    analysis_status_id: 3,
  },
  {
    analysis_id: 3,
    started_at: '2024-01-16T09:12:00',
    finished_at: '2024-01-16T09:17:00',
    score: 3.5,
    candidate_id: 3,
    analysis_status_id: 1,
  },
];

export const initialInterviews: Interview[] = [
  {
    interview_id: 1,
    created_at: '2024-01-17T10:00:00',
    scheduled_at: '2024-01-18T14:00:00',
    finished_at: '2024-01-18T14:30:00',
    questions: 'Расскажите о своём опыте работы в 1С? Как вы работаете с отчётностью?',
    answers: 'Работала 5 лет с 1С:Бухгалтерия 8.3. Готовила квартальную и годовую отчётность.',
    score: 9,
    candidate_id: 1,
    stage_id: 2,
    interview_status_id: 2,
    user_id: 2,
  },
  {
    interview_id: 2,
    created_at: '2024-01-20T10:00:00',
    scheduled_at: '2024-01-22T11:00:00',
    questions: 'Опыт работы? Почему хотите сменить работу?',
    candidate_id: 2,
    stage_id: 2,
    interview_status_id: 1,
    user_id: 2,
  },
];

export const initialSecurityChecks: SecurityCheck[] = [];
export const initialMedicalChecks: MedicalCheck[] = [];
export const initialJobOffers: JobOffer[] = [];

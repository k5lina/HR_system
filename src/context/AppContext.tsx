import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  AuthUser, RecruitmentRequest, Vacancy, VacancyPublication,
  Candidate, ResumeAnalysis, Interview, SecurityCheck, MedicalCheck, JobOffer,
  Role, Department, PersonnelType, Position, EmploymentType, ContractType,
  SearchChannel, SelectionStage, RejectionReason, RequestStatus, VacancyStatus,
  InterviewStatus, ResumeAnalysisStatus, MedicalCheckStatus, OfferStatus,
  EmailTemplate, DepartmentPosition, User,
} from '../types';
import {
  roles, departments, personnelTypes, positions, employmentTypes, contractTypes,
  searchChannels, selectionStages, rejectionReasons, requestStatuses, vacancyStatuses,
  interviewStatuses, resumeAnalysisStatuses, medicalCheckStatuses, offerStatuses,
  emailTemplates as initialEmailTemplates, departmentPositions, initialUsers, initialRequests, initialVacancies,
  initialPublications, initialCandidates, initialResumeAnalyses, initialInterviews,
  initialSecurityChecks, initialMedicalChecks, initialJobOffers,
} from '../data/initialData';

// Первичная инициализация: запускается один раз при первом открытии приложения.
// При обновлении кода данные НЕ сбрасываются — пользовательские записи сохраняются.
(function seedCheck() {
  if (!localStorage.getItem('hr_seeded')) {
    localStorage.setItem('hr_seeded', '1');
  }
})();

// Миграция данных: добавляет недостающие записи в существующий localStorage.
// Безопасна — ничего не перезаписывает, только добавляет отсутствующее.
// Запускается до рендера компонентов; если ключ ещё не создан — пропускает (usePersisted создаст при рендере).
(function migrateData() {
  function patchList<T extends Record<string, unknown>>(key: string, idField: string, fallback: T[], newItems: T[]) {
    try {
      const raw = localStorage.getItem(key);
      const list: T[] = raw ? JSON.parse(raw) : [...fallback];
      let changed = !raw; // если ключа не было — считаем изменённым, чтобы сохранить
      for (const item of newItems) {
        if (!list.find((x) => x[idField] === item[idField])) {
          list.push(item);
          changed = true;
        }
      }
      if (changed) localStorage.setItem(key, JSON.stringify(list));
    } catch { /* ignore */ }
  }

  // Исправляем vacancy_id:1 если linter случайно переименовал её в 'Технолог'
  try {
    const raw = localStorage.getItem('hr_vacancies');
    if (raw) {
      const list = JSON.parse(raw) as Vacancy[];
      const v1 = list.find((v) => v.vacancy_id === 1);
      if (v1 && v1.title === 'Технолог') {
        v1.title = 'Мастер хлебобулочного цеха';
        localStorage.setItem('hr_vacancies', JSON.stringify(list));
      }
    }
  } catch { /* ignore */ }

  patchList('hr_requests', 'request_id', initialRequests, [
    { request_id: 5, created_at: '2024-03-01T10:00:00', responsibilities: 'Разработка и контроль технологических процессов производства. Ведение ТТК и рецептур. Контроль качества сырья и готовой продукции.', requirements: 'Высшее или среднее профессиональное (технология пищевых производств). Опыт от 3 лет. Знание ГОСТ, санитарных норм.', experience: 3, salary_min: 65000, salary_max: 85000, education: 'Высшее или среднее профессиональное (технология пищевых производств)', user_id: 4, request_status_id: 3, employment_type_id: 1, department_position_id: 20 },
  ] as unknown as RecruitmentRequest[]);
  patchList('hr_vacancies', 'vacancy_id', initialVacancies, [
    { vacancy_id: 5, title: 'Технолог', description: 'Лаборатория компании ЭкоМеню открывает вакансию Технолога.', responsibilities: 'Разработка и контроль технологических процессов. Ведение ТТК и рецептур. Контроль качества сырья и готовой продукции.', requirements: 'Высшее образование, опыт от 3 лет, знание ГОСТ и санитарных норм.', work_schedule: 'Пн-Пт, 08:00-17:00', created_at: '2024-03-05', updated_at: '2024-03-05T12:00:00', salary_info: 'от 65 000 до 85 000 руб.', work_conditions: 'Официальное трудоустройство, ДМС, питание за счёт компании, спецодежда.', request_id: 5, vacancy_status_id: 2, user_id: 2 },
  ] as unknown as Vacancy[]);
  patchList('hr_publications', 'publication_id', initialPublications, [
    { publication_id: 9, published_at: '2024-03-10', url: 'https://hh.ru/vacancy/56789', views_count: 398, responses_count: 22, is_active: true, vacancy_id: 5, channel_id: 1 },
  ] as unknown as VacancyPublication[]);
  patchList('hr_candidates', 'candidate_id', initialCandidates, [
    { candidate_id: 33, last_name: 'Федоров', first_name: 'Максим', middle_name: 'Романович', birth_date: '1991-05-18', work_experience: 7, resume_path: '/resumes/fedorov.pdf', email: 'm.fedorov@example.com', phone: '+7 (916) 800-11-22', city: 'Москва', education: 'Высшее, МГУПП, технология пищевых производств', publication_id: 9, stage_id: 6 },
    { candidate_id: 34, last_name: 'Смирнова', first_name: 'Анна', middle_name: 'Петровна', birth_date: '1993-07-12', work_experience: 5, resume_path: '/resumes/smirnova.pdf', email: 'a.smirnova@example.com', phone: '+7 (903) 111-22-33', city: 'Москва', education: 'Высшее, МГУПП, технология пищевых производств', publication_id: 6, stage_id: 1 },
    { candidate_id: 35, last_name: 'Козлов', first_name: 'Дмитрий', middle_name: 'Александрович', birth_date: '1988-03-24', work_experience: 9, resume_path: '/resumes/kozlov.pdf', email: 'd.kozlov@example.com', phone: '+7 (903) 222-33-44', city: 'Москва', education: 'Высшее, МГТА, биотехнология', publication_id: 6, stage_id: 1 },
    { candidate_id: 36, last_name: 'Новикова', first_name: 'Елена', middle_name: 'Викторовна', birth_date: '1995-11-05', work_experience: 4, resume_path: '/resumes/novikova.pdf', email: 'e.novikova@example.com', phone: '+7 (903) 333-44-55', city: 'Подольск', education: 'Высшее, РХТУ, технология продуктов питания', publication_id: 6, stage_id: 1 },
    { candidate_id: 37, last_name: 'Попов', first_name: 'Сергей', middle_name: 'Игоревич', birth_date: '1990-06-18', work_experience: 6, resume_path: '/resumes/popov.pdf', email: 's.popov@example.com', phone: '+7 (903) 444-55-66', city: 'Москва', education: 'Среднее профессиональное, технолог пищевого производства', publication_id: 6, stage_id: 1 },
    { candidate_id: 38, last_name: 'Лебедева', first_name: 'Ольга', middle_name: 'Николаевна', birth_date: '1992-09-30', work_experience: 5, resume_path: '/resumes/lebedeva.pdf', email: 'o.lebedeva@example.com', phone: '+7 (903) 555-66-77', city: 'Красногорск', education: 'Высшее, МГУ прикладной биотехнологии', publication_id: 6, stage_id: 1 },
    { candidate_id: 39, last_name: 'Морозов', first_name: 'Андрей', middle_name: 'Юрьевич', birth_date: '1986-02-14', work_experience: 11, resume_path: '/resumes/morozov.pdf', email: 'a.morozov@example.com', phone: '+7 (903) 666-77-88', city: 'Москва', education: 'Высшее, МГУПП, технология хлебопекарного производства', publication_id: 6, stage_id: 1 },
    { candidate_id: 40, last_name: 'Волкова', first_name: 'Марина', middle_name: 'Сергеевна', birth_date: '1997-04-22', work_experience: 2, resume_path: '/resumes/volkova.pdf', email: 'm.volkova@example.com', phone: '+7 (903) 777-88-99', city: 'Балашиха', education: 'Среднее профессиональное, кондитер-технолог', publication_id: 6, stage_id: 1 },
    { candidate_id: 41, last_name: 'Зайцев', first_name: 'Павел', middle_name: 'Олегович', birth_date: '1994-08-09', work_experience: 3, resume_path: '/resumes/zaytsev.pdf', email: 'p.zaytsev@example.com', phone: '+7 (903) 888-99-00', city: 'Люберцы', education: 'Среднее профессиональное, технология общественного питания', publication_id: 6, stage_id: 1 },
    { candidate_id: 42, last_name: 'Соколова', first_name: 'Ирина', middle_name: 'Дмитриевна', birth_date: '1989-12-01', work_experience: 8, resume_path: '/resumes/sokolova.pdf', email: 'i.sokolova@example.com', phone: '+7 (903) 999-00-11', city: 'Мытищи', education: 'Высшее, ТГУ, пищевые технологии', publication_id: 6, stage_id: 1 },
    { candidate_id: 43, last_name: 'Кузнецов', first_name: 'Артём', middle_name: 'Вадимович', birth_date: '1996-05-17', work_experience: 1, resume_path: '/resumes/kuznetsov.pdf', email: 'a.kuznetsov@example.com', phone: '+7 (903) 100-20-30', city: 'Москва', education: 'Высшее (незаконченное), МГУПП, 4 курс', publication_id: 6, stage_id: 1 },
  ] as unknown as Candidate[]);
  patchList('hr_resume_analyses', 'analysis_id', initialResumeAnalyses, [
    { analysis_id: 33, started_at: '2024-03-15T10:00:00', finished_at: '2024-03-15T10:07:00', score: 9.3, candidate_id: 33, analysis_status_id: 4 },
    { analysis_id: 34, started_at: '2024-04-10T09:00:00', finished_at: '2024-04-10T09:06:00', score: 8.8, candidate_id: 34, analysis_status_id: 4 },
    { analysis_id: 35, started_at: '2024-04-10T09:07:00', finished_at: '2024-04-10T09:13:00', score: 9.2, candidate_id: 35, analysis_status_id: 4 },
    { analysis_id: 36, started_at: '2024-04-10T09:14:00', finished_at: '2024-04-10T09:20:00', score: 8.5, candidate_id: 36, analysis_status_id: 4 },
    { analysis_id: 37, started_at: '2024-04-10T09:21:00', finished_at: '2024-04-10T09:27:00', score: 7.4, candidate_id: 37, analysis_status_id: 3 },
    { analysis_id: 38, started_at: '2024-04-10T09:28:00', finished_at: '2024-04-10T09:34:00', score: 6.7, candidate_id: 38, analysis_status_id: 3 },
    { analysis_id: 39, started_at: '2024-04-10T09:35:00', finished_at: '2024-04-10T09:41:00', score: 7.1, candidate_id: 39, analysis_status_id: 3 },
    { analysis_id: 40, started_at: '2024-04-10T09:42:00', finished_at: '2024-04-10T09:48:00', score: 5.2, candidate_id: 40, analysis_status_id: 2 },
    { analysis_id: 41, started_at: '2024-04-10T09:49:00', finished_at: '2024-04-10T09:55:00', score: 4.5, candidate_id: 41, analysis_status_id: 2 },
    { analysis_id: 42, started_at: '2024-04-10T09:56:00', finished_at: '2024-04-10T10:02:00', score: 0, candidate_id: 42, analysis_status_id: 5 },
    { analysis_id: 43, started_at: '2024-04-10T10:03:00', finished_at: '2024-04-10T10:09:00', score: 0, candidate_id: 43, analysis_status_id: 5 },
  ] as unknown as ResumeAnalysis[]);
  patchList('hr_interviews', 'interview_id', initialInterviews, [
    { interview_id: 13, created_at: '2024-03-18T09:00:00', scheduled_at: '2024-03-20T14:00:00', finished_at: '2024-03-20T14:40:00', questions: '1. Расскажите о вашем опыте разработки технологической документации.\n2. Как вы обеспечиваете контроль качества сырья?\n3. Какие нормативные документы вы используете в работе?', answers: '1. Разрабатывал ТТК, рецептуры для 15+ позиций, вёл журналы технологического контроля.\n2. Входной контроль по ГОСТ, органолептика, отбор проб для лаборатории.\n3. ГОСТ Р, СанПиН, ТУ предприятия.', score: 9, candidate_id: 33, stage_id: 2, interview_status_id: 2, user_id: 2 },
    { interview_id: 14, created_at: '2024-03-25T10:00:00', scheduled_at: '2024-03-27T11:00:00', finished_at: '2024-03-27T12:00:00', questions: '1. Почему хотите работать именно в нашей лаборатории?\n2. Опыт разработки новых продуктов?\n3. Ожидания по зарплате.', answers: '1. Интересует масштаб производства и работа с разными продуктовыми линейками.\n2. Разработал 8 новых рецептур, 5 запущены в производство.\n3. 75 000 руб., стандартный соцпакет.', score: 10, candidate_id: 33, stage_id: 3, interview_status_id: 2, user_id: 4 },
  ] as unknown as Interview[]);
  patchList('hr_security_checks', 'security_check_id', initialSecurityChecks, [
    { security_check_id: 4, report_id: 20240401, created_at: '2024-04-01', finished_at: '2024-04-03', conclusion_path: '/security/conclusions/fedorov_conclusion.pdf', result: true, candidate_id: 33 },
  ] as unknown as SecurityCheck[]);
  patchList('hr_medical_checks', 'medical_check_id', initialMedicalChecks, [
    { medical_check_id: 6, created_at: '2024-04-05', finished_at: '2024-04-07T15:00:00', has_medical_book: true, medical_book_check_result: true, medical_exam_date: '2024-04-06T09:00:00', is_medical_book_prepared: true, medical_exam_result: true, conclusion_path: '/medical/conclusions/fedorov_medical.pdf', candidate_id: 33, medical_check_status_id: 4 },
  ] as unknown as MedicalCheck[]);
  patchList('hr_job_offers', 'offer_id', initialJobOffers, [
    { offer_id: 4, created_at: '2024-04-09T10:00:00', finished_at: '2024-04-11T12:00:00', proposed_salary: 78000, start_date: '2024-05-01', notes: 'Кандидат принял предложение. Испытательный срок 3 месяца. Выход на работу 01.05.2024.', candidate_id: 33, contract_type_id: 2, offer_status_id: 2, work_schedule: 'Пн-Пт, 08:00-17:00', responsibilities: 'Разработка и контроль технологических процессов производства. Ведение технологической документации (ТТК, рецептуры).', work_conditions: 'Официальное трудоустройство, ДМС, питание за счёт компании, спецодежда.' },
  ] as unknown as JobOffer[]);
})();

// Ручной сброс всех данных к начальным (вызывается явно через кнопку в интерфейсе).
export function resetAllData() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith('hr_'))
    .forEach((k) => localStorage.removeItem(k));
  localStorage.setItem('hr_seeded', '1');
  window.location.reload();
}

function loadOrInit<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

interface AppContextValue {
  currentUser: AuthUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;

  roles: Role[];
  departments: Department[];
  personnelTypes: PersonnelType[];
  positions: Position[];
  employmentTypes: EmploymentType[];
  contractTypes: ContractType[];
  searchChannels: SearchChannel[];
  selectionStages: SelectionStage[];
  rejectionReasons: RejectionReason[];
  requestStatuses: RequestStatus[];
  vacancyStatuses: VacancyStatus[];
  interviewStatuses: InterviewStatus[];
  resumeAnalysisStatuses: ResumeAnalysisStatus[];
  medicalCheckStatuses: MedicalCheckStatus[];
  offerStatuses: OfferStatus[];
  emailTemplates: EmailTemplate[];
  setEmailTemplates: React.Dispatch<React.SetStateAction<EmailTemplate[]>>;
  departmentPositions: DepartmentPosition[];

  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;

  requests: RecruitmentRequest[];
  setRequests: React.Dispatch<React.SetStateAction<RecruitmentRequest[]>>;

  vacancies: Vacancy[];
  setVacancies: React.Dispatch<React.SetStateAction<Vacancy[]>>;

  publications: VacancyPublication[];
  setPublications: React.Dispatch<React.SetStateAction<VacancyPublication[]>>;

  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;

  resumeAnalyses: ResumeAnalysis[];
  setResumeAnalyses: React.Dispatch<React.SetStateAction<ResumeAnalysis[]>>;

  interviews: Interview[];
  setInterviews: React.Dispatch<React.SetStateAction<Interview[]>>;

  securityChecks: SecurityCheck[];
  setSecurityChecks: React.Dispatch<React.SetStateAction<SecurityCheck[]>>;

  medicalChecks: MedicalCheck[];
  setMedicalChecks: React.Dispatch<React.SetStateAction<MedicalCheck[]>>;

  jobOffers: JobOffer[];
  setJobOffers: React.Dispatch<React.SetStateAction<JobOffer[]>>;
}

const AppContext = createContext<AppContextValue | null>(null);

function usePersisted<T>(key: string, fallback: T) {
  const [state, setState] = useState<T>(() => loadOrInit(key, fallback));
  const setPersisted: React.Dispatch<React.SetStateAction<T>> = useCallback((action) => {
    setState((prev) => {
      const next = typeof action === 'function' ? (action as (p: T) => T)(prev) : action;
      save(key, next);
      return next;
    });
  }, [key]);
  return [state, setPersisted] as const;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem('hr_current_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [emailTemplates, setEmailTemplates] = usePersisted<EmailTemplate[]>('hr_email_templates', initialEmailTemplates);
  const [users, setUsers] = usePersisted<User[]>('hr_users', initialUsers);
  const [requests, setRequests] = usePersisted<RecruitmentRequest[]>('hr_requests', initialRequests);
  const [vacancies, setVacancies] = usePersisted<Vacancy[]>('hr_vacancies', initialVacancies);
  const [publications, setPublications] = usePersisted<VacancyPublication[]>('hr_publications', initialPublications);
  const [candidates, setCandidates] = usePersisted<Candidate[]>('hr_candidates', initialCandidates);
  const [resumeAnalyses, setResumeAnalyses] = usePersisted<ResumeAnalysis[]>('hr_resume_analyses', initialResumeAnalyses);
  const [interviews, setInterviews] = usePersisted<Interview[]>('hr_interviews', initialInterviews);
  const [securityChecks, setSecurityChecks] = usePersisted<SecurityCheck[]>('hr_security_checks', initialSecurityChecks);
  const [medicalChecks, setMedicalChecks] = usePersisted<MedicalCheck[]>('hr_medical_checks', initialMedicalChecks);
  const [jobOffers, setJobOffers] = usePersisted<JobOffer[]>('hr_job_offers', initialJobOffers);

  const login = useCallback((email: string, password: string): boolean => {
    const user = users.find((u) => u.email === email && u.password === password && u.is_active);
    if (!user) return false;
    const authUser: AuthUser = {
      user_id: user.user_id,
      full_name: `${user.last_name} ${user.first_name}${user.middle_name ? ' ' + user.middle_name : ''}`,
      email: user.email,
      role_id: user.role_id as 1 | 2 | 3,
      position_id: user.position_id,
    };
    setCurrentUser(authUser);
    localStorage.setItem('hr_current_user', JSON.stringify(authUser));
    return true;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('hr_current_user');
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser, login, logout,
      roles, departments, personnelTypes, positions, employmentTypes, contractTypes,
      searchChannels, selectionStages, rejectionReasons, requestStatuses, vacancyStatuses,
      interviewStatuses, resumeAnalysisStatuses, medicalCheckStatuses, offerStatuses,
      emailTemplates, setEmailTemplates, departmentPositions,
      users, setUsers,
      requests, setRequests,
      vacancies, setVacancies,
      publications, setPublications,
      candidates, setCandidates,
      resumeAnalyses, setResumeAnalyses,
      interviews, setInterviews,
      securityChecks, setSecurityChecks,
      medicalChecks, setMedicalChecks,
      jobOffers, setJobOffers,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

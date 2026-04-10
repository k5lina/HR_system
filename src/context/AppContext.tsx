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
  emailTemplates, departmentPositions, initialUsers, initialRequests, initialVacancies,
  initialPublications, initialCandidates, initialResumeAnalyses, initialInterviews,
  initialSecurityChecks, initialMedicalChecks, initialJobOffers,
} from '../data/initialData';

/**
 * Версия данных. Меняй эту строку каждый раз, когда обновляешь initialData.ts —
 * при несовпадении все hr_* ключи в localStorage будут очищены и пересеяны из initialData.
 */
const DATA_VERSION = 'v5';

// Выполняется один раз при загрузке модуля (до React-рендера).
// Если версия изменилась — очищаем все hr_* ключи, чтобы usePersisted взял свежий initialData.
(function seedCheck() {
  if (localStorage.getItem('hr_seed_version') !== DATA_VERSION) {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('hr_'))
      .forEach((k) => localStorage.removeItem(k));
    localStorage.setItem('hr_seed_version', DATA_VERSION);
  }
})();

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
      emailTemplates, departmentPositions,
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

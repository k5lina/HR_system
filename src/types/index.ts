export interface Role {
  role_id: number;
  name: string;
}

export interface Department {
  department_id: number;
  name: string;
}

export interface PersonnelType {
  personnel_type_id: number;
  name: string;
}

export interface Position {
  position_id: number;
  name: string;
  personnel_type_id: number;
}

export interface EmploymentType {
  employment_type_id: number;
  name: string;
}

export interface ContractType {
  contract_type_id: number;
  name: string;
}

export interface SearchChannel {
  channel_id: number;
  name: string;
  description: string;
  url: string;
}

export interface SelectionStage {
  stage_id: number;
  name: string;
}

export interface RejectionReason {
  rejection_reason_id: number;
  name: string;
}

export interface RequestStatus {
  request_status_id: number;
  name: string;
}

export interface VacancyStatus {
  vacancy_status_id: number;
  name: string;
}

export interface InterviewStatus {
  interview_status_id: number;
  name: string;
}

export interface ResumeAnalysisStatus {
  analysis_status_id: number;
  name: string;
  min_score: number;
  max_score: number;
}

export interface MedicalCheckStatus {
  medical_check_status_id: number;
  name: string;
}

export interface OfferStatus {
  offer_status_id: number;
  name: string;
}

export interface EmailTemplate {
  template_id: number;
  name: string;
  subject: string;
  body: string;
}

export interface DepartmentPosition {
  department_position_id: number;
  department_id: number;
  position_id: number;
}

export interface User {
  user_id: number;
  last_name: string;
  first_name: string;
  middle_name?: string;
  email: string;
  phone: string;
  password: string;
  is_active: boolean;
  role_id: number;
  position_id: number;
}

export interface RecruitmentRequest {
  request_id: number;
  created_at: string;
  responsibilities: string;
  requirements: string;
  experience: number;
  salary_min?: number;
  salary_max?: number;
  education: string;
  user_id: number;
  request_status_id: number;
  employment_type_id: number;
  department_position_id: number;
}

export interface Vacancy {
  vacancy_id: number;
  title: string;
  description: string;
  responsibilities: string;
  requirements: string;
  work_schedule: string;
  created_at: string;
  closed_at?: string;
  updated_at: string;
  salary_info: string;
  work_conditions: string;
  request_id: number;
  vacancy_status_id: number;
  user_id: number;
}

export interface VacancyPublication {
  publication_id: number;
  published_at: string;
  unpublished_at?: string;
  url: string;
  views_count: number;
  responses_count: number;
  is_active: boolean;
  vacancy_id: number;
  channel_id: number;
}

export interface Candidate {
  candidate_id: number;
  last_name: string;
  first_name: string;
  middle_name?: string;
  birth_date?: string;
  work_experience: number;
  resume_path: string;
  resume_text?: string;
  email: string;
  phone: string;
  city: string;
  education: string;
  publication_id: number;
  stage_id: number;
  rejection_reason_id?: number;
}

export interface ResumeAnalysis {
  analysis_id: number;
  started_at: string;
  finished_at?: string;
  score?: number;
  candidate_id: number;
  analysis_status_id: number;
}

export interface Interview {
  interview_id: number;
  created_at: string;
  finished_at?: string;
  scheduled_at: string;
  questions: string;
  answers?: string;
  score?: number;
  candidate_id: number;
  stage_id: number;
  interview_status_id: number;
  user_id: number;
}

export interface SecurityCheck {
  security_check_id: number;
  report_id?: string;
  created_at: string;
  finished_at?: string;
  passport_series?: string;
  passport_number?: string;
  passport_issued_at?: string;
  inn?: string;
  registration_address?: string;
  conclusion_path?: string;
  result?: boolean;
  candidate_id: number;
}

export interface MedicalCheck {
  medical_check_id: number;
  created_at: string;
  finished_at?: string;
  has_medical_book?: boolean;
  medical_book_check_result?: boolean;
  medical_exam_date?: string;
  is_medical_book_prepared?: boolean;
  medical_exam_result?: boolean;
  conclusion_path?: string;
  candidate_id: number;
  medical_check_status_id: number;
}

export interface JobOffer {
  offer_id: number;
  created_at: string;
  finished_at?: string;
  proposed_salary: number;
  start_date: string;
  notes?: string;
  candidate_id: number;
  contract_type_id: number;
  offer_status_id: number;
}

export type UserRole = 1 | 2 | 3;

export interface AuthUser {
  user_id: number;
  full_name: string;
  email: string;
  role_id: UserRole;
  position_id: number;
}

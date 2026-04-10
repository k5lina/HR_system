import { useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { nextId } from '../../utils';
import styles from '../Requests/Requests.module.css';

export default function VacancyForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    vacancies, setVacancies, requests, departmentPositions,
    departments, positions, employmentTypes, vacancyStatuses,
    currentUser, users,
  } = useApp();

  const isNew = id === 'new';
  const requestId = searchParams.get('requestId') ? Number(searchParams.get('requestId')) : undefined;
  const sourceRequest = requestId ? requests.find((r) => r.request_id === requestId) : undefined;
  const existing = isNew ? null : vacancies.find((v) => v.vacancy_id === Number(id));

  // Derive linked request for existing vacancy
  const linkedRequest = existing
    ? requests.find((r) => r.request_id === existing.request_id)
    : sourceRequest;

  const linkedDp = linkedRequest
    ? departmentPositions.find((d) => d.department_position_id === linkedRequest.department_position_id)
    : undefined;
  const linkedDept = linkedDp ? departments.find((d) => d.department_id === linkedDp.department_id) : undefined;
  const linkedPos = linkedDp ? positions.find((p) => p.position_id === linkedDp.position_id) : undefined;
  const linkedAuthor = linkedRequest ? users.find((u) => u.user_id === linkedRequest.user_id) : undefined;

  const [responsibilities, setResponsibilities] = useState(
    existing?.responsibilities ?? sourceRequest?.responsibilities ?? ''
  );
  const [requirements, setRequirements] = useState(
    existing?.requirements ?? sourceRequest?.requirements ?? ''
  );
  const [workSchedule, setWorkSchedule] = useState(existing?.work_schedule ?? '');
  const [workConditions, setWorkConditions] = useState(existing?.work_conditions ?? '');
  const [salaryInfo, setSalaryInfo] = useState(
    existing?.salary_info ??
    (sourceRequest?.salary_min
      ? `от ${sourceRequest.salary_min}${sourceRequest.salary_max ? ' до ' + sourceRequest.salary_max : ''} руб.`
      : '')
  );
  const [experience, setExperience] = useState<string>(
    String(existing?.experience ?? sourceRequest?.experience ?? '')
  );
  const [employmentTypeId, setEmploymentTypeId] = useState<number>(
    existing?.employment_type_id ?? sourceRequest?.employment_type_id ?? 1
  );

  function handleSave() {
    const now = new Date().toISOString();
    const exp = experience !== '' ? Number(experience) : undefined;
    if (isNew) {
      setVacancies((prev) => [...prev, {
        vacancy_id: nextId(vacancies, 'vacancy_id'),
        title: linkedPos?.name ?? '',
        description: '',
        responsibilities,
        requirements,
        work_schedule: workSchedule,
        work_conditions: workConditions,
        salary_info: salaryInfo,
        experience: exp,
        employment_type_id: employmentTypeId,
        created_at: now.slice(0, 10),
        updated_at: now,
        request_id: requestId ?? 0,
        vacancy_status_id: 1,
        user_id: currentUser!.user_id,
      }]);
    } else if (existing) {
      setVacancies((prev) =>
        prev.map((v) =>
          v.vacancy_id === existing.vacancy_id
            ? {
                ...v,
                responsibilities, requirements,
                work_schedule: workSchedule,
                work_conditions: workConditions,
                salary_info: salaryInfo,
                experience: exp,
                employment_type_id: employmentTypeId,
                updated_at: now,
              }
            : v
        )
      );
    }
    navigate('/vacancies');
  }

  // Auto-fill display values
  let displayId = 'заполняется автоматически';
  let displayDate = 'заполняется автоматически';
  let authorName = 'заполняется автоматически';

  if (existing) {
    displayId = String(existing.vacancy_id);
    displayDate = new Date(existing.created_at).toLocaleDateString('ru-RU');
  }
  if (linkedAuthor) {
    authorName = `${linkedAuthor.last_name} ${linkedAuthor.first_name}`;
  } else if (currentUser && isNew) {
    authorName = currentUser.full_name;
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <Link to="/vacancies" className={styles.backBtn}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: '0.5rem' }}>
            <path d="M19 12H5M12 19L5 12l7-7" />
          </svg>
        </Link>
        <h2 className={styles.title}>Вакансия</h2>
      </div>

      <div className={styles.formToolbar}>
        <button className={styles.btnSave} onClick={handleSave}>Сохранить запись</button>
      </div>

      <div className={styles.autoFields}>
        <div className={styles.autoRow}>
          <span className={styles.autoLabel}>Номер вакансии</span>
          <span className={styles.autoValue}>{displayId}</span>
        </div>
        <div className={styles.autoRow}>
          <span className={styles.autoLabel}>Дата создания</span>
          <span className={styles.autoValue}>{displayDate}</span>
        </div>
        <div className={styles.autoRow}>
          <span className={styles.autoLabel}>Руководитель отдела</span>
          <span className={styles.autoValue}>{authorName}</span>
        </div>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.fieldRow}>
          <label className={styles.fieldRowLabel}>Отдел</label>
          <span className={styles.autoValue}>{linkedDept?.name ?? '—'}</span>
        </div>
        <div className={styles.fieldRow}>
          <label className={styles.fieldRowLabel}>Должность</label>
          <span className={styles.autoValue}>{linkedPos?.name ?? '—'}</span>
        </div>
      </div>

      <div className={styles.sectionLabel}>Информация в публикации</div>

      <div className={styles.formGrid} style={{ marginBottom: '1.5rem' }}>
        <div className={styles.fieldRow}>
          <label className={styles.fieldRowLabel}>Требуемый опыт работы</label>
          <input
            type="text"
            className={styles.fieldRowInput}
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
        </div>
        <div className={styles.fieldRow}>
          <label className={styles.fieldRowLabel}>Тип занятости</label>
          <select
            className={styles.fieldRowSelect}
            value={employmentTypeId}
            onChange={(e) => setEmploymentTypeId(Number(e.target.value))}
          >
            {employmentTypes.map((et) => (
              <option key={et.employment_type_id} value={et.employment_type_id}>{et.name}</option>
            ))}
          </select>
        </div>
        <div className={styles.fieldRow}>
          <label className={styles.fieldRowLabel}>График работы</label>
          <input
            type="text"
            className={styles.fieldRowInput}
            value={workSchedule}
            onChange={(e) => setWorkSchedule(e.target.value)}
          />
        </div>
        <div className={styles.fieldRow}>
          <label className={styles.fieldRowLabel}>Информация о зарплате</label>
          <input
            type="text"
            className={styles.fieldRowInput}
            value={salaryInfo}
            onChange={(e) => setSalaryInfo(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formBlock} style={{ marginBottom: 0 }}>
          <label className={styles.blockLabel}>Обязанности</label>
          <textarea
            className={styles.blockTextarea}
            style={{ height: '200px' }}
            value={responsibilities}
            onChange={(e) => setResponsibilities(e.target.value)}
          />
        </div>
        <div className={styles.formBlock} style={{ marginBottom: 0 }}>
          <label className={styles.blockLabel}>Требования</label>
          <textarea
            className={styles.blockTextarea}
            style={{ height: '200px' }}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.formBlock} style={{ marginTop: '1.5rem' }}>
        <label className={styles.blockLabel}>Условия работы</label>
        <textarea
          className={styles.blockTextarea}
          style={{ height: '100px' }}
          value={workConditions}
          onChange={(e) => setWorkConditions(e.target.value)}
        />
      </div>
    </div>
  );
}

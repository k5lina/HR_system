import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { nextId } from '../../utils';
import styles from '../Requests/Requests.module.css';

export default function VacancyForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { vacancies, setVacancies, requests, departmentPositions, positions, vacancyStatuses, currentUser } = useApp();

  const isNew = id === 'new';
  const requestId = searchParams.get('requestId') ? Number(searchParams.get('requestId')) : undefined;
  const sourceRequest = requestId ? requests.find((r) => r.request_id === requestId) : undefined;
  const existing = isNew ? null : vacancies.find((v) => v.vacancy_id === Number(id));

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [responsibilities, setResponsibilities] = useState(existing?.responsibilities ?? sourceRequest?.responsibilities ?? '');
  const [requirements, setRequirements] = useState(existing?.requirements ?? sourceRequest?.requirements ?? '');
  const [workSchedule, setWorkSchedule] = useState(existing?.work_schedule ?? '');
  const [workConditions, setWorkConditions] = useState(existing?.work_conditions ?? '');
  const [salaryInfo, setSalaryInfo] = useState(
    existing?.salary_info ??
    (sourceRequest?.salary_min ? `от ${sourceRequest.salary_min}${sourceRequest.salary_max ? ' до ' + sourceRequest.salary_max : ''} руб.` : '')
  );
  const [statusId, setStatusId] = useState(existing?.vacancy_status_id ?? 1);

  function handleSave() {
    const now = new Date().toISOString();
    if (isNew) {
      setVacancies((prev) => [...prev, {
        vacancy_id: nextId(vacancies, 'vacancy_id'),
        title, description, responsibilities, requirements,
        work_schedule: workSchedule, work_conditions: workConditions,
        salary_info: salaryInfo, created_at: now.slice(0, 10),
        updated_at: now, request_id: requestId ?? 0,
        vacancy_status_id: statusId, user_id: currentUser!.user_id,
      }]);
    } else if (existing) {
      setVacancies((prev) =>
        prev.map((v) => v.vacancy_id === existing.vacancy_id
          ? { ...v, title, description, responsibilities, requirements, work_schedule: workSchedule, work_conditions: workConditions, salary_info: salaryInfo, vacancy_status_id: statusId, updated_at: now }
          : v)
      );
    }
    navigate('/vacancies');
  }

  function handlePublish() {
    handleSave();
  }

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>{isNew ? 'Новая вакансия' : `Вакансия #${id}`}</h2>
        <Link to="/vacancies" className={styles.linkBtn}>← Назад</Link>
      </div>
      <div className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>Название вакансии</label>
            <input type="text" className={styles.formInput} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>Описание вакансии</label>
            <textarea className={styles.formTextarea} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>Обязанности</label>
            <textarea className={styles.formTextarea} value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} rows={4} />
          </div>
          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>Требования</label>
            <textarea className={styles.formTextarea} value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={4} />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>График работы</label>
            <textarea className={styles.formTextarea} value={workSchedule} onChange={(e) => setWorkSchedule(e.target.value)} rows={2} />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Условия работы</label>
            <textarea className={styles.formTextarea} value={workConditions} onChange={(e) => setWorkConditions(e.target.value)} rows={2} />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Информация о зарплате</label>
            <input type="text" className={styles.formInput} value={salaryInfo} onChange={(e) => setSalaryInfo(e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Статус вакансии</label>
            <select className={styles.formSelect} value={statusId} onChange={(e) => setStatusId(Number(e.target.value))}>
              {vacancyStatuses.map((vs) => (
                <option key={vs.vacancy_status_id} value={vs.vacancy_status_id}>{vs.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.formActions}>
          <button className={styles.btnPrimary} onClick={handleSave}>Сохранить</button>
          <button className={styles.btnSecondary} onClick={handlePublish}>Опубликовать</button>
        </div>
      </div>
    </div>
  );
}

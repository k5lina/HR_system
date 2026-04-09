import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { nextId } from '../../utils';
import styles from './Requests.module.css';

export default function RequestForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    requests, setRequests, requestStatuses, departmentPositions,
    departments, positions, employmentTypes, currentUser,
  } = useApp();

  const isNew = id === 'new';
  const existing = isNew ? null : requests.find((r) => r.request_id === Number(id));

  const [deptId, setDeptId] = useState(0);
  const [dpId, setDpId] = useState(existing?.department_position_id ?? 0);
  const [employmentTypeId, setEmploymentTypeId] = useState(existing?.employment_type_id ?? 1);
  const [responsibilities, setResponsibilities] = useState(existing?.responsibilities ?? '');
  const [requirements, setRequirements] = useState(existing?.requirements ?? '');
  const [experience, setExperience] = useState(existing?.experience ?? 0);
  const [salaryMin, setSalaryMin] = useState(existing?.salary_min ?? '');
  const [salaryMax, setSalaryMax] = useState(existing?.salary_max ?? '');
  const [education, setEducation] = useState(existing?.education ?? '');

  useEffect(() => {
    if (existing) {
      const dp = departmentPositions.find((d) => d.department_position_id === existing.department_position_id);
      if (dp) setDeptId(dp.department_id);
    }
  }, [existing, departmentPositions]);

  const filteredDps = departmentPositions.filter((dp) => dp.department_id === deptId);

  function statusName(id: number) {
    return requestStatuses.find((s) => s.request_status_id === id)?.name ?? 'Новая';
  }

  function handleSave(statusId: number) {
    if (isNew) {
      const newReq = {
        request_id: nextId(requests, 'request_id'),
        created_at: new Date().toISOString(),
        responsibilities, requirements, experience: Number(experience),
        salary_min: salaryMin ? Number(salaryMin) : undefined,
        salary_max: salaryMax ? Number(salaryMax) : undefined,
        education,
        user_id: currentUser!.user_id,
        request_status_id: statusId,
        employment_type_id: employmentTypeId,
        department_position_id: dpId,
      };
      setRequests((prev) => [...prev, newReq]);
    } else if (existing) {
      setRequests((prev) =>
        prev.map((r) =>
          r.request_id === existing.request_id
            ? { ...r, responsibilities, requirements, experience: Number(experience), salary_min: salaryMin ? Number(salaryMin) : undefined, salary_max: salaryMax ? Number(salaryMax) : undefined, education, employment_type_id: employmentTypeId, department_position_id: dpId, request_status_id: statusId }
            : r
        )
      );
    }
    navigate('/requests');
  }

  function handleCreateVacancy() {
    navigate(`/vacancies/new?requestId=${existing?.request_id}`);
  }

  const canEdit = currentUser?.role_id === 1 || currentUser?.role_id === 3;
  const canApprove = currentUser?.role_id === 1 || currentUser?.role_id === 2;
  const currentStatus = existing?.request_status_id ?? 1;

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>{isNew ? 'Новая заявка' : `Заявка #${id}`}</h2>
        <Link to="/requests" className={styles.linkBtn}>← Назад</Link>
      </div>
      <div className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Дата создания</label>
            <div className={styles.readonly}>{isNew ? new Date().toLocaleDateString('ru-RU') : new Date(existing!.created_at).toLocaleDateString('ru-RU')}</div>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Статус</label>
            <div className={styles.statusBadge}>{statusName(currentStatus)}</div>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Отдел</label>
            <select className={styles.formSelect} value={deptId} onChange={(e) => { setDeptId(Number(e.target.value)); setDpId(0); }} disabled={!canEdit}>
              <option value={0}>— Выберите отдел —</option>
              {departments.map((d) => (
                <option key={d.department_id} value={d.department_id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Должность</label>
            <select className={styles.formSelect} value={dpId} onChange={(e) => setDpId(Number(e.target.value))} disabled={!canEdit || !deptId}>
              <option value={0}>— Выберите должность —</option>
              {filteredDps.map((dp) => {
                const pos = positions.find((p) => p.position_id === dp.position_id);
                return <option key={dp.department_position_id} value={dp.department_position_id}>{pos?.name}</option>;
              })}
            </select>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Тип занятости</label>
            <select className={styles.formSelect} value={employmentTypeId} onChange={(e) => setEmploymentTypeId(Number(e.target.value))} disabled={!canEdit}>
              {employmentTypes.map((et) => (
                <option key={et.employment_type_id} value={et.employment_type_id}>{et.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Опыт (лет)</label>
            <input type="number" className={styles.formInput} value={experience} onChange={(e) => setExperience(Number(e.target.value))} min={0} disabled={!canEdit} />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Зарплата от</label>
            <input type="number" className={styles.formInput} value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} disabled={!canEdit} />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Зарплата до</label>
            <input type="number" className={styles.formInput} value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} disabled={!canEdit} />
          </div>
          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>Обязанности</label>
            <textarea className={styles.formTextarea} value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} rows={4} disabled={!canEdit} />
          </div>
          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>Требования</label>
            <textarea className={styles.formTextarea} value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={4} disabled={!canEdit} />
          </div>
          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>Образование</label>
            <textarea className={styles.formTextarea} value={education} onChange={(e) => setEducation(e.target.value)} rows={2} disabled={!canEdit} />
          </div>
        </div>
        <div className={styles.formActions}>
          {canEdit && isNew && (
            <button className={styles.btnSecondary} onClick={() => handleSave(1)}>Сохранить черновик</button>
          )}
          {canEdit && currentStatus === 1 && (
            <button className={styles.btnPrimary} onClick={() => handleSave(2)}>Отправить на согласование</button>
          )}
          {canApprove && currentStatus === 2 && (
            <>
              <button className={styles.btnSuccess} onClick={() => handleSave(3)}>Утвердить</button>
              <button className={styles.btnDanger} onClick={() => handleSave(4)}>Отклонить</button>
            </>
          )}
          {canApprove && currentStatus === 3 && (
            <button className={styles.btnPrimary} onClick={handleCreateVacancy}>Создать вакансию</button>
          )}
        </div>
      </div>
    </div>
  );
}

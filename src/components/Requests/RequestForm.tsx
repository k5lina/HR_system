import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { nextId } from '../../utils';
import styles from './Requests.module.css';

export default function RequestForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    requests, setRequests, departmentPositions,
    departments, positions, employmentTypes, currentUser, users
  } = useApp();

  const isNew = !id || id === 'new';
  const existing = isNew ? null : requests.find((r) => r.request_id === Number(id));

  const [deptId, setDeptId] = useState(0);
  const [dpId, setDpId] = useState(existing?.department_position_id ?? 0);
  const [employmentTypeId, setEmploymentTypeId] = useState(existing?.employment_type_id ?? 1);
  const [responsibilities, setResponsibilities] = useState(existing?.responsibilities ?? '');
  const [requirements, setRequirements] = useState(existing?.requirements ?? '');
  const [experience, setExperience] = useState<string | number>(existing?.experience ?? '');
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
      console.log('saving newReq', newReq);
      try {
        setRequests((prev) => {
          const next = [...prev, newReq as any];
          return next;
        });
      } catch (e) {
        console.error('setRequests error', e);
      }
    } else if (existing) {
      setRequests((prev) =>
        prev.map((r) =>
          r.request_id === existing.request_id
            ? { ...r, responsibilities, requirements, experience: Number(experience), salary_min: salaryMin ? Number(salaryMin) : undefined, salary_max: salaryMax ? Number(salaryMax) : undefined, education, employment_type_id: employmentTypeId, department_position_id: dpId, request_status_id: statusId }
            : r
        )
      );
    }
    console.log('navigating to /requests');
    navigate('/requests');
  }

  const roleId = currentUser?.role_id ?? 2;
  const currentStatus = existing?.request_status_id ?? 1;

  const canEdit = true;
  const showSave = true;
  const showSubmit = roleId === 1 || (roleId === 3 && (isNew || currentStatus === 1));
  const showCreateVacancy = (roleId === 1 || roleId === 2) && !isNew && currentStatus !== 4;
  const showReject = (roleId === 1 || roleId === 2) && !isNew && currentStatus !== 4;

  const headDeptIds = roleId === 3 && currentUser
    ? departmentPositions
        .filter((dp) => dp.position_id === currentUser.position_id)
        .map((dp) => dp.department_id)
    : null;

  const visibleDepartments = headDeptIds
    ? departments.filter((d) => headDeptIds.includes(d.department_id))
    : departments;

  let displayId = 'заполняется автоматически';
  let displayDate = 'заполняется автоматически';
  let authorName = 'заполняется автоматически';

  if (existing) {
    displayId = String(existing.request_id);
    displayDate = new Date(existing.created_at).toLocaleDateString('ru-RU');
    const author = users.find(u => u.user_id === existing.user_id);
    if (author) authorName = `${author.last_name} ${author.first_name}`;
  } else if (currentUser) {
    authorName = currentUser.full_name;
  }

  function handleSaveAndValidate(statusId: number) {
    handleSave(statusId);
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <Link to="/requests" className={styles.backBtn}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{marginRight: '0.5rem'}}>
            <path d="M19 12H5M12 19L5 12l7-7"/>
          </svg>
        </Link>
        <h2 className={styles.title}>Заявка на подбор персонала</h2>
      </div>

      <div className={styles.formToolbar}>
        {showSave && <button className={styles.btnSave} onClick={() => handleSaveAndValidate(currentStatus)}>Сохранить запись</button>}
        {showSubmit && (
          <button className={styles.btnSubmit} onClick={() => handleSaveAndValidate(2)}>Отправить заявку</button>
        )}
        {showCreateVacancy && (
          <button className={styles.btnSubmit} onClick={() => navigate(`/vacancies/new?requestId=${existing?.request_id}`)}>Создать вакансию</button>
        )}
        {showReject && (
          <button className={styles.btnSubmit} onClick={() => handleSaveAndValidate(4)}>Отклонить</button>
        )}
      </div>

      <div className={styles.autoFields}>
        <div className={styles.autoRow}>
          <span className={styles.autoLabel}>Номер заявки</span>
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
          <select className={styles.fieldRowSelect} value={deptId} onChange={(e) => { setDeptId(Number(e.target.value)); setDpId(0); }} disabled={!canEdit}>
            <option value={0}>Отдел</option>
            {visibleDepartments.map((d) => (
              <option key={d.department_id} value={d.department_id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className={styles.fieldRow}>
          <label className={styles.fieldRowLabel}>Требуемый опыт работы</label>
          <input type="text" className={styles.fieldRowInput} value={experience} onChange={(e) => setExperience(e.target.value)} disabled={!canEdit} />
        </div>

        <div className={styles.fieldRow}>
          <label className={styles.fieldRowLabel}>Должность</label>
          <select className={styles.fieldRowSelect} value={dpId} onChange={(e) => setDpId(Number(e.target.value))} disabled={!canEdit || !deptId}>
            <option value={0}>Должность</option>
            {filteredDps.map((dp) => {
              const pos = positions.find((p) => p.position_id === dp.position_id);
              return <option key={dp.department_position_id} value={dp.department_position_id}>{pos?.name}</option>;
            })}
          </select>
        </div>
        <div className={styles.fieldRow}>
          <label className={styles.fieldRowLabel}>Тип занятости</label>
          <select className={styles.fieldRowSelect} value={employmentTypeId} onChange={(e) => setEmploymentTypeId(Number(e.target.value))} disabled={!canEdit}>
            {employmentTypes.map((et) => (
              <option key={et.employment_type_id} value={et.employment_type_id}>{et.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.formBlock}>
        <label className={styles.blockLabel}>Образование</label>
        <textarea className={styles.blockTextarea} style={{height: '60px'}} value={education} onChange={(e) => setEducation(e.target.value)} placeholder="Образование" disabled={!canEdit} />
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formBlock} style={{marginBottom: 0}}>
          <label className={styles.blockLabel}>Обязанности</label>
          <textarea className={styles.blockTextarea} style={{height: '250px'}} value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} placeholder="Обязанности" disabled={!canEdit} />
        </div>
        <div className={styles.formBlock} style={{marginBottom: 0}}>
          <label className={styles.blockLabel}>Требования</label>
          <textarea className={styles.blockTextarea} style={{height: '250px'}} value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="Требования" disabled={!canEdit} />
        </div>
      </div>

      <div className={styles.bottomFields}>
        <div className={styles.bottomRow}>
          <span className={styles.bottomLabel}>Минимальный уровень зарплаты (руб.)</span>
          <input type="number" className={styles.bottomInput} value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} disabled={!canEdit} />
        </div>
        <div className={styles.bottomRow}>
          {/* Mockup has typo and says "Минимальный" twice, we'll use Максимальный for clarity instead */}
          <span className={styles.bottomLabel}>Максимальный уровень зарплаты (руб.)</span>
          <input type="number" className={styles.bottomInput} value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} disabled={!canEdit} />
        </div>
      </div>
    </div>
  );
}

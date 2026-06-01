import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { nextId, fmtOfferId } from '../../utils';
import { downloadOfferDocx } from '../../utils/offerDocx';
import styles from '../Requests/Requests.module.css';

export default function OfferForm() {
  const { candidateId } = useParams();
  const cId = Number(candidateId);
  const navigate = useNavigate();

  const {
    candidates, setCandidates,
    jobOffers, setJobOffers,
    offerStatuses, contractTypes,
    publications, setPublications,
    vacancies, setVacancies,
    requests, setRequests,
    departmentPositions, positions, departments,
    users, roles, currentUser,
  } = useApp();

  const candidate = candidates.find((c) => c.candidate_id === cId);
  const existing = jobOffers.find((o) => o.candidate_id === cId);

  // ---- resolve meta (до useState, чтобы использовать в начальных значениях) ----
  const pub = candidate ? publications.find((p) => p.publication_id === candidate.publication_id) : null;
  const vacancy = pub ? vacancies.find((v) => v.vacancy_id === pub.vacancy_id) : null;
  const linkedRequest = vacancy ? requests.find((r) => r.request_id === vacancy.request_id) : null;
  const dp = linkedRequest
    ? departmentPositions.find((d) => d.department_position_id === linkedRequest.department_position_id)
    : null;
  const linkedPos = dp ? positions.find((p) => p.position_id === dp.position_id) : null;
  const linkedDept = dp ? departments.find((d) => d.department_id === dp.department_id) : null;
  const headUser = linkedRequest ? users.find((u) => u.user_id === linkedRequest.user_id) : null;

  const [proposedSalary, setProposedSalary] = useState<string | number>(existing?.proposed_salary ?? '');
  const [startDate, setStartDate] = useState(existing?.start_date ?? '');
  const [contractTypeId, setContractTypeId] = useState(existing?.contract_type_id ?? (contractTypes[0]?.contract_type_id ?? 1));
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [workSchedule, setWorkSchedule] = useState(existing?.work_schedule ?? vacancy?.work_schedule ?? '');
  const [responsibilities, setResponsibilities] = useState(existing?.responsibilities ?? vacancy?.responsibilities ?? '');
  const [workConditions, setWorkConditions] = useState(existing?.work_conditions ?? vacancy?.work_conditions ?? '');

  const [showRejectModal, setShowRejectModal] = useState(false);

  const candidateName = candidate
    ? `${candidate.last_name} ${candidate.first_name}${candidate.middle_name ? ' ' + candidate.middle_name : ''}`
    : '—';
  const positionName = linkedPos?.name ?? vacancy?.title ?? '—';
  const deptName = linkedDept?.name ?? '—';
  const headName = headUser
    ? `${headUser.last_name} ${headUser.first_name}${headUser.middle_name ? ' ' + headUser.middle_name : ''}`
    : '—';
  const createdAt = existing?.created_at
    ? new Date(existing.created_at).toLocaleDateString('ru-RU')
    : new Date().toLocaleDateString('ru-RU');

  const backTo = '/selection?stage=offer';

  // ---- save ----
  function buildRecord(statusId: number) {
    const now = new Date().toISOString();
    return {
      offer_id: existing?.offer_id ?? nextId(jobOffers, 'offer_id'),
      created_at: existing?.created_at ?? now,
      proposed_salary: Number(proposedSalary) || 0,
      start_date: startDate,
      notes,
      work_schedule: workSchedule,
      responsibilities,
      work_conditions: workConditions,
      candidate_id: cId,
      contract_type_id: contractTypeId,
      offer_status_id: statusId,
    };
  }

  function persist(rec: ReturnType<typeof buildRecord>) {
    if (existing) {
      setJobOffers((prev) => prev.map((o) => o.offer_id === existing.offer_id ? { ...o, ...rec } : o));
    } else {
      setJobOffers((prev) => [...prev, rec]);
    }
  }

  function handleSave() {
    persist(buildRecord(existing?.offer_status_id ?? 1));
  }

  function handleApprove() {
    persist(buildRecord(2)); // accepted
    setCandidates((prev) =>
      prev.map((c) => c.candidate_id === cId ? { ...c, stage_id: 6 } : c),
    );
    // Принятие предложения завершает подбор: вакансия закрывается,
    // её активные публикации снимаются, а связанная заявка → «Выполнена».
    if (vacancy) {
      const now = new Date().toISOString();
      const today = now.slice(0, 10);
      setVacancies((prev) =>
        prev.map((v) =>
          v.vacancy_id === vacancy.vacancy_id
            ? { ...v, vacancy_status_id: 3, closed_at: today, updated_at: now }
            : v,
        ),
      );
      setPublications((prev) =>
        prev.map((p) =>
          p.vacancy_id === vacancy.vacancy_id && p.is_active
            ? { ...p, is_active: false, unpublished_at: today }
            : p,
        ),
      );
      if (linkedRequest) {
        setRequests((prev) =>
          prev.map((r) =>
            r.request_id === linkedRequest.request_id
              ? { ...r, request_status_id: 3 }
              : r,
          ),
        );
      }
    }
    navigate(backTo);
  }

  function handleRejectConfirm() {
    persist(buildRecord(3)); // declined
    setShowRejectModal(false);
    navigate(backTo);
  }

  function handleDownload() {
    const contractType = contractTypes.find((c) => c.contract_type_id === contractTypeId)?.name ?? '—';
    const fmtDate = (d: Date) => d.toLocaleDateString('ru-RU');
    const startDateStr = startDate ? fmtDate(new Date(startDate)) : '—';

    // Дата письма — дата создания оффера (или сегодня); срок актуальности +7 дней.
    const letterDateObj = existing?.created_at ? new Date(existing.created_at) : new Date();
    const validUntilObj = new Date(letterDateObj.getTime() + 6 * 24 * 60 * 60 * 1000);

    // Менеджер по подбору = текущий пользователь. Телефон берём из полного
    // профиля (users), роль — из справочника ролей.
    const me = users.find((u) => u.user_id === currentUser?.user_id);
    const managerShort = me
      ? `${me.last_name} ${me.first_name[0]}.${me.middle_name ? me.middle_name[0] + '.' : ''}`
      : (currentUser?.full_name ?? '—');
    const managerRole = roles.find((r) => r.role_id === currentUser?.role_id)?.name
      ?? 'Менеджер по подбору персонала';

    const offerLabel = existing ? fmtOfferId(existing.offer_id, existing.created_at) : '';
    downloadOfferDocx(
      {
        candidateName,
        position: positionName,
        department: deptName,
        contractType,
        salary: String(proposedSalary ?? ''),
        startDate: startDateStr,
        workSchedule: workSchedule || '—',
        responsibilities: responsibilities || '—',
        workConditions: workConditions || '—',
        managerRole,
        managerName: managerShort,
        managerEmail: me?.email ?? currentUser?.email ?? '—',
        managerPhone: me?.phone ?? '—',
        letterDate: fmtDate(letterDateObj),
        validUntil: fmtDate(validUntilObj),
      },
      offerLabel ? `Предложение_о_трудоустройстве_${offerLabel}` : 'Предложение_о_трудоустройстве',
    );
  }

  if (!candidate) return <p className={styles.empty}>Кандидат не найден</p>;

  return (
    <div className={styles.section}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className={styles.title}>
          Предложение о трудоустройстве{existing ? ` №${fmtOfferId(existing.offer_id, existing.created_at)}` : ''}
        </h1>
      </div>

      {/* Toolbar */}
      <div className={styles.formToolbar}>
        <button className={styles.btnSave} onClick={handleSave}>Сохранить запись</button>
        <div className={styles.toolbarRight}>
          <button className={styles.btnApprove} onClick={handleApprove}>Одобрить</button>
          <button className={styles.btnReject} onClick={() => setShowRejectModal(true)}>Отклонить</button>
        </div>
      </div>

      {/* Fields grid — 3 columns, 3 rows */}
      <div className={styles.fieldsGrid3}>
        {/* Row 1 */}
        <div className={styles.gridField}>
          <span className={styles.gridFieldLabel}>Дата создания</span>
          <span className={styles.gridFieldValue}>{createdAt}</span>
        </div>
        <div className={styles.gridField}>
          <span className={styles.gridFieldLabel}>Отдел</span>
          <span className={styles.gridFieldValue}>{deptName}</span>
        </div>
        <div className={styles.gridField}>
          <span className={styles.gridFieldLabel}>Должность</span>
          <span className={styles.gridFieldValue}>{positionName}</span>
        </div>

        {/* Row 2 */}
        <div className={styles.gridField}>
          <span className={styles.gridFieldLabel}>ФИО кандидата</span>
          <span className={styles.gridFieldValue}>{candidateName}</span>
        </div>
        <div className={styles.gridField}>
          <span className={styles.gridFieldLabel}>Тип трудового договора</span>
          <select
            className={styles.gridFieldSelect}
            value={contractTypeId}
            onChange={(e) => setContractTypeId(Number(e.target.value))}
          >
            {contractTypes.map((ct) => (
              <option key={ct.contract_type_id} value={ct.contract_type_id}>{ct.name}</option>
            ))}
          </select>
        </div>
        <div className={styles.gridField}>
          <span className={styles.gridFieldLabel}>Руководитель</span>
          <span className={styles.gridFieldValue}>{headName}</span>
        </div>

        {/* Row 3 */}
        <div className={styles.gridField}>
          <span className={styles.gridFieldLabel}>Предложенная зарплата (руб.)</span>
          <input
            type="number"
            className={styles.gridFieldInput}
            value={proposedSalary}
            onChange={(e) => setProposedSalary(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className={styles.gridField}>
          <span className={styles.gridFieldLabel}>Дата выхода на работу</span>
          <input
            type="date"
            className={styles.gridFieldInput}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className={styles.gridField}>
          <span className={styles.gridFieldLabel}>График работы</span>
          <input
            type="text"
            className={styles.gridFieldInput}
            value={workSchedule}
            onChange={(e) => setWorkSchedule(e.target.value)}
          />
        </div>
      </div>

      {/* Three column textareas */}
      <div className={styles.threeColGrid}>
        <div className={styles.interviewBlock}>
          <span className={styles.interviewBlockLabel}>Обязанности</span>
          <textarea
            className={styles.interviewTextarea}
            value={responsibilities}
            onChange={(e) => setResponsibilities(e.target.value)}
          />
        </div>
        <div className={styles.interviewBlock}>
          <span className={styles.interviewBlockLabel}>Условия работы</span>
          <textarea
            className={styles.interviewTextarea}
            value={workConditions}
            onChange={(e) => setWorkConditions(e.target.value)}
          />
        </div>
        <div className={styles.interviewBlock}>
          <span className={styles.interviewBlockLabel}>Заметки по обсуждению</span>
          <textarea
            className={styles.interviewTextarea}
            placeholder="Заметки по обсуждению"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Download offer */}
      <div style={{ marginTop: '1.5rem' }}>
        <button className={styles.iconLinkBtn} onClick={handleDownload}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M10 3v10M6 9l4 4 4-4M4 17h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Скачать предложение
        </button>
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Отклонить предложение</span>
              <button className={styles.modalClose} onClick={() => setShowRejectModal(false)}>✕</button>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-dark)', marginBottom: '1.5rem' }}>
              Подтвердите, что кандидат отклонил предложение о трудоустройстве.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.btnReject} onClick={handleRejectConfirm}>Подтвердить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

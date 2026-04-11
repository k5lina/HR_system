import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { nextId, fmtOfferId } from '../../utils';
import styles from '../Requests/Requests.module.css';

export default function OfferForm() {
  const { candidateId } = useParams();
  const cId = Number(candidateId);
  const navigate = useNavigate();

  const {
    candidates, setCandidates,
    jobOffers, setJobOffers,
    offerStatuses, contractTypes,
    publications, vacancies, requests,
    departmentPositions, positions, departments,
    users, currentUser,
  } = useApp();

  const candidate = candidates.find((c) => c.candidate_id === cId);
  const existing = jobOffers.find((o) => o.candidate_id === cId);

  const [proposedSalary, setProposedSalary] = useState<string | number>(existing?.proposed_salary ?? '');
  const [startDate, setStartDate] = useState(existing?.start_date ?? '');
  const [contractTypeId, setContractTypeId] = useState(existing?.contract_type_id ?? (contractTypes[0]?.contract_type_id ?? 1));
  const [notes, setNotes] = useState(existing?.notes ?? '');

  const [showRejectModal, setShowRejectModal] = useState(false);

  // ---- resolve meta ----
  const pub = candidate ? publications.find((p) => p.publication_id === candidate.publication_id) : null;
  const vacancy = pub ? vacancies.find((v) => v.vacancy_id === pub.vacancy_id) : null;
  const linkedRequest = vacancy ? requests.find((r) => r.request_id === vacancy.request_id) : null;
  const dp = linkedRequest
    ? departmentPositions.find((d) => d.department_position_id === linkedRequest.department_position_id)
    : null;
  const linkedPos = dp ? positions.find((p) => p.position_id === dp.position_id) : null;
  const linkedDept = dp ? departments.find((d) => d.department_id === dp.department_id) : null;

  const headUser = linkedRequest ? users.find((u) => u.user_id === linkedRequest.user_id) : null;

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

  const backTo = pub ? `/published/${pub.vacancy_id}` : '/home';

  // ---- save ----
  function buildRecord(statusId: number) {
    const now = new Date().toISOString();
    return {
      offer_id: existing?.offer_id ?? nextId(jobOffers, 'offer_id'),
      created_at: existing?.created_at ?? now,
      proposed_salary: Number(proposedSalary) || 0,
      start_date: startDate,
      notes,
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
    navigate(backTo);
  }

  function handleRejectConfirm() {
    persist(buildRecord(3)); // declined
    setShowRejectModal(false);
    navigate(backTo);
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
          <span className={styles.gridFieldValue}>{vacancy?.work_schedule ?? '—'}</span>
        </div>
      </div>

      {/* Three column textareas */}
      <div className={styles.threeColGrid}>
        <div className={styles.interviewBlock}>
          <span className={styles.interviewBlockLabel}>Обязанности</span>
          <div className={styles.interviewTextarea} style={{ overflowY: 'auto', cursor: 'default' }}>
            {vacancy?.responsibilities ?? '—'}
          </div>
        </div>
        <div className={styles.interviewBlock}>
          <span className={styles.interviewBlockLabel}>Условия работы</span>
          <div className={styles.interviewTextarea} style={{ overflowY: 'auto', cursor: 'default' }}>
            {vacancy?.work_conditions ?? '—'}
          </div>
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
        <button className={styles.iconLinkBtn} disabled>
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

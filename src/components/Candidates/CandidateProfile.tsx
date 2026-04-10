import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import styles from '../Requests/Requests.module.css';

const STAGE_ROUTES: Record<number, string> = {
  2: 'phone-interview',
  3: 'main-interview',
  4: 'security-check',
  5: 'medical-check',
  6: 'offer',
};

export default function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const candidateId = Number(id);

  const {
    candidates, setCandidates,
    publications, vacancies, requests,
    departmentPositions, positions,
    selectionStages, rejectionReasons,
  } = useApp();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReasonId, setRejectReasonId] = useState(1);

  const candidate = candidates.find((c) => c.candidate_id === candidateId);
  if (!candidate) {
    return (
      <div className={styles.section}>
        <p className={styles.empty}>Кандидат не найден</p>
      </div>
    );
  }

  const pub = publications.find((p) => p.publication_id === candidate.publication_id);
  const vacancy = pub ? vacancies.find((v) => v.vacancy_id === pub.vacancy_id) : null;
  const linkedRequest = vacancy ? requests.find((r) => r.request_id === vacancy.request_id) : null;
  const dp = linkedRequest
    ? departmentPositions.find((d) => d.department_position_id === linkedRequest.department_position_id)
    : null;
  const linkedPos = dp ? positions.find((p) => p.position_id === dp.position_id) : null;
  const positionName = linkedPos?.name ?? vacancy?.title ?? '—';

  const stageName = selectionStages.find((s) => s.stage_id === candidate.stage_id)?.name ?? '—';
  const rejectionName = candidate.rejection_reason_id
    ? rejectionReasons.find((r) => r.rejection_reason_id === candidate.rejection_reason_id)?.name
    : null;

  const backTo = pub ? `/published/${pub.vacancy_id}` : '/home';
  const isNewStage = candidate.stage_id === 1;

  function handleApprove() {
    if (!window.confirm('Одобрить кандидата и перевести на следующий этап?')) return;
    setCandidates((prev) =>
      prev.map((c) => c.candidate_id === candidateId ? { ...c, stage_id: 2 } : c),
    );
    navigate(backTo);
  }

  function handleRejectConfirm() {
    setCandidates((prev) =>
      prev.map((c) =>
        c.candidate_id === candidateId ? { ...c, rejection_reason_id: rejectReasonId } : c,
      ),
    );
    setShowRejectModal(false);
    navigate(backTo);
  }

  const historyRoute = STAGE_ROUTES[candidate.stage_id]
    ? `/selection/${candidateId}/${STAGE_ROUTES[candidate.stage_id]}`
    : null;

  return (
    <div className={styles.section}>
      {/* Header */}
      <div className={styles.header}>
        <Link to={backTo} className={styles.backBtn}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: '0.5rem' }}>
            <path d="M19 12H5M12 19L5 12l7-7" />
          </svg>
        </Link>
        <h2 className={styles.title}>
          {candidate.last_name} {candidate.first_name}{candidate.middle_name ? ' ' + candidate.middle_name : ''}
        </h2>
      </div>

      {/* Toolbar */}
      <div className={styles.formToolbar}>
        {isNewStage ? (
          <>
            <button className={styles.btnSave} onClick={handleApprove}>Одобрить кандидата</button>
            <button className={styles.btnSubmit} onClick={() => setShowRejectModal(true)}>Отклонить кандидата</button>
          </>
        ) : (
          historyRoute
            ? <Link to={historyRoute} className={styles.btnSave} style={{ textDecoration: 'none' }}>Посмотреть историю отбора</Link>
            : <button className={styles.btnSave} disabled>Посмотреть историю отбора</button>
        )}
      </div>

      {/* Auto fields */}
      <div className={styles.autoFields}>
        <div className={styles.autoRow}>
          <span className={styles.autoLabel}>Текущий этап отбора</span>
          <span className={styles.autoValue}>{stageName}</span>
        </div>
        <div className={styles.autoRow}>
          <span className={styles.autoLabel}>Номер кандидата</span>
          <span className={styles.autoValue}>{candidate.candidate_id}</span>
        </div>
        <div className={styles.autoRow}>
          <span className={styles.autoLabel}>Должность</span>
          <span className={styles.autoValue}>{positionName}</span>
        </div>
      </div>

      {/* Info grid */}
      <div className={styles.formGrid}>
        <div className={styles.fieldRow}>
          <label className={styles.fieldRowLabel}>Дата рождения</label>
          <span className={styles.autoValue}>
            {candidate.birth_date ? new Date(candidate.birth_date).toLocaleDateString('ru-RU') : '—'}
          </span>
        </div>
        <div className={styles.fieldRow}>
          <label className={styles.fieldRowLabel}>Номер телефона</label>
          <span className={styles.autoValue}>{candidate.phone}</span>
        </div>
        <div className={styles.fieldRow}>
          <label className={styles.fieldRowLabel}>Город проживания</label>
          <span className={styles.autoValue}>{candidate.city}</span>
        </div>
        <div className={styles.fieldRow}>
          <label className={styles.fieldRowLabel}>Опыт работы</label>
          <span className={styles.autoValue}>{candidate.work_experience} лет</span>
        </div>
      </div>

      {/* Education */}
      <div className={styles.formBlock} style={{ marginTop: '1.5rem' }}>
        <label className={styles.blockLabel}>Образование</label>
        <div className={styles.blockTextarea} style={{ minHeight: '60px', cursor: 'default' }}>
          {candidate.education || '—'}
        </div>
      </div>

      {/* Resume text */}
      <div className={styles.formBlock}>
        <label className={styles.blockLabel}>Текст резюме</label>
        <div className={styles.blockTextarea} style={{ minHeight: '180px', cursor: 'default', whiteSpace: 'pre-wrap' }}>
          {candidate.resume_text || 'заполняется автоматически'}
        </div>
      </div>

      {/* Download resume */}
      <div style={{ marginTop: '1rem' }}>
        <a
          href={candidate.resume_path}
          className={styles.btnSave}
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          download
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 3v13M7 11l5 5 5-5M3 21h18" />
          </svg>
          Скачать резюме
        </a>
      </div>

      {/* Rejection reason display */}
      {rejectionName && (
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--red-600)', fontWeight: 600 }}>
          Причина отказа: {rejectionName}
        </p>
      )}

      {/* Reject modal */}
      {showRejectModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Отклонить кандидата</span>
              <button className={styles.modalClose} onClick={() => setShowRejectModal(false)}>✕</button>
            </div>
            <div className={styles.modalField} style={{ marginBottom: '1.5rem' }}>
              <span className={styles.modalLabel}>Причина отказа</span>
              <select
                className={styles.modalSelect}
                value={rejectReasonId}
                onChange={(e) => setRejectReasonId(Number(e.target.value))}
              >
                {rejectionReasons.map((r) => (
                  <option key={r.rejection_reason_id} value={r.rejection_reason_id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnSubmit} onClick={handleRejectConfirm}>Подтвердить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

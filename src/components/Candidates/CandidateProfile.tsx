import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  nextId, fmtInterviewId, fmtSecurityCheckId,
  fmtMedicalCheckId, fmtOfferId, fmtAnalysisId,
} from '../../utils';
import styles from '../Requests/Requests.module.css';

export default function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const candidateId = Number(id);

  const {
    candidates, setCandidates,
    publications, vacancies, requests,
    departmentPositions, positions,
    selectionStages, rejectionReasons,
    interviews, setInterviews,
    securityChecks, medicalChecks, jobOffers,
    resumeAnalyses,
    interviewStatuses, medicalCheckStatuses, offerStatuses,
    resumeAnalysisStatuses,
    currentUser,
  } = useApp();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReasonId, setRejectReasonId] = useState(1);
  const [showHistory, setShowHistory] = useState(false);

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
    const now = new Date().toISOString();
    // Auto-create phone interview if not yet exists
    setInterviews((prev) => {
      if (prev.some((i) => i.candidate_id === candidateId && i.stage_id === 2)) return prev;
      return [
        ...prev,
        {
          interview_id: nextId(prev, 'interview_id'),
          created_at: now,
          scheduled_at: '',
          questions: '',
          candidate_id: candidateId,
          stage_id: 2,
          interview_status_id: 1,
          user_id: currentUser!.user_id,
        },
      ];
    });
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

  // ─── History data ─────────────────────────────────────────────
  const phoneInterview = interviews.find((i) => i.candidate_id === candidateId && i.stage_id === 2);
  const mainInterview  = interviews.find((i) => i.candidate_id === candidateId && i.stage_id === 3);
  const securityCheck  = securityChecks.find((s) => s.candidate_id === candidateId);
  const medicalCheck   = medicalChecks.find((m) => m.candidate_id === candidateId);
  const jobOffer       = jobOffers.find((o) => o.candidate_id === candidateId);
  const resumeAnalysis = resumeAnalyses.find((a) => a.candidate_id === candidateId);

  function getInterviewStatus(statusId: number) {
    return interviewStatuses.find((s) => s.interview_status_id === statusId)?.name ?? '—';
  }
  function getMedStatus(statusId: number) {
    return medicalCheckStatuses.find((s) => s.medical_check_status_id === statusId)?.name ?? '—';
  }
  function getOfferStatus(statusId: number) {
    return offerStatuses.find((s) => s.offer_status_id === statusId)?.name ?? '—';
  }
  function getAnalysisStatus(statusId: number) {
    return resumeAnalysisStatuses.find((s) => s.analysis_status_id === statusId)?.name ?? '—';
  }

  function fmtDt(dt: string | undefined) {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  }

  interface HistoryEntry {
    label: string;
    id: string;
    date: string;
    status: string;
    route: string;
    exists: boolean;
  }

  const historyEntries: HistoryEntry[] = [
    {
      label: 'Телефонное интервью',
      id: phoneInterview ? fmtInterviewId(phoneInterview.interview_id, phoneInterview.scheduled_at, 2) : '—',
      date: fmtDt(phoneInterview?.scheduled_at || phoneInterview?.created_at),
      status: phoneInterview ? getInterviewStatus(phoneInterview.interview_status_id) : '—',
      route: `/selection/${candidateId}/phone-interview`,
      exists: !!phoneInterview,
    },
    {
      label: 'Собеседование с руководителем',
      id: mainInterview ? fmtInterviewId(mainInterview.interview_id, mainInterview.scheduled_at, 3) : '—',
      date: fmtDt(mainInterview?.scheduled_at || mainInterview?.created_at),
      status: mainInterview ? getInterviewStatus(mainInterview.interview_status_id) : '—',
      route: `/selection/${candidateId}/main-interview`,
      exists: !!mainInterview,
    },
    {
      label: 'Проверка в Службе безопасности',
      id: securityCheck ? fmtSecurityCheckId(securityCheck.security_check_id, securityCheck.created_at) : '—',
      date: fmtDt(securityCheck?.created_at),
      status: securityCheck
        ? (securityCheck.result === true ? 'Проверка пройдена' : securityCheck.result === false ? 'Не пройдена' : 'В процессе')
        : '—',
      route: `/selection/${candidateId}/security-check`,
      exists: !!securityCheck,
    },
    {
      label: 'Медицинская проверка',
      id: medicalCheck ? fmtMedicalCheckId(medicalCheck.medical_check_id, medicalCheck.created_at) : '—',
      date: fmtDt(medicalCheck?.created_at),
      status: medicalCheck ? getMedStatus(medicalCheck.medical_check_status_id) : '—',
      route: `/selection/${candidateId}/medical-check`,
      exists: !!medicalCheck,
    },
    {
      label: 'Предложение о трудоустройстве',
      id: jobOffer ? fmtOfferId(jobOffer.offer_id, jobOffer.created_at) : '—',
      date: fmtDt(jobOffer?.created_at),
      status: jobOffer ? getOfferStatus(jobOffer.offer_status_id) : '—',
      route: `/selection/${candidateId}/offer`,
      exists: !!jobOffer,
    },
  ];

  const hasAnyHistory = historyEntries.some((e) => e.exists);

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
          <button className={styles.btnSave} onClick={() => setShowHistory(true)}>
            Посмотреть историю отбора
          </button>
        )}
      </div>

      {/* Auto fields */}
      <div className={styles.autoFields}>
        <div className={styles.autoRow}>
          <span className={styles.autoLabel}>Текущий этап отбора</span>
          <span className={styles.autoValue}>{stageName}</span>
          <span className={styles.autoLabel}>Дата рождения</span>
          <span className={styles.autoValue}>
            {candidate.birth_date ? new Date(candidate.birth_date).toLocaleDateString('ru-RU') : '—'}
          </span>
        </div>
        <div className={styles.autoRow}>
          <span className={styles.autoLabel}>Должность</span>
          <span className={styles.autoValue}>{positionName}</span>
          <span className={styles.autoLabel}>Город проживания</span>
          <span className={styles.autoValue}>{candidate.city}</span>
        </div>
        <div className={styles.autoRow}>
          <span className={styles.autoLabel}>Номер телефона</span>
          <span className={styles.autoValue}>{candidate.phone}</span>
        </div>
        <div className={styles.autoRow}>
          <span className={styles.autoLabel}>Опыт работы</span>
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

      {/* History modal */}
      {showHistory && (
        <div className={styles.modalBackdrop} onClick={() => setShowHistory(false)}>
          <div
            className={`${styles.modal} ${styles.modalWide}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>История отбора</span>
              <button className={styles.modalClose} onClick={() => setShowHistory(false)}>✕</button>
            </div>

            {!hasAnyHistory && (
              <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Документы по отбору ещё не созданы
              </p>
            )}

            <div className={styles.historyList}>
              {historyEntries.map((entry) => {
                const inner = (
                  <>
                    <div className={styles.historyItemInfo}>
                      <span className={styles.historyItemName}>{entry.label}</span>
                      {entry.exists && (
                        <span className={styles.historyItemId}>№ {entry.id}</span>
                      )}
                    </div>
                    <div className={styles.historyItemRight}>
                      {entry.exists && (
                        <>
                          <span className={styles.historyItemDate}>{entry.date}</span>
                          <span className={`${styles.badge} ${styles.statusWork}`} style={{ fontSize: '0.7rem' }}>
                            {entry.status}
                          </span>
                        </>
                      )}
                      {!entry.exists && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>Не создан</span>
                      )}
                      <span className={styles.historyItemArrow}>›</span>
                    </div>
                  </>
                );

                return entry.exists ? (
                  <Link
                    key={entry.route}
                    to={entry.route}
                    className={styles.historyItem}
                    onClick={() => setShowHistory(false)}
                  >
                    {inner}
                  </Link>
                ) : (
                  <div key={entry.route} className={`${styles.historyItem} ${styles.historyItemMissing}`}>
                    {inner}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

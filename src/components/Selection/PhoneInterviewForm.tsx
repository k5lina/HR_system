import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { nextId, fmtInterviewId } from '../../utils';
import styles from '../Requests/Requests.module.css';

export default function PhoneInterviewForm() {
  const { candidateId } = useParams();
  const cId = Number(candidateId);
  const navigate = useNavigate();

  const {
    candidates, setCandidates,
    interviews, setInterviews,
    publications, vacancies, requests,
    departmentPositions, positions,
    rejectionReasons,
    currentUser, users,
  } = useApp();

  const candidate = candidates.find((c) => c.candidate_id === cId);
  const existing = interviews.find((i) => i.candidate_id === cId && i.stage_id === 2);

  const [scheduledAt, setScheduledAt] = useState(existing?.scheduled_at?.slice(0, 16) ?? '');
  const [questions, setQuestions] = useState(existing?.questions ?? '');
  const [answers, setAnswers] = useState(existing?.answers ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionId, setRejectionId] = useState(rejectionReasons[0]?.rejection_reason_id ?? 1);

  // ---- resolve meta ----
  const pub = candidate ? publications.find((p) => p.publication_id === candidate.publication_id) : null;
  const vacancy = pub ? vacancies.find((v) => v.vacancy_id === pub.vacancy_id) : null;
  const linkedRequest = vacancy ? requests.find((r) => r.request_id === vacancy.request_id) : null;
  const dp = linkedRequest
    ? departmentPositions.find((d) => d.department_position_id === linkedRequest.department_position_id)
    : null;
  const linkedPos = dp ? positions.find((p) => p.position_id === dp.position_id) : null;
  const positionName = linkedPos?.name ?? vacancy?.title ?? '—';

  const managerName = currentUser?.full_name ?? '—';

  const candidateName = candidate
    ? `${candidate.last_name} ${candidate.first_name}${candidate.middle_name ? ' ' + candidate.middle_name : ''}`
    : '—';

  const backTo = pub ? `/published/${pub.vacancy_id}` : '/home';

  // ---- save ----
  function saveRecord(statusId: number) {
    const now = new Date().toISOString();
    if (existing) {
      setInterviews((prev) =>
        prev.map((i) =>
          i.interview_id === existing.interview_id
            ? { ...i, scheduled_at: scheduledAt, questions, answers, notes, interview_status_id: statusId, finished_at: now }
            : i,
        ),
      );
    } else {
      setInterviews((prev) => [
        ...prev,
        {
          interview_id: nextId(interviews, 'interview_id'),
          created_at: now,
          finished_at: statusId !== 1 ? now : undefined,
          scheduled_at: scheduledAt,
          questions,
          answers,
          notes,
          candidate_id: cId,
          stage_id: 2,
          interview_status_id: statusId,
          user_id: currentUser!.user_id,
        },
      ]);
    }
  }

  function handleSave() {
    saveRecord(existing?.interview_status_id ?? 1);
  }

  function handleApprove() {
    saveRecord(2);
    // Auto-create main interview if not yet exists
    setInterviews((prev) => {
      if (prev.some((i) => i.candidate_id === cId && i.stage_id === 3)) return prev;
      const now = new Date().toISOString();
      return [
        ...prev,
        {
          interview_id: nextId(prev, 'interview_id'),
          created_at: now,
          scheduled_at: '',
          questions: '',
          candidate_id: cId,
          stage_id: 3,
          interview_status_id: 1,
          user_id: currentUser!.user_id,
        },
      ];
    });
    setCandidates((prev) =>
      prev.map((c) => c.candidate_id === cId ? { ...c, stage_id: 3 } : c),
    );
    navigate(backTo);
  }

  function handleRejectConfirm() {
    saveRecord(4);
    setCandidates((prev) =>
      prev.map((c) => c.candidate_id === cId ? { ...c, rejection_reason_id: rejectionId } : c),
    );
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
          Телефонное интервью{existing ? ` №${fmtInterviewId(existing.interview_id, existing.scheduled_at, 2)}` : ''}
        </h1>
      </div>

      {/* Toolbar */}
      <div className={styles.formToolbar}>
        <button className={styles.btnSave} onClick={handleSave}>Сохранить запись</button>
        <div className={styles.toolbarRight}>
          <button className={styles.btnApprove} onClick={handleApprove}>Одобрить кандидата</button>
          <button className={styles.btnReject} onClick={() => setShowRejectModal(true)}>Отклонить кандидата</button>
        </div>
      </div>

      {/* Auto fields */}
      <div className={styles.autoFields}>
        <div className={styles.autoRow}>
          <span className={styles.autoLabel}>ФИО кандидата</span>
          <span className={styles.autoValue}>{candidateName}</span>
          <span className={styles.autoLabel}>Должность</span>
          <span className={styles.autoValue}>{positionName}</span>
        </div>
        <div className={styles.autoRow}>
          <span className={styles.autoLabel}>Менеджер по подбору</span>
          <span className={styles.autoValue}>{managerName}</span>
          <span className={styles.autoLabel}>Дата и время начала</span>
          <input
            type="datetime-local"
            className={styles.fieldRowInput}
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            style={{ flex: 'none', width: 220 }}
          />
        </div>
      </div>

      {/* Three column textarea grid */}
      <div className={styles.threeColGrid}>
        <div className={styles.interviewBlock}>
          <span className={styles.interviewBlockLabel}>Вопросы</span>
          <textarea
            className={styles.interviewTextarea}
            placeholder="Вопросы"
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
          />
        </div>
        <div className={styles.interviewBlock}>
          <span className={styles.interviewBlockLabel}>Ответы кандидата</span>
          <textarea
            className={styles.interviewTextarea}
            placeholder="Ответы кандидата"
            value={answers}
            onChange={(e) => setAnswers(e.target.value)}
          />
        </div>
        <div className={styles.interviewBlock}>
          <span className={styles.interviewBlockLabel}>Оценка кандидата</span>
          <textarea
            className={styles.interviewTextarea}
            placeholder="Оценка кандидата"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Отклонить кандидата</span>
              <button className={styles.modalClose} onClick={() => setShowRejectModal(false)}>✕</button>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Причина отказа</label>
                <select
                  className={styles.modalSelect}
                  value={rejectionId}
                  onChange={(e) => setRejectionId(Number(e.target.value))}
                >
                  {rejectionReasons.map((r) => (
                    <option key={r.rejection_reason_id} value={r.rejection_reason_id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnReject} onClick={handleRejectConfirm}>Подтвердить отказ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { nextId } from '../../utils';
import styles from '../Requests/Requests.module.css';

export default function MainInterviewForm() {
  const { candidateId } = useParams();
  const cId = Number(candidateId);
  const navigate = useNavigate();
  const { candidates, setCandidates, interviews, setInterviews, interviewStatuses, rejectionReasons, currentUser } = useApp();

  const candidate = candidates.find((c) => c.candidate_id === cId);
  const existing = interviews.find((i) => i.candidate_id === cId && i.stage_id === 3);

  const [scheduledAt, setScheduledAt] = useState(existing?.scheduled_at?.slice(0, 16) ?? '');
  const [questions, setQuestions] = useState(existing?.questions ?? '');
  const [answers, setAnswers] = useState(existing?.answers ?? '');
  const [score, setScore] = useState(existing?.score ?? '');
  const [statusId, setStatusId] = useState(existing?.interview_status_id ?? 1);
  const [rejectionId, setRejectionId] = useState(0);
  const [showRejection, setShowRejection] = useState(false);

  function saveInterview(newStatusId: number) {
    const now = new Date().toISOString();
    if (existing) {
      setInterviews((prev) =>
        prev.map((i) => i.interview_id === existing.interview_id
          ? { ...i, scheduled_at: scheduledAt, questions, answers, score: score ? Number(score) : undefined, interview_status_id: newStatusId, finished_at: now }
          : i)
      );
    } else {
      setInterviews((prev) => [...prev, {
        interview_id: nextId(interviews, 'interview_id'),
        created_at: now, finished_at: newStatusId === 2 ? now : undefined,
        scheduled_at: scheduledAt, questions, answers,
        score: score ? Number(score) : undefined,
        candidate_id: cId, stage_id: 3,
        interview_status_id: newStatusId, user_id: currentUser!.user_id,
      }]);
    }
  }

  function handleSuccess() {
    saveInterview(2);
    setCandidates((prev) => prev.map((c) => c.candidate_id === cId ? { ...c, stage_id: 4 } : c));
    navigate(`/candidates/${cId}`);
  }

  function handleReject() {
    if (!rejectionId) { setShowRejection(true); return; }
    saveInterview(4);
    setCandidates((prev) => prev.map((c) => c.candidate_id === cId ? { ...c, rejection_reason_id: rejectionId } : c));
    navigate(`/candidates/${cId}`);
  }

  if (!candidate) return <p>Кандидат не найден</p>;

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Собеседование с руководителем — {candidate.last_name} {candidate.first_name}</h2>
        <Link to={`/candidates/${cId}`} className={styles.linkBtn}>← Назад</Link>
      </div>
      <div className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Дата и время</label>
            <input type="datetime-local" className={styles.formInput} value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Оценка (0–10)</label>
            <input type="number" className={styles.formInput} value={score} onChange={(e) => setScore(e.target.value)} min={0} max={10} />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Статус</label>
            <select className={styles.formSelect} value={statusId} onChange={(e) => setStatusId(Number(e.target.value))}>
              {interviewStatuses.map((s) => (
                <option key={s.interview_status_id} value={s.interview_status_id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>Вопросы</label>
            <textarea className={styles.formTextarea} value={questions} onChange={(e) => setQuestions(e.target.value)} rows={4} />
          </div>
          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>Ответы кандидата</label>
            <textarea className={styles.formTextarea} value={answers} onChange={(e) => setAnswers(e.target.value)} rows={4} />
          </div>
          {showRejection && (
            <div className={styles.formField}>
              <label className={styles.formLabel}>Причина отказа</label>
              <select className={styles.formSelect} value={rejectionId} onChange={(e) => setRejectionId(Number(e.target.value))}>
                <option value={0}>— Выберите —</option>
                {rejectionReasons.map((r) => (
                  <option key={r.rejection_reason_id} value={r.rejection_reason_id}>{r.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className={styles.formActions}>
          <button className={styles.btnSuccess} onClick={handleSuccess}>Завершить успешно</button>
          <button className={styles.btnDanger} onClick={handleReject}>Кандидат не подходит</button>
        </div>
      </div>
    </div>
  );
}

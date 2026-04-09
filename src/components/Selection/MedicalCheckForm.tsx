import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { nextId } from '../../utils';
import styles from '../Requests/Requests.module.css';

export default function MedicalCheckForm() {
  const { candidateId } = useParams();
  const cId = Number(candidateId);
  const navigate = useNavigate();
  const { candidates, setCandidates, medicalChecks, setMedicalChecks, medicalCheckStatuses, rejectionReasons } = useApp();

  const candidate = candidates.find((c) => c.candidate_id === cId);
  const existing = medicalChecks.find((m) => m.candidate_id === cId);

  const [hasMedBook, setHasMedBook] = useState(existing?.has_medical_book ?? false);
  const [medBookCheckResult, setMedBookCheckResult] = useState<boolean | undefined>(existing?.medical_book_check_result);
  const [medExamDate, setMedExamDate] = useState(existing?.medical_exam_date?.slice(0, 10) ?? '');
  const [medExamResult, setMedExamResult] = useState<boolean | undefined>(existing?.medical_exam_result);
  const [isMedBookPrepared, setIsMedBookPrepared] = useState(existing?.is_medical_book_prepared ?? false);
  const [statusId, setStatusId] = useState(existing?.medical_check_status_id ?? 1);
  const [rejectionId, setRejectionId] = useState(0);
  const [showRejection, setShowRejection] = useState(false);

  function save(nextStatusId: number) {
    const now = new Date().toISOString().slice(0, 10);
    const rec = {
      medical_check_id: existing?.medical_check_id ?? nextId(medicalChecks, 'medical_check_id'),
      created_at: existing?.created_at ?? now,
      has_medical_book: hasMedBook,
      medical_book_check_result: medBookCheckResult,
      medical_exam_date: medExamDate || undefined,
      is_medical_book_prepared: isMedBookPrepared,
      medical_exam_result: medExamResult,
      candidate_id: cId,
      medical_check_status_id: nextStatusId,
    };
    if (existing) {
      setMedicalChecks((prev) => prev.map((m) => m.medical_check_id === existing.medical_check_id ? { ...m, ...rec } : m));
    } else {
      setMedicalChecks((prev) => [...prev, rec]);
    }
  }

  function handlePass() {
    save(4);
    setCandidates((prev) => prev.map((c) => c.candidate_id === cId ? { ...c, stage_id: 6 } : c));
    navigate(`/candidates/${cId}`);
  }

  function handleReject(reason: number) {
    save(statusId);
    setCandidates((prev) => prev.map((c) => c.candidate_id === cId ? { ...c, rejection_reason_id: reason } : c));
    navigate(`/candidates/${cId}`);
  }

  if (!candidate) return <p>Кандидат не найден</p>;

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Медицинская проверка — {candidate.last_name} {candidate.first_name}</h2>
        <Link to={`/candidates/${cId}`} className={styles.linkBtn}>← Назад</Link>
      </div>
      <div className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>ФИО / Должность</label>
            <div className={styles.readonly}>{candidate.last_name} {candidate.first_name}</div>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Статус медпроверки</label>
            <select className={styles.formSelect} value={statusId} onChange={(e) => setStatusId(Number(e.target.value))}>
              {medicalCheckStatuses.map((s) => (
                <option key={s.medical_check_status_id} value={s.medical_check_status_id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Наличие медкнижки</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e6edf3', marginTop: '0.25rem' }}>
              <input type="checkbox" checked={hasMedBook} onChange={(e) => setHasMedBook(e.target.checked)} />
              Есть медкнижка
            </label>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Результат проверки медкнижки</label>
            <select className={styles.formSelect} value={medBookCheckResult === undefined ? '' : medBookCheckResult ? 'true' : 'false'} onChange={(e) => setMedBookCheckResult(e.target.value === '' ? undefined : e.target.value === 'true')}>
              <option value="">— Не проверялось —</option>
              <option value="true">Корректна</option>
              <option value="false">Некорректна</option>
            </select>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Дата медосмотра</label>
            <input type="date" className={styles.formInput} value={medExamDate} onChange={(e) => setMedExamDate(e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Результат медосмотра</label>
            <select className={styles.formSelect} value={medExamResult === undefined ? '' : medExamResult ? 'true' : 'false'} onChange={(e) => setMedExamResult(e.target.value === '' ? undefined : e.target.value === 'true')}>
              <option value="">— Не проводился —</option>
              <option value="true">Пройден</option>
              <option value="false">Не пройден</option>
            </select>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Медкнижка оформлена</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e6edf3', marginTop: '0.25rem' }}>
              <input type="checkbox" checked={isMedBookPrepared} onChange={(e) => setIsMedBookPrepared(e.target.checked)} />
              Оформлена
            </label>
          </div>
        </div>
        <div className={styles.formActions}>
          <button className={styles.btnSuccess} onClick={handlePass}>Медпроверка пройдена</button>
          <button className={styles.btnDanger} onClick={() => { save(statusId); setShowRejection(true); }}>Отказать</button>
          <button className={styles.btnSecondary} onClick={() => save(statusId)}>Сохранить</button>
        </div>
        {showRejection && (
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <select className={styles.formSelect} style={{ maxWidth: '300px' }} value={rejectionId} onChange={(e) => setRejectionId(Number(e.target.value))}>
              <option value={0}>— Выберите причину —</option>
              {rejectionReasons.map((r) => (
                <option key={r.rejection_reason_id} value={r.rejection_reason_id}>{r.name}</option>
              ))}
            </select>
            <button className={styles.btnDanger} onClick={() => handleReject(rejectionId)}>Зафиксировать</button>
          </div>
        )}
      </div>
    </div>
  );
}

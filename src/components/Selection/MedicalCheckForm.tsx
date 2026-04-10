import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { nextId } from '../../utils';
import styles from '../Requests/Requests.module.css';

export default function MedicalCheckForm() {
  const { candidateId } = useParams();
  const cId = Number(candidateId);
  const navigate = useNavigate();

  const {
    candidates, setCandidates,
    medicalChecks, setMedicalChecks,
    medicalCheckStatuses,
    publications, vacancies, requests,
    departmentPositions, positions,
    rejectionReasons,
  } = useApp();

  const candidate = candidates.find((c) => c.candidate_id === cId);
  const existing = medicalChecks.find((m) => m.candidate_id === cId);

  const [hasMedBook, setHasMedBook] = useState<boolean | undefined>(existing?.has_medical_book);
  const [medBookResult, setMedBookResult] = useState<boolean | undefined>(existing?.medical_book_check_result);
  const [medExamDate, setMedExamDate] = useState(existing?.medical_exam_date?.slice(0, 10) ?? '');
  const [medExamResult, setMedExamResult] = useState<boolean | undefined>(existing?.medical_exam_result);
  const [statusId, setStatusId] = useState(existing?.medical_check_status_id ?? 1);

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

  const candidateName = candidate
    ? `${candidate.last_name} ${candidate.first_name}${candidate.middle_name ? ' ' + candidate.middle_name : ''}`
    : '—';

  const startedDate = existing?.created_at
    ? new Date(existing.created_at).toLocaleDateString('ru-RU')
    : '—';
  const statusName = medicalCheckStatuses.find((s) => s.medical_check_status_id === statusId)?.name ?? '—';

  const backTo = pub ? `/published/${pub.vacancy_id}` : '/home';

  // ---- helpers ----
  function buildRecord(nextStatusId: number) {
    const now = new Date().toISOString().slice(0, 10);
    return {
      medical_check_id: existing?.medical_check_id ?? nextId(medicalChecks, 'medical_check_id'),
      created_at: existing?.created_at ?? now,
      has_medical_book: hasMedBook,
      medical_book_check_result: medBookResult,
      medical_exam_date: medExamDate || undefined,
      medical_exam_result: medExamResult,
      candidate_id: cId,
      medical_check_status_id: nextStatusId,
    };
  }

  function persist(rec: ReturnType<typeof buildRecord>) {
    if (existing) {
      setMedicalChecks((prev) =>
        prev.map((m) => m.medical_check_id === existing.medical_check_id ? { ...m, ...rec } : m),
      );
    } else {
      setMedicalChecks((prev) => [...prev, rec]);
    }
  }

  function handleSave() {
    persist(buildRecord(statusId));
  }

  function handleApplyMedBook() {
    persist(buildRecord(statusId));
  }

  function handleApplyMedBookResult() {
    persist(buildRecord(statusId));
  }

  function handleApplyExamResult() {
    if (medExamResult === true) {
      persist(buildRecord(4)); // completed
      setCandidates((prev) =>
        prev.map((c) => c.candidate_id === cId ? { ...c, stage_id: 6 } : c),
      );
      navigate(backTo);
    } else if (medExamResult === false) {
      persist(buildRecord(statusId));
      setShowRejectModal(true);
    } else {
      persist(buildRecord(statusId));
    }
  }

  function handleRejectConfirm() {
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
        <h1 className={styles.title}>Медицинская проверка</h1>
      </div>

      {/* Toolbar */}
      <div className={styles.formToolbar}>
        <button className={styles.btnSave} onClick={handleSave}>Сохранить запись</button>
      </div>

      {/* Auto fields — 2-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 4rem' }}>
        <div className={styles.autoFields}>
          <div className={styles.autoRow}>
            <span className={styles.autoLabel}>Дата начала проверки</span>
            <span className={styles.autoValue}>{startedDate}</span>
          </div>
          <div className={styles.autoRow}>
            <span className={styles.autoLabel}>Должность</span>
            <span className={styles.autoValue}>{positionName}</span>
          </div>
        </div>
        <div className={styles.autoFields}>
          <div className={styles.autoRow}>
            <span className={styles.autoLabel}>Статус проверки</span>
            <span className={styles.autoValue}>{statusName}</span>
          </div>
          <div className={styles.autoRow}>
            <span className={styles.autoLabel}>ФИО кандидата</span>
            <span className={styles.autoValue}>{candidateName}</span>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className={styles.checklistSection}>
        <div className={styles.subSectionLabel}>Чеклист проверки</div>

        {/* Row 1: med book + book result — 2 columns */}
        <div className={styles.checklistGrid2}>
          {/* Наличие медкнижки */}
          <div className={styles.checklistItem}>
            <span className={styles.checklistItemLabel}>Наличие медкнижки</span>
            <div className={styles.radioGroup}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="hasMedBook"
                  checked={hasMedBook === true}
                  onChange={() => setHasMedBook(true)}
                />
                Да
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="hasMedBook"
                  checked={hasMedBook === false}
                  onChange={() => setHasMedBook(false)}
                />
                Нет
              </label>
            </div>
            <button className={styles.btnApply} onClick={handleApplyMedBook}>Применить</button>
          </div>

          {/* Результат проверки медкнижки */}
          <div className={styles.checklistItem}>
            <span className={styles.checklistItemLabel}>Результат проверки медкнижки</span>
            <div className={styles.radioGroup}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="medBookResult"
                  checked={medBookResult === true}
                  onChange={() => setMedBookResult(true)}
                />
                Корректна
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="medBookResult"
                  checked={medBookResult === false}
                  onChange={() => setMedBookResult(false)}
                />
                Некорректна
              </label>
            </div>
            <button className={styles.btnApply} onClick={handleApplyMedBookResult}>Применить</button>
          </div>
        </div>

        {/* Row 2: exam date */}
        <div className={styles.checklistItem}>
          <span className={styles.checklistItemLabel}>Дата прохождения медосмотра</span>
          <input
            type="date"
            className={styles.formFieldRowDate}
            value={medExamDate}
            onChange={(e) => setMedExamDate(e.target.value)}
            style={{ flex: 'none', width: 200 }}
          />
        </div>

        {/* Row 3: exam result */}
        <div className={styles.checklistItem}>
          <span className={styles.checklistItemLabel}>Результат медосмотра</span>
          <div className={styles.radioGroup}>
            <label className={styles.radioOption}>
              <input
                type="radio"
                name="medExamResult"
                checked={medExamResult === true}
                onChange={() => setMedExamResult(true)}
              />
              Удовлетворительный
            </label>
            <label className={styles.radioOption}>
              <input
                type="radio"
                name="medExamResult"
                checked={medExamResult === false}
                onChange={() => setMedExamResult(false)}
              />
              Неудовлетворительный
            </label>
          </div>
          <button className={styles.btnApply} onClick={handleApplyExamResult}>Применить</button>
        </div>

        {/* Row 4: download conclusion */}
        <div className={styles.checklistItem}>
          <button className={styles.iconLinkBtn} disabled>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M10 3v10M6 9l4 4 4-4M4 17h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Загрузить заключение
          </button>
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

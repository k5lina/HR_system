import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { nextId, generateMockSpectrumId } from '../../utils';
import styles from '../Requests/Requests.module.css';

export default function SecurityCheckForm() {
  const { candidateId } = useParams();
  const cId = Number(candidateId);
  const navigate = useNavigate();
  const { candidates, setCandidates, securityChecks, setSecurityChecks, rejectionReasons } = useApp();

  const candidate = candidates.find((c) => c.candidate_id === cId);
  const existing = securityChecks.find((sc) => sc.candidate_id === cId);

  const [passportSeries, setPassportSeries] = useState(existing?.passport_series ?? '');
  const [passportNumber, setPassportNumber] = useState(existing?.passport_number ?? '');
  const [passportIssuedAt, setPassportIssuedAt] = useState(existing?.passport_issued_at ?? '');
  const [inn, setInn] = useState(existing?.inn ?? '');
  const [regAddress, setRegAddress] = useState(existing?.registration_address ?? '');
  const [reportId, setReportId] = useState(existing?.report_id ?? '');
  const [startedAt, setStartedAt] = useState(existing?.created_at ?? '');
  const [finishedAt, setFinishedAt] = useState(existing?.finished_at ?? '');
  const [result, setResult] = useState<boolean | undefined>(existing?.result);
  const [rejectionId, setRejectionId] = useState(0);
  const [showRejection, setShowRejection] = useState(false);

  function handleSendRequest() {
    const now = new Date().toISOString().slice(0, 10);
    const mockId = generateMockSpectrumId();
    setReportId(mockId);
    setStartedAt(now);
    const rec = {
      security_check_id: existing?.security_check_id ?? nextId(securityChecks, 'security_check_id'),
      report_id: mockId, created_at: now,
      passport_series: passportSeries, passport_number: passportNumber,
      passport_issued_at: passportIssuedAt, inn, registration_address: regAddress,
      candidate_id: cId,
    };
    if (existing) {
      setSecurityChecks((prev) => prev.map((s) => s.security_check_id === existing.security_check_id ? { ...s, ...rec } : s));
    } else {
      setSecurityChecks((prev) => [...prev, rec]);
    }
  }

  function handleSaveResult() {
    const rec = {
      security_check_id: existing?.security_check_id ?? nextId(securityChecks, 'security_check_id'),
      report_id: reportId, created_at: startedAt || new Date().toISOString().slice(0, 10),
      finished_at: finishedAt, result, passport_series: passportSeries,
      passport_number: passportNumber, passport_issued_at: passportIssuedAt,
      inn, registration_address: regAddress, candidate_id: cId,
    };
    if (existing) {
      setSecurityChecks((prev) => prev.map((s) => s.security_check_id === existing.security_check_id ? { ...s, ...rec } : s));
    } else {
      setSecurityChecks((prev) => [...prev, rec]);
    }
    if (result === true) {
      setCandidates((prev) => prev.map((c) => c.candidate_id === cId ? { ...c, stage_id: 5 } : c));
      navigate(`/candidates/${cId}`);
    } else {
      setShowRejection(true);
    }
  }

  function handleReject() {
    setCandidates((prev) => prev.map((c) => c.candidate_id === cId ? { ...c, rejection_reason_id: rejectionId || 4 } : c));
    navigate(`/candidates/${cId}`);
  }

  if (!candidate) return <p>Кандидат не найден</p>;

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Проверка СБ — {candidate.last_name} {candidate.first_name}</h2>
        <Link to={`/candidates/${cId}`} className={styles.linkBtn}>← Назад</Link>
      </div>
      <div className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>ФИО кандидата</label>
            <div className={styles.readonly}>{candidate.last_name} {candidate.first_name} {candidate.middle_name}</div>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Дата рождения</label>
            <div className={styles.readonly}>{candidate.birth_date ? new Date(candidate.birth_date).toLocaleDateString('ru-RU') : '—'}</div>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Серия паспорта</label>
            <input type="text" className={styles.formInput} value={passportSeries} onChange={(e) => setPassportSeries(e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Номер паспорта</label>
            <input type="text" className={styles.formInput} value={passportNumber} onChange={(e) => setPassportNumber(e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Дата выдачи</label>
            <input type="date" className={styles.formInput} value={passportIssuedAt} onChange={(e) => setPassportIssuedAt(e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>ИНН</label>
            <input type="text" className={styles.formInput} value={inn} onChange={(e) => setInn(e.target.value)} />
          </div>
          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>Адрес регистрации</label>
            <input type="text" className={styles.formInput} value={regAddress} onChange={(e) => setRegAddress(e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>ID отчёта Spectrum</label>
            <div className={styles.readonly}>{reportId || '—'}</div>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Дата начала проверки</label>
            <div className={styles.readonly}>{startedAt || '—'}</div>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Дата завершения</label>
            <input type="date" className={styles.formInput} value={finishedAt} onChange={(e) => setFinishedAt(e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Результат проверки</label>
            <select className={styles.formSelect} value={result === undefined ? '' : result ? 'true' : 'false'} onChange={(e) => setResult(e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined)}>
              <option value="">— Выберите —</option>
              <option value="true">Прошёл</option>
              <option value="false">Не прошёл</option>
            </select>
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
          <button className={styles.btnSecondary} onClick={handleSendRequest}>Отправить запрос в СБ</button>
          <button className={styles.btnPrimary} onClick={handleSaveResult}>Сохранить результат</button>
          {showRejection && (
            <button className={styles.btnDanger} onClick={handleReject}>Зафиксировать отказ</button>
          )}
        </div>
      </div>
    </div>
  );
}

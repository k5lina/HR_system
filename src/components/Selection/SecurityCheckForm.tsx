import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { nextId, generateMockSpectrumId, fmtSecurityCheckId } from '../../utils';
import { downloadMockPdf } from '../../utils/mockPdf';

import styles from '../Requests/Requests.module.css';

export default function SecurityCheckForm() {
  const { candidateId } = useParams();
  const cId = Number(candidateId);
  const navigate = useNavigate();

  const {
    candidates, setCandidates,
    securityChecks, setSecurityChecks,
    medicalChecks, setMedicalChecks,
    jobOffers, setJobOffers,
    contractTypes,
    publications, vacancies, requests,
    departmentPositions, positions,
    rejectionReasons,
    currentUser,
  } = useApp();

  const candidate = candidates.find((c) => c.candidate_id === cId);
  const existing = securityChecks.find((sc) => sc.candidate_id === cId);

  const [passportSeries, setPassportSeries] = useState(existing?.passport_series ?? '');
  const [passportNumber, setPassportNumber] = useState(existing?.passport_number ?? '');
  const [passportIssuedAt, setPassportIssuedAt] = useState(existing?.passport_issued_at ?? '');
  const [regAddress, setRegAddress] = useState(existing?.registration_address ?? '');
  const [reportId, setReportId] = useState<number | undefined>(existing?.report_id);
  const [startedAt, setStartedAt] = useState(existing?.created_at ?? '');
  const [result, setResult] = useState<boolean | undefined>(existing?.result);

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
  const isProduction = linkedPos?.personnel_type_id === 1;

  const candidateName = candidate
    ? `${candidate.last_name} ${candidate.first_name}${candidate.middle_name ? ' ' + candidate.middle_name : ''}`
    : '—';
  const birthDate = candidate?.birth_date
    ? new Date(candidate.birth_date).toLocaleDateString('ru-RU')
    : '—';
  const startedDate = startedAt
    ? new Date(startedAt).toLocaleDateString('ru-RU')
    : '—';
  const resultLabel =
    result === true ? 'Прошёл' : result === false ? 'Не прошёл' : '—';

  const backTo = '/selection?stage=security';

  // ---- helpers ----
  function buildRecord(res?: boolean, finished?: boolean) {
    const now = new Date().toISOString();
    return {
      security_check_id: existing?.security_check_id ?? nextId(securityChecks, 'security_check_id'),
      report_id: reportId || undefined,
      created_at: startedAt || now,
      finished_at: finished ? now : existing?.finished_at,
      passport_series: passportSeries || undefined,
      passport_number: passportNumber || undefined,
      passport_issued_at: passportIssuedAt || undefined,
      registration_address: regAddress || undefined,
      result: res,
      candidate_id: cId,
    };
  }

  function persist(rec: ReturnType<typeof buildRecord>) {
    if (existing) {
      setSecurityChecks((prev) =>
        prev.map((s) => s.security_check_id === existing.security_check_id ? { ...s, ...rec } : s),
      );
    } else {
      setSecurityChecks((prev) => [...prev, rec]);
    }
  }

  function handleSave() {
    persist(buildRecord(result, false));
  }

  function handleSendRequest() {
    const mockId = generateMockSpectrumId();
    const now = new Date().toISOString();
    setReportId(mockId);
    setStartedAt(now);
    persist({ ...buildRecord(result, false), report_id: mockId, created_at: now });
  }

  // Демо-имитация ответа Spectrum: если запрос отправлен (есть report_id),
  // но результат ещё не получен — через несколько секунд проставляем
  // положительный результат. Виден после обновления страницы.
  useEffect(() => {
    if (existing?.report_id && existing.result === undefined) {
      const timer = setTimeout(() => {
        setResult(true);
        setSecurityChecks((prev) =>
          prev.map((s) =>
            s.security_check_id === existing.security_check_id
              ? { ...s, result: true, finished_at: new Date().toISOString() }
              : s,
          ),
        );
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [existing?.report_id, existing?.result, existing?.security_check_id, setSecurityChecks]);

  function handleDownloadConclusion() {
    downloadMockPdf(
      `Zaklyuchenie_SB_${reportId ?? cId}`,
      [
        'Security Check Conclusion',
        '',
        `Report ID (Spectrum): ${reportId ?? '-'}`,
        `Candidate ID: ${cId}`,
        `Date: ${startedDate}`,
        `Result: ${result === true ? 'PASSED' : result === false ? 'FAILED' : 'IN PROGRESS'}`,
        '',
        'This is a demo document generated by the HR System.',
      ],
    );
  }


  function handleApprove() {
    persist(buildRecord(true, true));
    const now = new Date().toISOString();
    if (isProduction) {
      // Auto-create medical check if not yet exists
      setMedicalChecks((prev) => {
        if (prev.some((m) => m.candidate_id === cId)) return prev;
        return [
          ...prev,
          {
            medical_check_id: nextId(prev, 'medical_check_id'),
            created_at: now.slice(0, 10),
            candidate_id: cId,
            medical_check_status_id: 1,
          },
        ];
      });
      setCandidates((prev) =>
        prev.map((c) => c.candidate_id === cId ? { ...c, stage_id: 5 } : c),
      );
    } else {
      // Skip medical check — auto-create job offer directly
      setJobOffers((prev) => {
        if (prev.some((o) => o.candidate_id === cId)) return prev;
        return [
          ...prev,
          {
            offer_id: nextId(prev, 'offer_id'),
            created_at: now,
            proposed_salary: 0,
            start_date: '',
            candidate_id: cId,
            contract_type_id: contractTypes[0]?.contract_type_id ?? 1,
            offer_status_id: 1,
          },
        ];
      });
      setCandidates((prev) =>
        prev.map((c) => c.candidate_id === cId ? { ...c, stage_id: 6 } : c),
      );
    }
    navigate(backTo);
  }

  function handleRejectConfirm() {
    persist(buildRecord(false, true));
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
          Проверка в Службе безопасности{existing ? ` №${fmtSecurityCheckId(existing.security_check_id, existing.created_at)}` : ''}
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

      {/* Two-column body */}
      <div className={styles.twoColLayout}>

        {/* LEFT column */}
        <div>
          {/* Auto fields */}
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

          {/* Additional data section */}
          <div className={styles.subSectionLabel}>Дополнительные данные</div>

          <div className={styles.formFieldRow}>
            <label className={styles.formFieldRowLabel}>Серия и номер паспорта</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                className={styles.formFieldRowInput}
                placeholder="Серия"
                value={passportSeries}
                onChange={(e) => setPassportSeries(e.target.value)}
              />
              <input
                className={styles.formFieldRowInput}
                placeholder="Номер паспорта"
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formFieldRow}>
            <label className={styles.formFieldRowLabel}>Дата выдачи паспорта</label>
            <input
              type="date"
              className={styles.formFieldRowDate}
              value={passportIssuedAt}
              onChange={(e) => setPassportIssuedAt(e.target.value)}
              style={{ flex: 'none', width: 200 }}
            />
          </div>

          <div className={styles.formFieldRow}>
            <label className={styles.formFieldRowLabel}>Адрес регистрации</label>
            <input
              className={styles.formFieldRowInput}
              placeholder="Адрес регистрации"
              value={regAddress}
              onChange={(e) => setRegAddress(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <button className={styles.btnSave} onClick={handleSendRequest}>
              Отправить запрос
            </button>
          </div>
        </div>

        {/* RIGHT column */}
        <div>
          {/* Auto fields */}
          <div className={styles.autoFields}>
            <div className={styles.autoRow}>
              <span className={styles.autoLabel}>ФИО кандидата</span>
              <span className={styles.autoValue}>{candidateName}</span>
            </div>
            <div className={styles.autoRow}>
              <span className={styles.autoLabel}>Дата рождения</span>
              <span className={styles.autoValue}>{birthDate}</span>
            </div>
            <div className={styles.autoRow}>
              <span className={styles.autoLabel}>ID отчёта Spectrum</span>
              <span className={styles.autoValue}>{reportId || '—'}</span>
            </div>
            <div className={styles.autoRow}>
              <span className={styles.autoLabel}>Результат проверки</span>
              <span className={styles.autoValue}>{resultLabel}</span>
            </div>
          </div>

          {/* Download conclusion */}
          <div style={{ marginTop: '1rem' }}>
            <button className={styles.iconLinkBtn} onClick={handleDownloadConclusion}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M10 3v10M6 9l4 4 4-4M4 17h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Скачать заключение
            </button>
          </div>
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

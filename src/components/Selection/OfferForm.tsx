import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { nextId } from '../../utils';
import styles from '../Requests/Requests.module.css';

export default function OfferForm() {
  const { candidateId } = useParams();
  const cId = Number(candidateId);
  const navigate = useNavigate();
  const { candidates, setCandidates, jobOffers, setJobOffers, offerStatuses, contractTypes, publications, vacancies } = useApp();

  const candidate = candidates.find((c) => c.candidate_id === cId);
  const existing = jobOffers.find((o) => o.candidate_id === cId);
  const pub = candidate ? publications.find((p) => p.publication_id === candidate.publication_id) : null;
  const vacancy = pub ? vacancies.find((v) => v.vacancy_id === pub.vacancy_id) : null;

  const [proposedSalary, setProposedSalary] = useState(existing?.proposed_salary ?? '');
  const [startDate, setStartDate] = useState(existing?.start_date ?? '');
  const [contractTypeId, setContractTypeId] = useState(existing?.contract_type_id ?? 2);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [statusId, setStatusId] = useState(existing?.offer_status_id ?? 1);

  function saveOffer(newStatusId: number) {
    const now = new Date().toISOString();
    const rec = {
      offer_id: existing?.offer_id ?? nextId(jobOffers, 'offer_id'),
      created_at: existing?.created_at ?? now,
      proposed_salary: Number(proposedSalary),
      start_date: startDate,
      notes,
      candidate_id: cId,
      contract_type_id: contractTypeId,
      offer_status_id: newStatusId,
    };
    if (existing) {
      setJobOffers((prev) => prev.map((o) => o.offer_id === existing.offer_id ? { ...o, ...rec } : o));
    } else {
      setJobOffers((prev) => [...prev, rec]);
    }
    setStatusId(newStatusId);
  }

  function handleAccepted() {
    saveOffer(2);
    setCandidates((prev) => prev.map((c) => c.candidate_id === cId ? { ...c, stage_id: 6 } : c));
  }

  function handleDeclined() {
    saveOffer(3);
  }

  if (!candidate) return <p>Кандидат не найден</p>;

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Предложение о трудоустройстве — {candidate.last_name} {candidate.first_name}</h2>
        <Link to={`/candidates/${cId}`} className={styles.linkBtn}>← Назад</Link>
      </div>
      <div className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>ФИО кандидата</label>
            <div className={styles.readonly}>{candidate.last_name} {candidate.first_name} {candidate.middle_name}</div>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Вакансия</label>
            <div className={styles.readonly}>{vacancy?.title ?? '—'}</div>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Предлагаемая зарплата</label>
            <input type="number" className={styles.formInput} value={proposedSalary} onChange={(e) => setProposedSalary(e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Дата выхода на работу</label>
            <input type="date" className={styles.formInput} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Тип трудового договора</label>
            <select className={styles.formSelect} value={contractTypeId} onChange={(e) => setContractTypeId(Number(e.target.value))}>
              {contractTypes.map((ct) => (
                <option key={ct.contract_type_id} value={ct.contract_type_id}>{ct.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Статус предложения</label>
            <select className={styles.formSelect} value={statusId} onChange={(e) => setStatusId(Number(e.target.value))}>
              {offerStatuses.map((s) => (
                <option key={s.offer_status_id} value={s.offer_status_id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>График работы</label>
            <div className={styles.readonly}>{vacancy?.work_schedule ?? '—'}</div>
          </div>
          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>Обязанности</label>
            <div className={styles.readonly}>{vacancy?.responsibilities ?? '—'}</div>
          </div>
          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>Условия работы</label>
            <div className={styles.readonly}>{vacancy?.work_conditions ?? '—'}</div>
          </div>
          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>Заметки по обсуждению</label>
            <textarea className={styles.formTextarea} value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </div>
        <div className={styles.formActions}>
          <button className={styles.btnPrimary} onClick={() => saveOffer(statusId)}>Сформировать предложение</button>
          <button className={styles.btnSuccess} onClick={handleAccepted}>Принято кандидатом</button>
          <button className={styles.btnDanger} onClick={handleDeclined}>Отклонено кандидатом</button>
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import styles from '../Requests/Requests.module.css';

const PAGE_SIZE = 10;

export default function PublishedVacancyCard() {
  const { id } = useParams();
  const vacancyId = Number(id);

  const {
    publications, vacancies, candidates, setCandidates,
    requests, departmentPositions, positions,
    searchChannels, resumeAnalyses, interviews, securityChecks,
    medicalChecks, jobOffers, resumeAnalysisStatuses,
    interviewStatuses, medicalCheckStatuses, offerStatuses,
  } = useApp();

  const [selectedStage, setSelectedStage] = useState(1);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const vacancy = vacancies.find((v) => v.vacancy_id === vacancyId);

  // Collect all active publication IDs for this vacancy
  const vacancyPubs = publications.filter((p) => p.vacancy_id === vacancyId && p.is_active);
  const pubIdSet = new Set(vacancyPubs.map((p) => p.publication_id));

  // Determine position info for title and medical stage check
  const linkedRequest = vacancy ? requests.find((r) => r.request_id === vacancy.request_id) : null;
  const dp = linkedRequest
    ? departmentPositions.find((d) => d.department_position_id === linkedRequest.department_position_id)
    : null;
  const linkedPos = dp ? positions.find((p) => p.position_id === dp.position_id) : null;
  // personnel_type_id === 1 means "Производственный"
  const isProduction = linkedPos?.personnel_type_id === 1;

  const vacancyTitle = vacancy?.title || linkedPos?.name || 'Вакансия';

  const stages = [
    { stage_id: 1, name: 'Новые' },
    { stage_id: 2, name: 'Телефонное интервью' },
    { stage_id: 3, name: 'Собеседование с руководителем' },
    { stage_id: 4, name: 'Проверка в СБ' },
    ...(isProduction ? [{ stage_id: 5, name: 'Медицинская проверка' }] : []),
    { stage_id: 6, name: 'Оффер' },
  ];

  // All candidates from all publications of this vacancy
  const vacancyCandidates = candidates.filter((c) => pubIdSet.has(c.publication_id));

  function getChannelName(publicationId: number) {
    const pub = publications.find((p) => p.publication_id === publicationId);
    if (!pub) return '—';
    return searchChannels.find((ch) => ch.channel_id === pub.channel_id)?.name ?? '—';
  }

  function getCandidateStatus(candidateId: number, stageId: number): string {
    switch (stageId) {
      case 1: {
        const analysis = resumeAnalyses.find((a) => a.candidate_id === candidateId);
        if (!analysis || analysis.score === undefined) return '—';
        const st = resumeAnalysisStatuses.find(
          (s) => analysis.score! >= s.min_score && analysis.score! <= s.max_score,
        );
        return st?.name ?? '—';
      }
      case 2:
      case 3: {
        const interview = interviews.find(
          (i) => i.candidate_id === candidateId && i.stage_id === stageId,
        );
        if (!interview) return '—';
        return interviewStatuses.find((s) => s.interview_status_id === interview.interview_status_id)?.name ?? '—';
      }
      case 4: {
        const check = securityChecks.find((c) => c.candidate_id === candidateId);
        if (!check) return '—';
        if (check.result === true) return 'Проверка пройдена';
        if (check.result === false) return 'Не пройдена';
        return 'В процессе';
      }
      case 5: {
        const check = medicalChecks.find((c) => c.candidate_id === candidateId);
        if (!check) return '—';
        return medicalCheckStatuses.find((s) => s.medical_check_status_id === check.medical_check_status_id)?.name ?? '—';
      }
      case 6: {
        const offer = jobOffers.find((o) => o.candidate_id === candidateId);
        if (!offer) return '—';
        return offerStatuses.find((s) => s.offer_status_id === offer.offer_status_id)?.name ?? '—';
      }
      default:
        return '—';
    }
  }

  const stageCandidates = useMemo(
    () => vacancyCandidates.filter((c) => c.stage_id === selectedStage),
    [vacancyCandidates, selectedStage],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return stageCandidates;
    return stageCandidates.filter(
      (c) =>
        `${c.last_name} ${c.first_name}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q),
    );
  }, [stageCandidates, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleDeleteCandidate(candidateId: number) {
    if (window.confirm('Вы уверены, что хотите удалить этого кандидата?')) {
      setCandidates((prev) => prev.filter((c) => c.candidate_id !== candidateId));
    }
  }

  function handleStageChange(stageId: number) {
    setSelectedStage(stageId);
    setPage(1);
    setSearch('');
  }

  function renderPagination() {
    if (totalPages <= 1) return null;
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3);
      if (page > 4) pages.push('...');
      if (page > 3 && page < totalPages - 2) pages.push(page);
      pages.push('...');
      pages.push(totalPages - 1, totalPages);
    }
    return (
      <div className={styles.pagination}>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`d${i}`} className={styles.pageDots}>…</span>
          ) : (
            <button
              key={p}
              className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
              onClick={() => setPage(p as number)}
            >
              {p}
            </button>
          ),
        )}
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <Link to="/home" className={styles.backBtn}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: '0.5rem' }}>
            <path d="M19 12H5M12 19L5 12l7-7" />
          </svg>
        </Link>
        <h2 className={styles.title}>{vacancyTitle}</h2>
      </div>

      {/* Stage tabs */}
      <div className={styles.stageTabs}>
        {stages.map((stage) => (
          <button
            key={stage.stage_id}
            className={`${styles.stageTab} ${selectedStage === stage.stage_id ? styles.stageTabActive : ''}`}
            onClick={() => handleStageChange(stage.stage_id)}
          >
            {stage.name}
          </button>
        ))}
      </div>

      {/* Candidates table header */}
      <div className={styles.topActions}>
        <h3 className={styles.subTitle}>Кандидаты</h3>
        <div className={styles.searchBox}>
          <input
            className={styles.searchInput}
            placeholder="Поиск"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button style={{ border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => { setSearch(''); setPage(1); }}>
              ×
            </button>
          )}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>№</th>
              <th>ФИО</th>
              <th>Канал поиска</th>
              <th>Почта</th>
              <th>Телефон</th>
              <th>Статус</th>
              <th style={{ width: '70px' }}></th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((c, idx) => (
              <tr key={c.candidate_id}>
                <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                <td>{c.last_name} {c.first_name}{c.middle_name ? ' ' + c.middle_name : ''}</td>
                <td>{getChannelName(c.publication_id)}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{getCandidateStatus(c.candidate_id, selectedStage)}</td>
                <td>
                  <div className={styles.actionCell}>
                    <Link to={`/candidates/${c.candidate_id}`} className={styles.actionIcon} title="Открыть">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8l4 4-4 4M8 12h8" />
                      </svg>
                    </Link>
                    <button
                      className={styles.actionIcon}
                      title="Удалить"
                      onClick={() => handleDeleteCandidate(c.candidate_id)}
                    >
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={7} className={styles.empty}>Кандидатов нет</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {renderPagination()}
    </div>
  );
}

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
  const [channelFilter, setChannelFilter] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

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

  function getStatusPriority(candidateId: number, stageId: number): number {
    const s = getCandidateStatus(candidateId, stageId).toLowerCase();
    if (s.includes('отличный')) return 1;
    if (s.includes('хороший')) return 2;
    if (s.includes('частично')) return 3;
    if (s.includes('успешн') || s.includes('пройден') || s.includes('принят')) return 2;
    if (s.includes('в процессе') || s.includes('ожидает') || s.includes('запланирован')) return 1;
    if (s.includes('требует')) return 4;
    if (s.includes('не подход') || s.includes('не пройден') || s.includes('отменен') || s.includes('отклон') || s === 'не подходит') return 5;
    return 3;
  }

  function getStatusClass(status: string): string {
    const s = status.toLowerCase();
    if (s.includes('отличный')) return styles.statusExcellent;
    if (s.includes('хороший')) return styles.statusGood;
    if (s.includes('частично')) return styles.statusPartial;
    if (s.includes('требует')) return styles.statusManual;
    if (s === 'не подходит') return styles.statusNotFit;
    if (s.includes('успешн') || s.includes('пройден') || s.includes('принят')) return styles.statusDone;
    if (s.includes('не подход') || s.includes('не пройден') || s.includes('отменен') || s.includes('отклон')) return styles.statusRejected;
    if (s.includes('в процессе') || s.includes('ожидает') || s.includes('запланирован')) return styles.statusWork;
    return styles.statusNew;
  }

  function getCandidateStatus(candidateId: number, stageId: number): string {
    switch (stageId) {
      case 1: {
        const analysis = resumeAnalyses.find((a) => a.candidate_id === candidateId);
        if (!analysis) return '—';
        return resumeAnalysisStatuses.find(
          (s) => s.analysis_status_id === analysis.analysis_status_id,
        )?.name ?? '—';
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

  // Available channels for this vacancy's publications
  const availableChannels = useMemo(() => {
    return vacancyPubs
      .map((p) => ({ id: p.channel_id, name: searchChannels.find((ch) => ch.channel_id === p.channel_id)?.name ?? '—' }))
      .filter((ch, i, arr) => arr.findIndex((x) => x.id === ch.id) === i)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [vacancyPubs, searchChannels]);

  // Available statuses for current stage
  const availableStatuses = useMemo(() => {
    const s = new Set(
      stageCandidates
        .map((c) => getCandidateStatus(c.candidate_id, selectedStage))
        .filter((st) => st !== '—'),
    );
    return [...s].sort();
  }, [stageCandidates, selectedStage, resumeAnalyses, interviews, securityChecks, medicalChecks, jobOffers]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...stageCandidates]
      .filter((c) => {
        if (channelFilter) {
          const pub = publications.find((p) => p.publication_id === c.publication_id);
          if (!pub || pub.channel_id !== channelFilter) return false;
        }
        if (statusFilter) {
          if (getCandidateStatus(c.candidate_id, selectedStage) !== statusFilter) return false;
        }
        if (!q) return true;
        return (
          `${c.last_name} ${c.first_name}`.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
        );
      })
      .sort(
        (a, b) =>
          getStatusPriority(a.candidate_id, selectedStage) -
          getStatusPriority(b.candidate_id, selectedStage) ||
          b.candidate_id - a.candidate_id,
      );
  }, [stageCandidates, search, channelFilter, statusFilter, selectedStage, publications]);

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
    setChannelFilter(0);
    setStatusFilter('');
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
        <div>
          <span className={styles.pageLabel}>Опубликованная вакансия</span>
          <h2 className={styles.title}>{vacancyTitle}</h2>
        </div>
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
        <div className={styles.topActionsRight}>
          {availableChannels.length > 1 && (
            <select
              className={styles.filterSelect}
              value={channelFilter}
              onChange={(e) => { setChannelFilter(Number(e.target.value)); setPage(1); }}
            >
              <option value={0}>Все каналы</option>
              {availableChannels.map((ch) => (
                <option key={ch.id} value={ch.id}>{ch.name}</option>
              ))}
            </select>
          )}
          {availableStatuses.length > 1 && (
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">Все статусы</option>
              {availableStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
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
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>№</th>
              <th>ID кандидата</th>
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
                <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                  {c.candidate_id}
                </td>
                <td>{c.last_name} {c.first_name}{c.middle_name ? ' ' + c.middle_name : ''}</td>
                <td>{getChannelName(c.publication_id)}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>
                  {(() => {
                    const st = getCandidateStatus(c.candidate_id, selectedStage);
                    return st === '—'
                      ? '—'
                      : <span className={`${styles.badge} ${getStatusClass(st)}`}>{st}</span>;
                  })()}
                </td>
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
                <td colSpan={8} className={styles.empty}>Кандидатов нет</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {renderPagination()}
    </div>
  );
}

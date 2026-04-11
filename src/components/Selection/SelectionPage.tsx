import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  fmtInterviewId, fmtAnalysisId,
  fmtSecurityCheckId, fmtMedicalCheckId, fmtOfferId,
} from '../../utils';
import styles from '../Requests/Requests.module.css';

const PAGE_SIZE = 10;

type StageKind = 'new' | 'phone' | 'main' | 'security' | 'medical' | 'offer' | 'suitable';

interface StageDef {
  kind: StageKind;
  label: string;
}

interface DocRow {
  id: number;
  candidateId: number;
  date: string;
  status: string;
  openRoute: string;
  canDelete: boolean;
  displayId: string;
}

export default function SelectionPage() {
  const {
    currentUser,
    candidates, setCandidates,
    publications, vacancies, requests,
    departmentPositions, departments, positions,
    interviews, setInterviews,
    securityChecks, setSecurityChecks,
    medicalChecks, setMedicalChecks,
    jobOffers, setJobOffers,
    interviewStatuses, medicalCheckStatuses, offerStatuses,
    resumeAnalyses, resumeAnalysisStatuses,
  } = useApp();

  const roleId = currentUser?.role_id ?? 2;
  const userId = currentUser?.user_id;

  // Stages visible per role
  const stages: StageDef[] = useMemo(() => {
    if (roleId === 3) {
      return [
        { kind: 'main', label: 'Собеседования с руководителем' },
        { kind: 'suitable', label: 'Подходящие кандидаты' },
      ];
    }
    return [
      { kind: 'phone', label: 'Телефонные интервью' },
      { kind: 'main', label: 'Собеседования с руководителем' },
      { kind: 'security', label: 'Проверки в СБ' },
      { kind: 'medical', label: 'Медицинские проверки' },
      { kind: 'offer', label: 'Предложения о трудоустройстве' },
    ];
  }, [roleId]);

  const [searchParams, setSearchParams] = useSearchParams();
  const stageParam = searchParams.get('stage') as StageKind | null;
  const [activeStage, setActiveStage] = useState<StageKind>(
    stageParam && stages.some((s) => s.kind === stageParam) ? stageParam : stages[0].kind,
  );
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [posFilter, setPosFilter] = useState(0); // for 'suitable' tab
  const [dateSortDir, setDateSortDir] = useState<'desc' | 'asc'>('desc');

  // Resolve candidate meta: name, dept, pos (and posId for filtering)
  function getCandidateMeta(candidateId: number) {
    const c = candidates.find((x) => x.candidate_id === candidateId);
    if (!c) return { name: '—', dept: '—', pos: '—', posId: 0 };
    const pub = publications.find((p) => p.publication_id === c.publication_id);
    const vac = pub ? vacancies.find((v) => v.vacancy_id === pub.vacancy_id) : null;
    const req = vac ? requests.find((r) => r.request_id === vac.request_id) : null;
    const dp = req
      ? departmentPositions.find((d) => d.department_position_id === req.department_position_id)
      : null;
    const dept = dp ? departments.find((d) => d.department_id === dp.department_id)?.name ?? '—' : '—';
    const posObj = dp ? positions.find((p) => p.position_id === dp.position_id) : null;
    const pos = posObj?.name ?? '—';
    const name = `${c.last_name} ${c.first_name}${c.middle_name ? ' ' + c.middle_name : ''}`;
    return { name, dept, pos, posId: posObj?.position_id ?? 0 };
  }

  // Head's departments (by position_id match)
  const headDeptIds = useMemo(() => {
    if (roleId !== 3 || !currentUser) return new Set<number>();
    return new Set(
      departmentPositions
        .filter((dp) => dp.position_id === currentUser.position_id)
        .map((dp) => dp.department_id),
    );
  }, [roleId, currentUser, departmentPositions]);

  // Publication IDs belonging to head's departments
  const headPubIds = useMemo(() => {
    if (roleId !== 3) return new Set<number>();
    const deptReqIds = requests
      .filter((r) => {
        const dp = departmentPositions.find(
          (d) => d.department_position_id === r.department_position_id,
        );
        return dp && headDeptIds.has(dp.department_id);
      })
      .map((r) => r.request_id);
    const vacIds = vacancies
      .filter((v) => deptReqIds.includes(v.request_id))
      .map((v) => v.vacancy_id);
    return new Set(
      publications.filter((p) => vacIds.includes(p.vacancy_id)).map((p) => p.publication_id),
    );
  }, [roleId, requests, departmentPositions, headDeptIds, vacancies, publications]);

  // Positions in head's departments (for filter dropdown in 'suitable' tab)
  const headPositions = useMemo(() => {
    if (roleId !== 3) return [];
    const posIds = new Set(
      departmentPositions
        .filter((dp) => headDeptIds.has(dp.department_id))
        .map((dp) => dp.position_id),
    );
    return positions.filter((p) => posIds.has(p.position_id));
  }, [roleId, departmentPositions, headDeptIds, positions]);

  // Build rows for current stage
  const rows = useMemo((): DocRow[] => {
    switch (activeStage) {
      case 'new': {
        const list = candidates.filter((c) => c.stage_id === 1);
        return list.map((c) => {
          const analysis = resumeAnalyses.find((a) => a.candidate_id === c.candidate_id);
          const statusName = analysis
            ? (resumeAnalysisStatuses.find((s) => s.analysis_status_id === analysis.analysis_status_id)?.name ?? '—')
            : 'Анализ не начат';
          return {
            id: c.candidate_id,
            candidateId: c.candidate_id,
            date: analysis?.started_at ?? '',
            status: statusName,
            openRoute: `/candidates/${c.candidate_id}`,
            canDelete: false,
            displayId: analysis ? fmtAnalysisId(analysis.analysis_id, analysis.started_at) : '—',
          };
        });
      }
      case 'phone': {
        const list = interviews.filter(
          (i) => i.stage_id === 2 && (roleId === 1 || i.user_id === userId),
        );
        return list.map((i) => ({
          id: i.interview_id,
          candidateId: i.candidate_id,
          date: i.scheduled_at,
          status: interviewStatuses.find((s) => s.interview_status_id === i.interview_status_id)?.name ?? '—',
          openRoute: `/selection/${i.candidate_id}/phone-interview`,
          canDelete: true,
          displayId: fmtInterviewId(i.interview_id, i.scheduled_at, 2),
        }));
      }
      case 'main': {
        const list = interviews.filter(
          (i) => i.stage_id === 3 && (roleId !== 3 || i.user_id === userId),
        );
        return list.map((i) => ({
          id: i.interview_id,
          candidateId: i.candidate_id,
          date: i.scheduled_at,
          status: interviewStatuses.find((s) => s.interview_status_id === i.interview_status_id)?.name ?? '—',
          openRoute: `/selection/${i.candidate_id}/main-interview`,
          canDelete: true,
          displayId: fmtInterviewId(i.interview_id, i.scheduled_at, 3),
        }));
      }
      case 'security': {
        return securityChecks.map((s) => ({
          id: s.security_check_id,
          candidateId: s.candidate_id,
          date: s.created_at,
          status: s.result === true ? 'Проверка пройдена' : s.result === false ? 'Не пройдена' : 'В процессе',
          openRoute: `/selection/${s.candidate_id}/security-check`,
          canDelete: true,
          displayId: fmtSecurityCheckId(s.security_check_id, s.created_at),
        }));
      }
      case 'medical': {
        return medicalChecks.map((m) => ({
          id: m.medical_check_id,
          candidateId: m.candidate_id,
          date: m.created_at,
          status: medicalCheckStatuses.find((s) => s.medical_check_status_id === m.medical_check_status_id)?.name ?? '—',
          openRoute: `/selection/${m.candidate_id}/medical-check`,
          canDelete: true,
          displayId: fmtMedicalCheckId(m.medical_check_id, m.created_at),
        }));
      }
      case 'offer': {
        return jobOffers.map((o) => ({
          id: o.offer_id,
          candidateId: o.candidate_id,
          date: o.created_at,
          status: offerStatuses.find((s) => s.offer_status_id === o.offer_status_id)?.name ?? '—',
          openRoute: `/selection/${o.candidate_id}/offer`,
          canDelete: true,
          displayId: fmtOfferId(o.offer_id, o.created_at),
        }));
      }
      case 'suitable': {
        const list = candidates.filter(
          (c) => c.stage_id === 3 && headPubIds.has(c.publication_id),
        );
        return list.map((c) => ({
          id: c.candidate_id,
          candidateId: c.candidate_id,
          date: '',
          status: '—',
          openRoute: `/selection/${c.candidate_id}/main-interview`,
          canDelete: false,
          displayId: '—',
        }));
      }
      default:
        return [];
    }
  }, [
    activeStage, interviews, securityChecks, medicalChecks, jobOffers, candidates,
    interviewStatuses, medicalCheckStatuses, offerStatuses,
    resumeAnalyses, resumeAnalysisStatuses,
    roleId, userId, headPubIds,
  ]);

  const showDateCol = activeStage !== 'suitable' && activeStage !== 'new';

  // Apply search + posFilter + sort
  const filtered = useMemo(() => {
    let result = rows;
    if (activeStage === 'suitable' && posFilter) {
      result = result.filter((row) => getCandidateMeta(row.candidateId).posId === posFilter);
    }
    const q = search.toLowerCase();
    if (q) {
      result = result.filter((row) => {
        const m = getCandidateMeta(row.candidateId);
        return (
          m.name.toLowerCase().includes(q) ||
          m.dept.toLowerCase().includes(q) ||
          m.pos.toLowerCase().includes(q)
        );
      });
    }
    // Sort: by date if date column visible, then by status priority, then by id
    return [...result].sort((a, b) => {
      if (showDateCol && a.date && b.date) {
        const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (diff !== 0) return dateSortDir === 'desc' ? diff : -diff;
      }
      return getStatusPriority(a.status) - getStatusPriority(b.status) || b.id - a.id;
    });
  }, [rows, search, posFilter, activeStage, dateSortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleStageChange(kind: StageKind) {
    setActiveStage(kind);
    setSearchParams({ stage: kind }, { replace: true });
    setPage(1);
    setSearch('');
    setPosFilter(0);
    setDateSortDir('desc');
  }

  function handleDelete(row: DocRow) {
    if (!window.confirm('Удалить запись?')) return;
    switch (activeStage) {
      case 'phone':
      case 'main':
        setInterviews((prev) => prev.filter((i) => i.interview_id !== row.id));
        break;
      case 'security':
        setSecurityChecks((prev) => prev.filter((s) => s.security_check_id !== row.id));
        break;
      case 'medical':
        setMedicalChecks((prev) => prev.filter((m) => m.medical_check_id !== row.id));
        break;
      case 'offer':
        setJobOffers((prev) => prev.filter((o) => o.offer_id !== row.id));
        break;
    }
  }

  function getStatusClass(status: string) {
    const s = status.toLowerCase();
    // Resume analysis statuses (colorful)
    if (s.includes('отличный')) return styles.statusExcellent;
    if (s.includes('хороший')) return styles.statusGood;
    if (s.includes('частично')) return styles.statusPartial;
    if (s.includes('требует')) return styles.statusManual;
    if (s === 'не подходит') return styles.statusNotFit;
    // General statuses
    if (s.includes('успешн') || s.includes('пройден') || s.includes('принят')) return styles.statusDone;
    if (
      s.includes('не подход') || s.includes('не пройден') || s.includes('отменен') ||
      s.includes('отклон') || s.includes('некорректн')
    ) return styles.statusRejected;
    if (s.includes('в процессе') || s.includes('ожидает') || s.includes('в работе') || s.includes('запланирован'))
      return styles.statusWork;
    return styles.statusNew;
  }

  // Status sort priority (lower = shown first)
  function getStatusPriority(status: string): number {
    const s = status.toLowerCase();
    // Active states
    if (s.includes('в процессе') || s.includes('ожидает') || s.includes('в работе') || s.includes('запланирован')) return 1;
    // Best analysis results
    if (s.includes('отличный')) return 2;
    if (s.includes('хороший')) return 3;
    // General success
    if (s.includes('успешн') || s.includes('пройден') || s.includes('принят')) return 2;
    // Partial fit
    if (s.includes('частично')) return 4;
    // Requires manual review
    if (s.includes('требует')) return 5;
    // Rejection
    if (
      s.includes('не подход') || s.includes('не пройден') || s.includes('отменен') ||
      s.includes('отклон') || s.includes('некорректн') || s === 'не подходит'
    ) return 6;
    return 1;
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

  const colSpan = showDateCol ? 8 : 7;

  return (
    <div className={styles.section}>
      {/* Stage tabs */}
      <div className={styles.stageTabs}>
        {stages.map((stage) => (
          <button
            key={stage.kind}
            className={`${styles.stageTab} ${activeStage === stage.kind ? styles.stageTabActive : ''}`}
            onClick={() => handleStageChange(stage.kind)}
          >
            {stage.label}
          </button>
        ))}
      </div>

      {/* Position filter for head's 'suitable' tab */}
      {activeStage === 'suitable' && headPositions.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <select
            className={styles.fieldRowSelect}
            style={{ width: '220px' }}
            value={posFilter}
            onChange={(e) => { setPosFilter(Number(e.target.value)); setPage(1); }}
          >
            <option value={0}>Должность</option>
            {headPositions.map((p) => (
              <option key={p.position_id} value={p.position_id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

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



      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>№</th>
              <th>ID</th>
              <th>ФИО кандидата</th>
              <th>Отдел</th>
              <th>Должность</th>
              {showDateCol && (
                <th
                  className={`${styles.thSortable} ${styles.thSortActive}`}
                  onClick={() => { setDateSortDir((d) => d === 'desc' ? 'asc' : 'desc'); setPage(1); }}
                >
                  Дата и время начала
                  <span className={styles.thSortIcon}>{dateSortDir === 'desc' ? '▼' : '▲'}</span>
                </th>
              )}
              <th>Статус</th>
              <th style={{ width: '70px' }}></th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((row, idx) => {
              const m = getCandidateMeta(row.candidateId);
              return (
                <tr key={`${activeStage}-${row.id}`}>
                  <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                    {row.displayId}
                  </td>
                  <td>{m.name}</td>
                  <td>{m.dept}</td>
                  <td>{m.pos}</td>
                  {showDateCol && (
                    <td>
                      {row.date
                        ? new Date(row.date).toLocaleString('ru-RU', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })
                        : '—'}
                    </td>
                  )}
                  <td>
                    {row.status !== '—' ? (
                      <span className={`${styles.badge} ${getStatusClass(row.status)}`}>
                        {row.status}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <div className={styles.actionCell}>
                      <Link to={row.openRoute} className={styles.actionIcon} title="Открыть">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M14.121 4.379a3 3 0 00-4.242 0L3 11.243v4.242h4.242l6.879-6.879a3 3 0 000-4.243zM10.5 7.5l2.25 2.25" />
                        </svg>
                      </Link>
                      {row.canDelete && (
                        <button
                          className={styles.actionIcon}
                          title="Удалить"
                          onClick={() => handleDelete(row)}
                        >
                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={colSpan} className={styles.empty}>
                  Записей нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {renderPagination()}
    </div>
  );
}

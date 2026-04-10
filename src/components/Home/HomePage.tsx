import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import styles from './Home.module.css';

const PAGE_SIZE = 10;

export default function HomePage() {
  const {
    currentUser, requests, vacancies, publications,
    interviews, candidates, departments, positions,
    departmentPositions, vacancyStatuses, searchChannels,
  } = useApp();

  const roleId = currentUser?.role_id ?? 2;
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const activePubs = publications.filter((p) => p.is_active);

  // Aggregate: one row per vacancy (group all channels into one)
  const activeVacancies = useMemo(() => {
    const seen = new Set<number>();
    const rows: typeof vacancies[number][] = [];
    activePubs.forEach((p) => {
      if (!seen.has(p.vacancy_id)) {
        seen.add(p.vacancy_id);
        const vac = vacancies.find((v) => v.vacancy_id === p.vacancy_id);
        if (vac) rows.push(vac);
      }
    });
    return rows;
  }, [activePubs, vacancies]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return activeVacancies;
    return activeVacancies.filter((vac) => {
      const req = requests.find((r) => r.request_id === vac.request_id);
      const dp  = req ? departmentPositions.find((d) => d.department_position_id === req.department_position_id) : null;
      const dept = dp ? departments.find((d) => d.department_id === dp.department_id)?.name ?? '' : '';
      const pos  = dp ? positions.find((p) => p.position_id === dp.position_id)?.name ?? '' : '';
      return dept.toLowerCase().includes(q) || pos.toLowerCase().includes(q) || vac.title.toLowerCase().includes(q);
    });
  }, [activeVacancies, search, requests, departmentPositions, departments, positions]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function getVacancyInfo(vacancyId: number) {
    const vac = vacancies.find((v) => v.vacancy_id === vacancyId);
    const req = vac ? requests.find((r) => r.request_id === vac.request_id) : null;
    const dp  = req ? departmentPositions.find((d) => d.department_position_id === req.department_position_id) : null;
    const dept = dp ? departments.find((d) => d.department_id === dp.department_id)?.name ?? '—' : '—';
    const pos  = dp ? positions.find((p) => p.position_id === dp.position_id)?.name ?? '—' : '—';
    return { dept, pos };
  }

  function getVacancyStatus(vacancyId: number) {
    const vac = vacancies.find((v) => v.vacancy_id === vacancyId);
    return vacancyStatuses.find((s) => s.vacancy_status_id === vac?.vacancy_status_id)?.name ?? 'Активна';
  }

  function getFirstPubDate(vacancyId: number) {
    const dates = activePubs
      .filter((p) => p.vacancy_id === vacancyId)
      .map((p) => p.published_at)
      .sort();
    return dates[0] ? new Date(dates[0]).toLocaleDateString('ru-RU') : '—';
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
          p === '...'
            ? <span key={`dots-${i}`} className={styles.pageDots}>…</span>
            : (
              <button
                key={p}
                className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
                onClick={() => setPage(p as number)}
              >
                {p}
              </button>
            )
        )}
      </div>
    );
  }

  const statCards = [
    { label: 'Заявок',                 value: requests.length,    accent: true  },
    { label: 'Вакансий',               value: vacancies.length,   accent: false },
    { label: 'Опубликованных вакансий',value: activePubs.length,  accent: false },
    { label: 'Собеседований',          value: interviews.length,  accent: false },
  ];

  const showTable = roleId === 1 || roleId === 2;

  return (
    <div>
      <div className={styles.stats}>
        {(roleId === 3
          ? [statCards[0], statCards[3]]
          : statCards
        ).map((s) => (
          <div key={s.label} className={`${styles.statCard} ${s.accent ? styles.statAccent : ''}`}>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statValue}>{s.value}</span>
          </div>
        ))}
      </div>

      {showTable && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Опубликованные вакансии</span>
            <div className={styles.searchBox}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" style={{color:'var(--text-light)', flexShrink:0}}>
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                className={styles.searchInput}
                placeholder="Поиск"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              {search && (
                <button className={styles.clearBtn} onClick={() => { setSearch(''); setPage(1); }}>×</button>
              )}
            </div>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>№</th>
                <th>Должность</th>
                <th>Отдел</th>
                <th>Дата публикации</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((vac, idx) => {
                const { dept, pos } = getVacancyInfo(vac.vacancy_id);
                const statusName = getVacancyStatus(vac.vacancy_id);
                const pubDate = getFirstPubDate(vac.vacancy_id);
                return (
                  <tr key={vac.vacancy_id}>
                    <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td>{pos || vac.title}</td>
                    <td>{dept}</td>
                    <td>{pubDate}</td>
                    <td>
                      <span className={`${styles.badge} ${styles.badgeActive}`}>
                        {statusName}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <Link to={`/published/${vac.vacancy_id}`} className={styles.actionBtn} title="Открыть">
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={6} className={styles.empty}>Опубликованных вакансий нет</td></tr>
              )}
            </tbody>
          </table>
          {renderPagination()}
        </div>
      )}
    </div>
  );
}

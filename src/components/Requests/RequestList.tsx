import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { fmtRequestId } from '../../utils';
import styles from './Requests.module.css';

const PAGE_SIZE = 10;

export default function RequestList() {
  const { requests, setRequests, requestStatuses, departmentPositions, departments, positions, currentUser, employmentTypes } = useApp();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [statusFilter, setStatusFilter] = useState(0);
  const [deptFilter, setDeptFilter] = useState(0);

  const visibleRequests = currentUser?.role_id === 3
    ? requests.filter((r) => r.user_id === currentUser.user_id)
    : requests;

  const availableDepts = useMemo(() => {
    const depts = new Map<number, string>();
    visibleRequests.forEach((req) => {
      const dp = departmentPositions.find((d) => d.department_position_id === req.department_position_id);
      if (dp) {
        const dept = departments.find((d) => d.department_id === dp.department_id);
        if (dept) depts.set(dept.department_id, dept.name);
      }
    });
    return [...depts.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [visibleRequests, departmentPositions, departments]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...visibleRequests]
      .sort((a, b) => {
        const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return sortDir === 'desc' ? diff : -diff;
      })
      .filter((req) => {
        if (statusFilter && req.request_status_id !== statusFilter) return false;
        const dp = departmentPositions.find((d) => d.department_position_id === req.department_position_id);
        if (deptFilter && dp?.department_id !== deptFilter) return false;
        const dept = departments.find((d) => d.department_id === dp?.department_id)?.name ?? '';
        const pos = positions.find((p) => p.position_id === dp?.position_id)?.name ?? '';
        return !q || dept.toLowerCase().includes(q) || pos.toLowerCase().includes(q);
      });
  }, [visibleRequests, search, statusFilter, deptFilter, sortDir, departmentPositions, departments, positions]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function getDeptPos(dpId: number) {
    const dp = departmentPositions.find((d) => d.department_position_id === dpId);
    if (!dp) return { dept: '—', pos: '—' };
    const dept = departments.find((d) => d.department_id === dp.department_id)?.name ?? '—';
    const pos = positions.find((p) => p.position_id === dp.position_id)?.name ?? '—';
    return { dept, pos };
  }

  function handleDelete(id: number) {
    if (window.confirm('Вы уверены, что хотите удалить эту заявку?')) {
      setRequests((prev) => prev.filter((r) => r.request_id !== id));
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.topActions}>
        {(currentUser?.role_id === 1 || currentUser?.role_id === 3) && (
          <Link to="/requests/new" className={styles.btnToolbar}>Создать новую заявку</Link>
        )}
        <div className={styles.topActionsRight}>
          {availableDepts.length > 1 && (
            <select
              className={styles.filterSelect}
              value={deptFilter}
              onChange={(e) => { setDeptFilter(Number(e.target.value)); setPage(1); }}
            >
              <option value={0}>Все отделы</option>
              {availableDepts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          )}
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(Number(e.target.value)); setPage(1); }}
          >
            <option value={0}>Все статусы</option>
            {requestStatuses.map((s) => (
              <option key={s.request_status_id} value={s.request_status_id}>{s.name}</option>
            ))}
          </select>
          <div className={styles.searchBox}>
            <input
              className={styles.searchInput}
              placeholder="Поиск"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            {search && (
              <button style={{border:'none',background:'none',cursor:'pointer'}} onClick={() => {setSearch(''); setPage(1);}}>×</button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>№</th>
              <th>ID заявки</th>
              <th>Должность</th>
              <th>Отдел</th>
              <th>Тип занятости</th>
              <th
                className={`${styles.thSortable} ${styles.thSortActive}`}
                onClick={() => { setSortDir((d) => d === 'desc' ? 'asc' : 'desc'); setPage(1); }}
              >
                Дата создания
                <span className={styles.thSortIcon}>{sortDir === 'desc' ? '▼' : '▲'}</span>
              </th>
              <th>Статус</th>
              <th style={{width: '70px'}}></th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((req, idx) => {
              const { dept, pos } = getDeptPos(req.department_position_id);
              const empType = employmentTypes.find(e => e.employment_type_id === req.employment_type_id)?.name ?? '—';
              const statusName = requestStatuses.find((s) => s.request_status_id === req.request_status_id)?.name ?? '—';
              const sId = req.request_status_id;
              let statusClass = styles.statusNew;
              if (sId === 2) statusClass = styles.statusWork;
              else if (sId === 3) statusClass = styles.statusDone;
              else if (sId === 4) statusClass = styles.statusRejected;
              
              return (
                <tr key={req.request_id}>
                  <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                    {fmtRequestId(req.request_id, req.created_at)}
                  </td>
                  <td>{pos}</td>
                  <td>{dept}</td>
                  <td>{empType}</td>
                  <td>{new Date(req.created_at).toLocaleDateString('ru-RU')}</td>
                  <td>
                    <span className={`${styles.badge} ${statusClass}`}>
                      {statusName}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionCell}>
                      <Link to={`/requests/${req.request_id}`} className={styles.actionIcon} title="Изменить">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M14.121 4.379a3 3 0 00-4.242 0L3 11.243v4.242h4.242l6.879-6.879a3 3 0 000-4.243zM10.5 7.5l2.25 2.25"/>
                        </svg>
                      </Link>
                      <button className={styles.actionIcon} title="Удалить" onClick={() => handleDelete(req.request_id)}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginated.length === 0 && (
              <tr><td colSpan={8} className={styles.empty}>Заявок не найдено</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

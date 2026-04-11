import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { nextId, fmtVacancyId } from '../../utils';
import styles from '../Requests/Requests.module.css';

export default function VacancyList() {
  const {
    vacancies, setVacancies,
    publications, setPublications,
    vacancyStatuses, requests, departmentPositions,
    departments, positions, users, searchChannels,
  } = useApp();

  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [pubDate, setPubDate] = useState(new Date().toISOString().slice(0, 10));
  const [channelId, setChannelId] = useState(0);

  function getStatusName(id: number) {
    return vacancyStatuses.find((s) => s.vacancy_status_id === id)?.name ?? '—';
  }

  function getStatusClass(id: number) {
    const map: Record<number, string> = { 1: styles.statusNew, 2: styles.statusWork, 3: styles.statusRejected };
    return map[id] ?? '';
  }

  function getVacancyMeta(vacancyId: number) {
    const vac = vacancies.find((v) => v.vacancy_id === vacancyId);
    if (!vac) return { pos: '—', dept: '—', manager: '—' };
    const req = requests.find((r) => r.request_id === vac.request_id);
    if (!req) return { pos: '—', dept: '—', manager: '—' };
    const dp = departmentPositions.find((d) => d.department_position_id === req.department_position_id);
    const pos = dp ? (positions.find((p) => p.position_id === dp.position_id)?.name ?? '—') : '—';
    const dept = dp ? (departments.find((d) => d.department_id === dp.department_id)?.name ?? '—') : '—';
    const author = users.find((u) => u.user_id === req.user_id);
    const manager = author ? `${author.last_name} ${author.first_name}` : '—';
    return { pos, dept, manager };
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const sorted = [...vacancies].sort((a, b) => {
      const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return sortDir === 'desc' ? diff : -diff;
    });
    if (!q) return sorted;
    return sorted.filter((v) => {
      const { pos, dept } = getVacancyMeta(v.vacancy_id);
      return pos.toLowerCase().includes(q) || dept.toLowerCase().includes(q);
    });
  }, [vacancies, search, sortDir, requests, departmentPositions, departments, positions]);

  function handleDelete(id: number) {
    if (window.confirm('Вы уверены, что хотите удалить эту вакансию?')) {
      setVacancies((prev) => prev.filter((v) => v.vacancy_id !== id));
    }
  }

  function openPublishModal(id: number) {
    setPublishingId(id);
    setPubDate(new Date().toISOString().slice(0, 10));
    setChannelId(searchChannels[0]?.channel_id ?? 0);
  }

  function handlePublish() {
    if (publishingId === null) return;
    const now = new Date().toISOString();
    setVacancies((prev) =>
      prev.map((v) =>
        v.vacancy_id === publishingId
          ? { ...v, vacancy_status_id: 2, updated_at: now }
          : v
      )
    );
    setPublications((prev) => [
      ...prev,
      {
        publication_id: nextId(publications, 'publication_id'),
        published_at: pubDate,
        url: '',
        views_count: 0,
        responses_count: 0,
        is_active: true,
        vacancy_id: publishingId,
        channel_id: channelId,
      },
    ]);
    setPublishingId(null);
  }

  const publishingVacancy = publishingId !== null ? vacancies.find((v) => v.vacancy_id === publishingId) : null;
  const publishingPos = publishingVacancy ? getVacancyMeta(publishingVacancy.vacancy_id).pos : '—';

  return (
    <div className={styles.section}>
      <div className={styles.topActions}>
        <div />
        <div className={styles.searchBox}>
          <input
            className={styles.searchInput}
            placeholder="Поиск"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button style={{ border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => setSearch('')}>×</button>
          )}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>№</th>
              <th>ID вакансии</th>
              <th>Должность</th>
              <th>Отдел</th>
              <th>Руководитель</th>
              <th
                className={`${styles.thSortable} ${styles.thSortActive}`}
                onClick={() => setSortDir((d) => d === 'desc' ? 'asc' : 'desc')}
              >
                Дата создания
                <span className={styles.thSortIcon}>{sortDir === 'desc' ? '▼' : '▲'}</span>
              </th>
              <th>Статус</th>
              <th style={{ width: '90px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v, idx) => {
              const { pos, dept, manager } = getVacancyMeta(v.vacancy_id);
              return (
                <tr key={v.vacancy_id}>
                  <td>{idx + 1}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                    {fmtVacancyId(v.vacancy_id, v.created_at)}
                  </td>
                  <td>{pos}</td>
                  <td>{dept}</td>
                  <td>{manager}</td>
                  <td>{new Date(v.created_at).toLocaleDateString('ru-RU')}</td>
                  <td>
                    <span className={`${styles.badge} ${getStatusClass(v.vacancy_status_id)}`}>
                      {getStatusName(v.vacancy_status_id)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionCell}>
                      {/* Publish */}
                      <button
                        className={styles.actionIcon}
                        title="Опубликовать"
                        onClick={() => openPublishModal(v.vacancy_id)}
                      >
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 8v8M8 12l4-4 4 4"/>
                        </svg>
                      </button>
                      {/* Open/Edit */}
                      <Link to={`/vacancies/${v.vacancy_id}`} className={styles.actionIcon} title="Открыть">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M14.121 4.379a3 3 0 00-4.242 0L3 11.243v4.242h4.242l6.879-6.879a3 3 0 000-4.243zM10.5 7.5l2.25 2.25"/>
                        </svg>
                      </Link>
                      {/* Delete */}
                      <button
                        className={styles.actionIcon}
                        title="Удалить"
                        onClick={() => handleDelete(v.vacancy_id)}
                      >
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className={styles.empty}>Вакансий нет</p>}
      </div>

      {/* Publish modal */}
      {publishingId !== null && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Публикация вакансии</span>
              <button className={styles.modalClose} onClick={() => setPublishingId(null)}>✕</button>
            </div>
            <div className={styles.modalGrid}>
              <div className={styles.modalField}>
                <span className={styles.modalLabel}>Должность</span>
                <span className={styles.modalInput} style={{ display: 'block', borderBottom: '1px solid var(--text-dark)' }}>
                  {publishingPos}
                </span>
              </div>
              <div className={styles.modalField}>
                <span className={styles.modalLabel}>Дата публикации</span>
                <input
                  type="date"
                  className={styles.modalInput}
                  value={pubDate}
                  onChange={(e) => setPubDate(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.modalField} style={{ marginBottom: '1.5rem' }}>
              <span className={styles.modalLabel}>Каналы поиска</span>
              <select
                className={styles.modalSelect}
                value={channelId}
                onChange={(e) => setChannelId(Number(e.target.value))}
              >
                <option value={0}>Канал поиска</option>
                {searchChannels.map((ch) => (
                  <option key={ch.channel_id} value={ch.channel_id}>{ch.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnSubmit} onClick={handlePublish}>
                Опубликовать вакансию
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

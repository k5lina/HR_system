import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { fmtPublicationId } from '../../utils';
import styles from '../Requests/Requests.module.css';

export default function PublishedVacancyList() {
  const { publications, vacancies, searchChannels } = useApp();
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  function getVacancyTitle(vacancyId: number) {
    return vacancies.find((v) => v.vacancy_id === vacancyId)?.title ?? '—';
  }

  function getChannelName(channelId: number) {
    return searchChannels.find((c) => c.channel_id === channelId)?.name ?? '—';
  }

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Опубликованные вакансии</h2>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>№</th>
              <th>ID публикации</th>
              <th>Вакансия</th>
              <th>Канал</th>
              <th
                className={`${styles.thSortable} ${styles.thSortActive}`}
                onClick={() => setSortDir((d) => d === 'desc' ? 'asc' : 'desc')}
              >
                Дата публикации
                <span className={styles.thSortIcon}>{sortDir === 'desc' ? '▼' : '▲'}</span>
              </th>
              <th>Просмотры</th>
              <th>Отклики</th>
              <th>Статус</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {[...publications]
              .sort((a, b) => {
                const diff = new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
                return sortDir === 'desc' ? diff : -diff;
              })
              .map((p, idx) => (
              <tr key={p.publication_id}>
                <td>{idx + 1}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                  {fmtPublicationId(p.publication_id, p.published_at)}
                </td>
                <td>{getVacancyTitle(p.vacancy_id)}</td>
                <td>{getChannelName(p.channel_id)}</td>
                <td>{new Date(p.published_at).toLocaleDateString('ru-RU')}</td>
                <td>{p.views_count}</td>
                <td>{p.responses_count}</td>
                <td>
                  <span className={`${styles.badge} ${p.is_active ? styles.statusDone : styles.statusRejected}`}>
                    {p.is_active ? 'Активна' : 'Снята'}
                  </span>
                </td>
                <td>
                  <Link to={`/published/${p.vacancy_id}`} className={styles.linkBtn}>Открыть</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {publications.length === 0 && <p className={styles.empty}>Публикаций нет</p>}
      </div>
    </div>
  );
}

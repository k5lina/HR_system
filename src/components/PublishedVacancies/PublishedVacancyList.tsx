import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import styles from '../Requests/Requests.module.css';

export default function PublishedVacancyList() {
  const { publications, vacancies, searchChannels } = useApp();

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
              <th>Вакансия</th>
              <th>Канал</th>
              <th>Опубликовано</th>
              <th>Просмотры</th>
              <th>Отклики</th>
              <th>Статус</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {publications.map((p) => (
              <tr key={p.publication_id}>
                <td>#{p.publication_id}</td>
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

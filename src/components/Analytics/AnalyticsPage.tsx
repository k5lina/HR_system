import { useNavigate } from 'react-router-dom';
import styles from './Analytics.module.css';
import formStyles from '../Requests/Requests.module.css';

const REPORTS = [
  {
    path: '/analytics/funnel',
    title: 'Воронка кандидатов',
    desc: 'Конверсия по этапам отбора, относительная и абсолютная',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 4h18l-7 9v6l-4-2v-4L3 4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    path: '/analytics/time',
    title: 'Среднее время закрытия вакансий',
    desc: 'Время нахождения кандидатов на каждом этапе и среднее время закрытия',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    path: '/analytics/reasons',
    title: 'Причины отказов кандидатам',
    desc: 'Распределение отказов по причинам за выбранный период',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function AnalyticsPage() {
  const navigate = useNavigate();

  return (
    <div className={formStyles.section}>
      <h1 className={formStyles.title}>Аналитика</h1>
      <div className={styles.hubGrid}>
        {REPORTS.map((r) => (
          <button key={r.path} className={styles.hubCard} onClick={() => navigate(r.path)}>
            <div className={styles.hubIcon}>{r.icon}</div>
            <div className={styles.hubCardTitle}>{r.title}</div>
            <div className={styles.hubCardDesc}>{r.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

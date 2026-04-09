import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import styles from '../Requests/Requests.module.css';
import kbStyles from '../PublishedVacancies/Kanban.module.css';

export default function CandidateProfile() {
  const { id } = useParams();
  const candidateId = Number(id);
  const { candidates, publications, vacancies, resumeAnalyses, selectionStages, rejectionReasons } = useApp();

  const candidate = candidates.find((c) => c.candidate_id === candidateId);
  if (!candidate) return <p style={{ color: '#ff6b6b' }}>Кандидат не найден</p>;

  const pub = publications.find((p) => p.publication_id === candidate.publication_id);
  const vacancy = pub ? vacancies.find((v) => v.vacancy_id === pub.vacancy_id) : null;
  const analysis = resumeAnalyses.find((a) => a.candidate_id === candidateId);
  const stageName = selectionStages.find((s) => s.stage_id === candidate.stage_id)?.name ?? '—';
  const rejectionName = candidate.rejection_reason_id
    ? rejectionReasons.find((r) => r.rejection_reason_id === candidate.rejection_reason_id)?.name
    : null;

  const STAGE_ROUTES: Record<number, string> = {
    2: 'phone-interview', 3: 'main-interview', 4: 'security-check', 5: 'medical-check', 6: 'offer',
  };

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Профиль кандидата</h2>
        <Link to={pub ? `/published/${pub.publication_id}` : '/published'} className={styles.linkBtn}>← Назад</Link>
      </div>
      <div className={kbStyles.profileCard}>
        <h3 className={kbStyles.profileName}>
          {candidate.last_name} {candidate.first_name} {candidate.middle_name ?? ''}
        </h3>
        {vacancy && <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 1rem', fontSize: '0.875rem' }}>{vacancy.title}</p>}
        <div className={kbStyles.profileMeta}>
          {[
            ['Дата рождения', candidate.birth_date ? new Date(candidate.birth_date).toLocaleDateString('ru-RU') : '—'],
            ['Город', candidate.city],
            ['Email', candidate.email],
            ['Телефон', candidate.phone],
            ['Образование', candidate.education],
            ['Опыт работы', `${candidate.work_experience} лет`],
            ['Текущий этап', stageName],
            ['Оценка резюме', analysis?.score !== undefined ? `${analysis.score}/10` : '—'],
          ].map(([label, value]) => (
            <div key={label} className={kbStyles.profileMetaItem}>
              <span className={kbStyles.profileMetaLabel}>{label}</span>
              <span className={kbStyles.profileMetaValue}>{value}</span>
            </div>
          ))}
        </div>
        {rejectionName && (
          <p style={{ color: '#ff6b6b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Причина отказа: {rejectionName}
          </p>
        )}
        <div className={styles.formActions}>
          {STAGE_ROUTES[candidate.stage_id] && (
            <Link
              to={`/selection/${candidateId}/${STAGE_ROUTES[candidate.stage_id]}`}
              className={styles.btnPrimary}
            >
              Перейти к этапу
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

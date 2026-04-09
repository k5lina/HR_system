import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import styles from '../Requests/Requests.module.css';
import kbStyles from './Kanban.module.css';

const STAGES = [
  { stage_id: 1, name: 'Анализ резюме', route: null },
  { stage_id: 2, name: 'Тел. интервью', route: 'phone-interview' },
  { stage_id: 3, name: 'Собеседование', route: 'main-interview' },
  { stage_id: 4, name: 'Проверка СБ', route: 'security-check' },
  { stage_id: 5, name: 'Медпроверка', route: 'medical-check' },
  { stage_id: 6, name: 'Оффер', route: 'offer' },
];

export default function PublishedVacancyCard() {
  const { id } = useParams();
  const pubId = Number(id);
  const { publications, vacancies, candidates, resumeAnalyses } = useApp();

  const pub = publications.find((p) => p.publication_id === pubId);
  const vacancy = pub ? vacancies.find((v) => v.vacancy_id === pub.vacancy_id) : null;
  const pubCandidates = candidates.filter((c) => c.publication_id === pubId);

  function getScore(candidateId: number) {
    return resumeAnalyses.find((a) => a.candidate_id === candidateId)?.score;
  }

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>{vacancy?.title ?? 'Вакансия'}</h2>
        <Link to="/published" className={styles.linkBtn}>← Назад</Link>
      </div>
      <div className={kbStyles.kanbanBoard}>
        {STAGES.map((stage) => {
          const stageCandidates = pubCandidates.filter((c) => c.stage_id === stage.stage_id);
          return (
            <div key={stage.stage_id} className={kbStyles.kanbanCol}>
              <p className={kbStyles.kanbanColTitle}>{stage.name} ({stageCandidates.length})</p>
              {stageCandidates.map((c) => {
                const score = getScore(c.candidate_id);
                const link = stage.route
                  ? `/selection/${c.candidate_id}/${stage.route}`
                  : `/candidates/${c.candidate_id}`;
                return (
                  <Link key={c.candidate_id} to={link} className={kbStyles.kanbanCard}>
                    <p className={kbStyles.kanbanCardName}>{c.last_name} {c.first_name}</p>
                    <p className={kbStyles.kanbanCardSub}>{c.city}</p>
                    {score !== undefined && (
                      <span className={kbStyles.scoreChip}>Оценка: {score}</span>
                    )}
                    {c.rejection_reason_id && (
                      <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.7rem', color: '#ff6b6b' }}>Отказ</span>
                    )}
                  </Link>
                );
              })}
              {stageCandidates.length === 0 && (
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>Пусто</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

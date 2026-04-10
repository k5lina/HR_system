import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import styles from './Analytics.module.css';
import formStyles from '../Requests/Requests.module.css';

const STAGES = [
  { id: 1, name: 'Анализ резюме' },
  { id: 2, name: 'Телефонное интервью' },
  { id: 3, name: 'Собеседование с руководителем' },
  { id: 4, name: 'Проверка СБ' },
  { id: 5, name: 'Медицинская проверка' },
  { id: 6, name: 'Оффер' },
];

export default function FunnelReport() {
  const navigate = useNavigate();
  const { candidates, publications, vacancies, requests, departmentPositions, departments, positions, currentUser } = useApp();

  const [deptId, setDeptId] = useState<number | 'all'>('all');
  const [posId, setPosId] = useState<number | 'all'>('all');
  const [vacancyId, setVacancyId] = useState<number | 'all'>('all');
  const [generated, setGenerated] = useState(false);

  const today = new Date().toLocaleDateString('ru-RU');

  // Filtered candidates
  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      const pub = publications.find((p) => p.publication_id === c.publication_id);
      if (!pub) return false;
      const vac = vacancies.find((v) => v.vacancy_id === pub.vacancy_id);
      if (!vac) return false;
      if (vacancyId !== 'all' && vac.vacancy_id !== vacancyId) return false;
      const req = requests.find((r) => r.request_id === vac.request_id);
      if (!req) return false;
      const dp = departmentPositions.find((d) => d.department_position_id === req.department_position_id);
      if (!dp) return false;
      if (deptId !== 'all' && dp.department_id !== deptId) return false;
      if (posId !== 'all' && dp.position_id !== posId) return false;
      return true;
    });
  }, [candidates, publications, vacancies, requests, departmentPositions, deptId, posId, vacancyId]);

  const stageCounts = useMemo(() =>
    STAGES.map((s) => ({
      ...s,
      count: filtered.filter((c) => c.stage_id >= s.id).length,
    })),
  [filtered]);

  const maxCount = stageCounts[0]?.count ?? 0;

  return (
    <div className={formStyles.section}>
      {/* Header */}
      <div className={formStyles.header}>
        <button className={formStyles.backBtn} onClick={() => navigate('/home')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className={formStyles.title}>Отчёт «Воронка кандидатов»</h1>
      </div>

      {/* Meta */}
      <div className={styles.reportMeta}>
        <div className={styles.reportMetaField}>
          <span className={styles.reportMetaLabel}>Составитель</span>
          <span className={styles.reportMetaValue}>{currentUser?.full_name ?? '—'}</span>
        </div>
        <div className={styles.reportMetaField}>
          <span className={styles.reportMetaLabel}>Дата создания</span>
          <span className={styles.reportMetaValue}>{today}</span>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersGrid}>
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Отдел</label>
          <select className={styles.filterSelect} value={deptId} onChange={(e) => setDeptId(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
            <option value="all">Отдел</option>
            {departments.map((d) => <option key={d.department_id} value={d.department_id}>{d.name}</option>)}
          </select>
        </div>
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Должность</label>
          <select className={styles.filterSelect} value={posId} onChange={(e) => setPosId(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
            <option value="all">Должность</option>
            {positions.map((p) => <option key={p.position_id} value={p.position_id}>{p.name}</option>)}
          </select>
        </div>
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Вакансия</label>
          <select className={styles.filterSelect} value={vacancyId} onChange={(e) => setVacancyId(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
            <option value="all">Вакансия</option>
            {vacancies.map((v) => <option key={v.vacancy_id} value={v.vacancy_id}>{v.title}</option>)}
          </select>
        </div>
        <button className={formStyles.btnSave} onClick={() => setGenerated(true)}>
          Сформировать отчёт
        </button>
      </div>

      {/* Chart */}
      {generated && (
        <div className={styles.chartSection}>
          {/* Header row */}
          <div className={styles.funnelHeader}>
            <div className={styles.funnelHeaderCell}>Этап</div>
            <div className={styles.funnelHeaderCell} style={{ textAlign: 'left' }}></div>
            <div className={styles.funnelHeaderCell}>Кандидаты (кол-во)</div>
            <div className={styles.funnelHeaderCell}>Относительная конверсия</div>
            <div className={styles.funnelHeaderCell}>Абсолютная конверсия</div>
          </div>

          {stageCounts.map((stage, idx) => {
            const barWidth = maxCount > 0 ? `${(stage.count / maxCount) * 100}%` : '0%';
            const relConv = idx === 0
              ? 100
              : stageCounts[idx - 1].count > 0
              ? Math.round((stage.count / stageCounts[idx - 1].count) * 100)
              : 0;
            const absConv = stageCounts[0].count > 0
              ? Math.round((stage.count / stageCounts[0].count) * 100)
              : 0;

            return (
              <div key={stage.id} className={styles.funnelRow}>
                <div className={styles.funnelRowLabel}>{stage.name}</div>
                <div className={styles.funnelBarWrap}>
                  <div className={styles.funnelBar} style={{ width: barWidth }} />
                </div>
                <div className={styles.funnelCell}>{stage.count}</div>
                <div className={styles.funnelCell}>{relConv}%</div>
                <div className={styles.funnelCell}>{absConv}%</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Download */}
      {generated && (
        <button className={formStyles.iconLinkBtn} disabled>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M10 3v10M6 9l4 4 4-4M4 17h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Скачать отчёт
        </button>
      )}
    </div>
  );
}

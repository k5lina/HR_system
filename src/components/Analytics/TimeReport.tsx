import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import styles from './Analytics.module.css';
import formStyles from '../Requests/Requests.module.css';

const STAGES = [
  { id: 1, name: 'Новые' },
  { id: 2, name: 'Телефонное интервью' },
  { id: 3, name: 'Собеседование с руководителем' },
  { id: 4, name: 'Проверка' },
  { id: 6, name: 'Оффер' },
];

function daysBetween(a: string, b: string) {
  return Math.round(Math.abs(new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}

export default function TimeReport() {
  const navigate = useNavigate();
  const { candidates, publications, vacancies, requests, departmentPositions, departments, interviews, currentUser } = useApp();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [deptId, setDeptId]     = useState<number | 'all'>('all');
  const [vacancyId, setVacancyId] = useState<number | 'all'>('all');
  const [generated, setGenerated] = useState(false);

  const today = new Date().toLocaleDateString('ru-RU');

  // Filtered vacancies
  const filteredVacancies = useMemo(() => {
    return vacancies.filter((v) => {
      if (vacancyId !== 'all' && v.vacancy_id !== vacancyId) return false;
      const req = requests.find((r) => r.request_id === v.request_id);
      if (!req) return true;
      const dp = departmentPositions.find((d) => d.department_position_id === req.department_position_id);
      if (!dp) return true;
      if (deptId !== 'all' && dp.department_id !== deptId) return false;
      return true;
    });
  }, [vacancies, requests, departmentPositions, deptId, vacancyId]);

  // Avg days per stage: use interviews scheduled_at grouped by stage_id
  const stageTimeData = useMemo(() => {
    return STAGES.map((stage) => {
      const stageInterviews = interviews.filter(
        (i) => i.stage_id === stage.id && i.scheduled_at && i.finished_at,
      );
      if (stageInterviews.length === 0) return { name: stage.name, days: 0 };
      const total = stageInterviews.reduce(
        (sum, i) => sum + daysBetween(i.scheduled_at, i.finished_at!),
        0,
      );
      return { name: stage.name, days: Math.round(total / stageInterviews.length) };
    });
  }, [interviews]);

  // Avg vacancy closure days
  const avgClosureDays = useMemo(() => {
    const closed = filteredVacancies.filter((v) => v.closed_at);
    if (closed.length === 0) return null;
    const total = closed.reduce((sum, v) => sum + daysBetween(v.created_at, v.closed_at!), 0);
    return Math.round(total / closed.length);
  }, [filteredVacancies]);

  return (
    <div className={formStyles.section}>
      {/* Header */}
      <div className={formStyles.header}>
        <button className={formStyles.backBtn} onClick={() => navigate('/analytics')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className={formStyles.title}>Отчёт «Среднее время закрытия вакансий»</h1>
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
          <label className={styles.filterLabel}>Период с</label>
          <input type="date" className={styles.filterDateInput} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>до</label>
          <input type="date" className={styles.filterDateInput} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Отдел</label>
          <select className={styles.filterSelect} value={deptId} onChange={(e) => setDeptId(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
            <option value="all">Отдел</option>
            {departments.map((d) => <option key={d.department_id} value={d.department_id}>{d.name}</option>)}
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

      {generated && (
        <>
          {/* Stage time bar chart */}
          <div className={styles.chartSection}>
            <div className={styles.chartTitle}>
              Среднее время нахождения кандидатов на каждом этапе воронки, дней
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stageTimeData} layout="vertical" margin={{ left: 16, right: 32, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--beige-200)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: 'var(--text-light)' }}
                  axisLine={false}
                  tickLine={false}
                  unit=" дн."
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={220}
                  tick={{ fontSize: 12, fill: 'var(--text-dark)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v) => [`${v} дн.`, 'Среднее время']}
                  contentStyle={{ border: '1px solid var(--beige-200)', borderRadius: '6px', fontSize: '0.8rem' }}
                />
                <Bar dataKey="days" fill="#9496e0" radius={[0, 3, 3, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Avg closure */}
          <div className={styles.chartSection}>
            <div className={styles.chartTitle}>Среднее время закрытия вакансий, дней</div>
            <div className={styles.statBox}>
              <span className={styles.statNumber}>
                {avgClosureDays !== null ? avgClosureDays : '—'}
              </span>
              {avgClosureDays !== null && <span className={styles.statUnit}>дней</span>}
            </div>
          </div>

          {/* Download */}
          <button className={formStyles.iconLinkBtn} disabled>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M10 3v10M6 9l4 4 4-4M4 17h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Скачать отчёт
          </button>
        </>
      )}
    </div>
  );
}

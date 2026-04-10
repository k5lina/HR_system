import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import styles from './Analytics.module.css';
import formStyles from '../Requests/Requests.module.css';

const PALETTE = [
  '#9b59b6', '#3498db', '#e74c3c', '#2ecc71', '#f39c12',
  '#1abc9c', '#e67e22', '#c0392b', '#16a085', '#8e44ad',
];

export default function ReasonsReport() {
  const navigate = useNavigate();
  const { candidates, publications, vacancies, requests, departmentPositions, departments, rejectionReasons, currentUser } = useApp();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [deptId, setDeptId]     = useState<number | 'all'>('all');
  const [vacancyId, setVacancyId] = useState<number | 'all'>('all');
  const [generated, setGenerated] = useState(false);

  const today = new Date().toLocaleDateString('ru-RU');

  const pieData = useMemo(() => {
    const rejected = candidates.filter((c) => {
      if (!c.rejection_reason_id) return false;
      // date filter
      if (dateFrom || dateTo) {
        // use publication date as proxy; skip if no publication
        const pub = publications.find((p) => p.publication_id === c.publication_id);
        if (pub) {
          const d = pub.published_at.slice(0, 10);
          if (dateFrom && d < dateFrom) return false;
          if (dateTo && d > dateTo) return false;
        }
      }
      // dept / vacancy filter
      const pub = publications.find((p) => p.publication_id === c.publication_id);
      if (!pub) return true;
      const vac = vacancies.find((v) => v.vacancy_id === pub.vacancy_id);
      if (!vac) return true;
      if (vacancyId !== 'all' && vac.vacancy_id !== vacancyId) return false;
      const req = requests.find((r) => r.request_id === vac.request_id);
      if (!req) return true;
      const dp = departmentPositions.find((d) => d.department_position_id === req.department_position_id);
      if (!dp) return true;
      if (deptId !== 'all' && dp.department_id !== deptId) return false;
      return true;
    });

    const map: Record<number, number> = {};
    rejected.forEach((c) => {
      if (c.rejection_reason_id) {
        map[c.rejection_reason_id] = (map[c.rejection_reason_id] ?? 0) + 1;
      }
    });

    return rejectionReasons
      .filter((r) => map[r.rejection_reason_id])
      .map((r) => ({ name: r.name, value: map[r.rejection_reason_id] }));
  }, [candidates, publications, vacancies, requests, departmentPositions, rejectionReasons, dateFrom, dateTo, deptId, vacancyId]);

  const total = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <div className={formStyles.section}>
      {/* Header */}
      <div className={formStyles.header}>
        <button className={formStyles.backBtn} onClick={() => navigate('/analytics')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className={formStyles.title}>Отчёт «Причины отказов кандидатам»</h1>
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
          <div className={styles.chartSection}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={420}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="40%"
                    cy="50%"
                    outerRadius={160}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 1.35;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return percent > 0.03 ? (
                        <text x={x} y={y} fill="var(--text-dark)" textAnchor={x > cx ? 'start' : 'end'} fontSize={11} fontWeight={600}>
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      ) : null;
                    }}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value} (${total > 0 ? Math.round((value / total) * 100) : 0}%)`, 'Кандидатов']}
                    contentStyle={{ border: '1px solid var(--beige-200)', borderRadius: '6px', fontSize: '0.8rem' }}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    iconSize={10}
                    formatter={(value) => (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dark)', fontWeight: 500 }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className={formStyles.empty}>Нет данных об отказах за выбранный период</p>
            )}
          </div>

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

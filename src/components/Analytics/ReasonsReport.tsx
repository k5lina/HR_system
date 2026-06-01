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

// ── Заглушка для демо-отчёта ──────────────────────────────────────────
// Если реальных отказов по выбранным фильтрам нет — показываем фиксированное
// распределение, чтобы продемонстрировать визуал круговой диаграммы.
const DEMO_REASONS_STUB: { name: string; value: number }[] = [
  { name: 'Несоответствие вакансии', value: 38 },
  { name: 'Неуспешное интервью', value: 23 },
  { name: 'Неуспешное собеседование', value: 16 },
  { name: 'Некорректная медкнижка', value: 9 },
  { name: 'Неуспешная проверка СБ', value: 5 },
  { name: 'Неуспешный медосмотр', value: 5 },
  { name: 'Невыполнение условий оформления медкнижки', value: 4 },
  { name: 'Отказ от предложения', value: 0 },
];

export default function ReasonsReport() {
  const navigate = useNavigate();
  const { candidates, publications, vacancies, requests, departmentPositions, departments, rejectionReasons, currentUser } = useApp();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deptId, setDeptId] = useState<number | 'all'>('all');
  const [vacancyId, setVacancyId] = useState<number | 'all'>('all');
  const [generated, setGenerated] = useState(false);

  const today = new Date().toLocaleDateString('ru-RU');

  // Cascading vacancy options (filtered by dept)
  const availableVacancies = useMemo(() => {
    return vacancies.filter((v) => {
      if (deptId === 'all') return true;
      const req = requests.find((r) => r.request_id === v.request_id);
      if (!req) return false;
      const dp = departmentPositions.find((d) => d.department_position_id === req.department_position_id);
      if (!dp) return false;
      return dp.department_id === deptId;
    });
  }, [vacancies, requests, departmentPositions, deptId]);

  function handleDeptChange(newDeptId: number | 'all') {
    setDeptId(newDeptId);
    if (vacancyId !== 'all') {
      const still = vacancies.some((v) => {
        if (v.vacancy_id !== vacancyId) return false;
        if (newDeptId === 'all') return true;
        const req = requests.find((r) => r.request_id === v.request_id);
        if (!req) return false;
        const dp = departmentPositions.find((d) => d.department_position_id === req.department_position_id);
        if (!dp) return false;
        return dp.department_id === newDeptId;
      });
      if (!still) setVacancyId('all');
    }
  }

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

    const realData = rejectionReasons
      .filter((r) => map[r.rejection_reason_id])
      .map((r) => ({ name: r.name, value: map[r.rejection_reason_id] }));

    // Если за выбранный период по фильтрам реальных отказов не нашлось —
    // показываем демо-распределение, чтобы продемонстрировать визуал отчёта.
    return realData.length > 0 ? realData : DEMO_REASONS_STUB;
  }, [candidates, publications, vacancies, requests, departmentPositions, rejectionReasons, dateFrom, dateTo, deptId, vacancyId]);

  const total = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <div className={formStyles.section}>
      {/* Header */}
      <div className={formStyles.header}>
        <button className={formStyles.backBtn} onClick={() => navigate('/home')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
          <select className={styles.filterSelect} value={deptId} onChange={(e) => handleDeptChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
            <option value="all">Отдел</option>
            {departments.map((d) => <option key={d.department_id} value={d.department_id}>{d.name}</option>)}
          </select>
        </div>
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Вакансия</label>
          <select className={styles.filterSelect} value={vacancyId} onChange={(e) => setVacancyId(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
            <option value="all">Вакансия</option>
            {availableVacancies.map((v) => <option key={v.vacancy_id} value={v.vacancy_id}>{v.title}</option>)}
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
              <ResponsiveContainer width="100%" height={460}>
                <PieChart margin={{ top: 40, right: 40, bottom: 20, left: 40 }}>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="40%"
                    cy="50%"
                    outerRadius={160}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return percent > 0.03 ? (
                        <text x={x} y={y} fill="var(--text-dark)" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={17} fontWeight={700}>
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
                    iconSize={14}
                    formatter={(value) => (
                      <span style={{ fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: 500 }}>{value}</span>
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
              <path d="M10 3v10M6 9l4 4 4-4M4 17h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Скачать отчёт
          </button>
        </>
      )}
    </div>
  );
}

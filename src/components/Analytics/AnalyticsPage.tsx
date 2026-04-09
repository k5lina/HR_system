import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FunnelChart, Funnel, LabelList, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import styles from './Analytics.module.css';

const STAGE_NAMES = ['Анализ резюме', 'Тел. интервью', 'Собеседование', 'Проверка СБ', 'Медпроверка', 'Оффер'];
const COLORS = ['#4f8ef7', '#a78bfa', '#34d399', '#fbbf24', '#fb7185', '#67e8f9'];

export default function AnalyticsPage() {
  const { candidates, publications, vacancies, rejectionReasons, selectionStages } = useApp();
  const [selectedVacancyId, setSelectedVacancyId] = useState<number | 'all'>('all');

  const filteredCandidates = selectedVacancyId === 'all'
    ? candidates
    : candidates.filter((c) => {
        const pub = publications.find((p) => p.publication_id === c.publication_id);
        return pub?.vacancy_id === selectedVacancyId;
      });

  const funnelData = selectionStages.map((stage) => ({
    name: stage.name,
    value: filteredCandidates.filter((c) => c.stage_id === stage.stage_id).length,
    fill: COLORS[stage.stage_id - 1],
  }));

  const refusedCandidates = candidates.filter((c) => c.rejection_reason_id);
  const refusalMap: Record<number, number> = {};
  refusedCandidates.forEach((c) => {
    if (c.rejection_reason_id) {
      refusalMap[c.rejection_reason_id] = (refusalMap[c.rejection_reason_id] ?? 0) + 1;
    }
  });
  const pieData = rejectionReasons
    .filter((r) => refusalMap[r.rejection_reason_id])
    .map((r) => ({ name: r.name, value: refusalMap[r.rejection_reason_id] }));

  const vacancyBarData = vacancies.map((v) => {
    const pubs = publications.filter((p) => p.vacancy_id === v.vacancy_id);
    const pubIds = pubs.map((p) => p.publication_id);
    const count = candidates.filter((c) => pubIds.includes(c.publication_id)).length;
    return { name: v.title.length > 20 ? v.title.slice(0, 20) + '…' : v.title, кандидаты: count };
  });

  return (
    <div>
      <h2 className={styles.title}>Аналитика</h2>
      <div className={styles.filterRow}>
        <label className={styles.filterLabel}>Фильтр по вакансии:</label>
        <select className={styles.filterSelect} value={selectedVacancyId} onChange={(e) => setSelectedVacancyId(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
          <option value="all">Все вакансии</option>
          {vacancies.map((v) => (
            <option key={v.vacancy_id} value={v.vacancy_id}>{v.title}</option>
          ))}
        </select>
      </div>
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Воронка кандидатов</h3>
          <ResponsiveContainer width="100%" height={300}>
            <FunnelChart>
              <Tooltip />
              <Funnel dataKey="value" data={funnelData} isAnimationActive>
                <LabelList position="right" fill="#ccc" stroke="none" dataKey="name" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Причины отказов</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className={styles.empty}>Отказов нет</p>
          )}
        </div>
        <div className={`${styles.card} ${styles.cardFull}`}>
          <h3 className={styles.cardTitle}>Кандидаты по вакансиям</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={vacancyBarData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} width={160} />
              <Tooltip contentStyle={{ background: '#1a1f36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem' }} />
              <Bar dataKey="кандидаты" fill="#4f8ef7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

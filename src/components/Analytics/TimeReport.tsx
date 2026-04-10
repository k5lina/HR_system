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
  const {
    candidates, publications, vacancies, requests, departmentPositions, departments,
    interviews, securityChecks, medicalChecks, currentUser,
  } = useApp();

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

  // Candidates that pass dept/vacancy filter
  const filteredCandidateIds = useMemo(() => {
    return new Set(
      candidates.filter((c) => {
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
        return true;
      }).map((c) => c.candidate_id),
    );
  }, [candidates, publications, vacancies, requests, departmentPositions, deptId, vacancyId]);

  /** Returns average days for a list of {start, end} pairs, or null if no valid pairs. */
  function avgDays(pairs: { start: string; end: string }[]): number | null {
    const valid = pairs.filter((p) => p.start && p.end);
    if (valid.length === 0) return null;
    return valid.reduce((sum, p) => sum + daysBetween(p.start, p.end), 0) / valid.length;
  }

  // Stage time data for bar chart (stages 2 & 3 use interviews; 4 = secChecks; 5 = medChecks)
  const stageTimeData = useMemo(() => {
    const phoneInterviews = interviews.filter(
      (i) => i.stage_id === 2 && i.scheduled_at && i.finished_at && filteredCandidateIds.has(i.candidate_id),
    );
    const mainInterviews = interviews.filter(
      (i) => i.stage_id === 3 && i.scheduled_at && i.finished_at && filteredCandidateIds.has(i.candidate_id),
    );
    const secChecks = securityChecks.filter(
      (s) => s.finished_at && filteredCandidateIds.has(s.candidate_id),
    );
    const medChecks = medicalChecks.filter(
      (m) => m.finished_at && filteredCandidateIds.has(m.candidate_id),
    );

    // T1: Анализ резюме — pub.published_at → phone interview created_at
    const t1Pairs = interviews
      .filter((i) => i.stage_id === 2 && filteredCandidateIds.has(i.candidate_id))
      .map((i) => {
        const cand = candidates.find((c) => c.candidate_id === i.candidate_id);
        const pub = cand ? publications.find((p) => p.publication_id === cand.publication_id) : null;
        return { start: pub?.published_at ?? '', end: i.created_at };
      });

    return [
      { name: 'Анализ резюме',                  days: Math.round(avgDays(t1Pairs) ?? 0) },
      { name: 'Телефонное интервью',             days: Math.round(avgDays(phoneInterviews.map((i) => ({ start: i.scheduled_at, end: i.finished_at! }))) ?? 0) },
      { name: 'Собеседование с руководителем',   days: Math.round(avgDays(mainInterviews.map((i) => ({ start: i.scheduled_at, end: i.finished_at! }))) ?? 0) },
      { name: 'Проверка СБ',                     days: Math.round(avgDays(secChecks.map((s) => ({ start: s.created_at, end: s.finished_at! }))) ?? 0) },
      { name: 'Медицинская проверка',            days: Math.round(avgDays(medChecks.map((m) => ({ start: m.created_at, end: m.finished_at! }))) ?? 0) },
    ];
  }, [interviews, securityChecks, medicalChecks, candidates, publications, filteredCandidateIds]);

  /**
   * T_закр = Σ T_m  (m = 1..5)
   * Формула из документации: сумма средних времён по всем 5 этапам воронки.
   */
  const avgClosureDays = useMemo(() => {
    const phoneInterviews = interviews.filter(
      (i) => i.stage_id === 2 && filteredCandidateIds.has(i.candidate_id),
    );
    const mainInterviews = interviews.filter(
      (i) => i.stage_id === 3 && filteredCandidateIds.has(i.candidate_id),
    );
    const secChecks = securityChecks.filter((s) => filteredCandidateIds.has(s.candidate_id));
    const medChecks = medicalChecks.filter((m) => filteredCandidateIds.has(m.candidate_id));

    // T1: pub.published_at → phone interview created_at
    const t1Pairs = phoneInterviews.map((i) => {
      const cand = candidates.find((c) => c.candidate_id === i.candidate_id);
      const pub = cand ? publications.find((p) => p.publication_id === cand.publication_id) : null;
      return { start: pub?.published_at ?? '', end: i.created_at };
    });

    // T2: phone interview scheduled_at → finished_at
    const t2Pairs = phoneInterviews
      .filter((i) => i.scheduled_at && i.finished_at)
      .map((i) => ({ start: i.scheduled_at, end: i.finished_at! }));

    // T3: main interview scheduled_at → finished_at
    const t3Pairs = mainInterviews
      .filter((i) => i.scheduled_at && i.finished_at)
      .map((i) => ({ start: i.scheduled_at, end: i.finished_at! }));

    // T4: securityCheck created_at → finished_at
    const t4Pairs = secChecks
      .filter((s) => s.finished_at)
      .map((s) => ({ start: s.created_at, end: s.finished_at! }));

    // T5: medicalCheck created_at → finished_at
    const t5Pairs = medChecks
      .filter((m) => m.finished_at)
      .map((m) => ({ start: m.created_at, end: m.finished_at! }));

    const stageTimes = [
      avgDays(t1Pairs),
      avgDays(t2Pairs),
      avgDays(t3Pairs),
      avgDays(t4Pairs),
      avgDays(t5Pairs),
    ];

    // If none of the stages have data — show nothing
    if (stageTimes.every((t) => t === null)) return null;

    // T_закр = Σ T_m (null stages contribute 0)
    return Math.round(stageTimes.reduce<number>((sum, t) => sum + (t ?? 0), 0));
  }, [interviews, securityChecks, medicalChecks, candidates, publications, filteredCandidateIds]);

  return (
    <div className={formStyles.section}>
      {/* Header */}
      <div className={formStyles.header}>
        <button className={formStyles.backBtn} onClick={() => navigate('/home')}>
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

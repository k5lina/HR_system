import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import styles from '../Requests/Requests.module.css';

export default function VacancyList() {
  const { vacancies, vacancyStatuses, requests, departmentPositions, departments, positions } = useApp();

  function getStatusName(id: number) {
    return vacancyStatuses.find((s) => s.vacancy_status_id === id)?.name ?? '—';
  }

  function getStatusClass(id: number) {
    const map: Record<number, string> = { 1: styles.statusNew, 2: styles.statusWork, 3: styles.statusRejected };
    return map[id] ?? '';
  }

  function getPositionName(vacancyId: number) {
    const vac = vacancies.find((v) => v.vacancy_id === vacancyId);
    if (!vac) return '—';
    const req = requests.find((r) => r.request_id === vac.request_id);
    if (!req) return '—';
    const dp = departmentPositions.find((d) => d.department_position_id === req.department_position_id);
    if (!dp) return '—';
    return positions.find((p) => p.position_id === dp.position_id)?.name ?? '—';
  }

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Вакансии</h2>
        <Link to="/vacancies/new" className={styles.btnNew}>+ Новая вакансия</Link>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>№</th>
              <th>Название</th>
              <th>Должность</th>
              <th>Дата создания</th>
              <th>Статус</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {vacancies.map((v) => (
              <tr key={v.vacancy_id}>
                <td>#{v.vacancy_id}</td>
                <td>{v.title}</td>
                <td>{getPositionName(v.vacancy_id)}</td>
                <td>{new Date(v.created_at).toLocaleDateString('ru-RU')}</td>
                <td>
                  <span className={`${styles.badge} ${getStatusClass(v.vacancy_status_id)}`}>
                    {getStatusName(v.vacancy_status_id)}
                  </span>
                </td>
                <td>
                  <Link to={`/vacancies/${v.vacancy_id}`} className={styles.linkBtn}>Открыть</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vacancies.length === 0 && <p className={styles.empty}>Вакансий нет</p>}
      </div>
    </div>
  );
}

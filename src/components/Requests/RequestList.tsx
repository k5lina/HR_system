import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import styles from './Requests.module.css';

export default function RequestList() {
  const { requests, requestStatuses, departmentPositions, departments, positions, users, currentUser } = useApp();

  const visibleRequests = currentUser?.role_id === 3
    ? requests.filter((r) => r.user_id === currentUser.user_id)
    : requests;

  function getStatusName(id: number) {
    return requestStatuses.find((s) => s.request_status_id === id)?.name ?? '—';
  }

  function getDeptPos(dpId: number) {
    const dp = departmentPositions.find((d) => d.department_position_id === dpId);
    if (!dp) return '—';
    const dept = departments.find((d) => d.department_id === dp.department_id)?.name ?? '';
    const pos = positions.find((p) => p.position_id === dp.position_id)?.name ?? '';
    return `${dept} / ${pos}`;
  }

  function getStatusClass(id: number) {
    const map: Record<number, string> = { 1: styles.statusNew, 2: styles.statusWork, 3: styles.statusDone, 4: styles.statusRejected };
    return map[id] ?? '';
  }

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Заявки на подбор персонала</h2>
        {(currentUser?.role_id === 1 || currentUser?.role_id === 3) && (
          <Link to="/requests/new" className={styles.btnNew}>+ Новая заявка</Link>
        )}
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>№</th>
              <th>Дата</th>
              <th>Отдел / Должность</th>
              <th>Статус</th>
              <th>Автор</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visibleRequests.map((req) => {
              const author = users.find((u) => u.user_id === req.user_id);
              return (
                <tr key={req.request_id}>
                  <td>#{req.request_id}</td>
                  <td>{new Date(req.created_at).toLocaleDateString('ru-RU')}</td>
                  <td>{getDeptPos(req.department_position_id)}</td>
                  <td>
                    <span className={`${styles.badge} ${getStatusClass(req.request_status_id)}`}>
                      {getStatusName(req.request_status_id)}
                    </span>
                  </td>
                  <td>{author ? `${author.last_name} ${author.first_name}` : '—'}</td>
                  <td>
                    <Link to={`/requests/${req.request_id}`} className={styles.linkBtn}>Открыть</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visibleRequests.length === 0 && (
          <p className={styles.empty}>Заявок нет</p>
        )}
      </div>
    </div>
  );
}

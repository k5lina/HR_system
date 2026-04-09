import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import styles from './Layout.module.css';

interface NavItem {
  to: string;
  label: string;
  roles: number[];
}

const NAV: NavItem[] = [
  { to: '/requests', label: 'Заявки', roles: [1, 2, 3] },
  { to: '/vacancies', label: 'Вакансии', roles: [1, 2] },
  { to: '/published', label: 'Публикации', roles: [1, 2] },
  { to: '/analytics', label: 'Аналитика', roles: [1, 2, 3] },
  { to: '/directories', label: 'Справочники', roles: [1] },
];

export default function Layout() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const roleLabel = currentUser?.role_id === 1
    ? 'Администратор'
    : currentUser?.role_id === 2
    ? 'Менеджер'
    : 'Руководитель';

  const allowedNav = NAV.filter((n) => currentUser && n.roles.includes(currentUser.role_id));

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>👥</span>
          <span className={styles.brandText}>HR System</span>
        </div>
        <nav className={styles.nav}>
          {allowedNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.userBlock}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{currentUser?.full_name}</span>
            <span className={styles.userRole}>{roleLabel}</span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>Выйти</button>
        </div>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

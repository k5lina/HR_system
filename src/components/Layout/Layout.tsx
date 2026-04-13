import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp, resetAllData } from '../../context/AppContext';
import styles from './Layout.module.css';

interface NavItem { to: string; label: string; roles: number[] }

const NAV: NavItem[] = [
  { to: '/home',       label: 'Главная',                    roles: [1, 2, 3] },
  { to: '/requests',   label: 'Заявки на подбор персонала', roles: [1, 2, 3] },
  { to: '/vacancies',  label: 'Вакансии',                   roles: [1, 2] },
  { to: '/selection',  label: 'Отбор кандидатов',            roles: [1, 2, 3] },
  { to: '/directories',label: 'Справочники',                roles: [1] },
];

const PAGE_TITLES: Record<string, string> = {
  '/home':        'Главная',
  '/requests':    'Заявки на подбор персонала',
  '/vacancies':   'Вакансии',
  '/selection':   'Отбор кандидатов',
  '/analytics/funnel':  'Аналитика',
  '/analytics/time':    'Аналитика',
  '/analytics/reasons': 'Аналитика',
  '/analytics':         'Аналитика',
  '/directories': 'Справочники',
};

const ROLE_LABEL: Record<number, string> = {
  1: 'Системный администратор',
  2: 'Менеджер по подбору персонала',
  3: 'Главный технолог',
};

export default function Layout() {
  const { currentUser, logout, positions } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const roleId = currentUser?.role_id ?? 2;
  const allowedNav = NAV.filter((n) => n.roles.includes(roleId));

  const posName = currentUser
    ? (positions.find((p) => p.position_id === currentUser.position_id)?.name ?? ROLE_LABEL[roleId])
    : '';

  const pageTitle =
    Object.entries(PAGE_TITLES).find(([path]) => location.pathname.startsWith(path))?.[1] ?? '';

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <img src="/logo.png" alt="Логотип" className={styles.logoImg} />
          <span className={styles.logoText}>ИС «Подбор{'\n'}персонала»</span>
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
      </aside>

      <div className={styles.body}>
        <header className={styles.topbar}>
          <span className={styles.pageTitle}>{pageTitle}</span>
          <div className={styles.userCard}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{currentUser?.full_name}</span>
              <span className={styles.userRole}>{posName}</span>
            </div>
            {roleId === 1 && (
              <button
                className={styles.logoutBtn}
                style={{ marginRight: '0.5rem', background: 'none', color: 'var(--red-400)', border: '1px solid var(--red-200)' }}
                onClick={() => {
                  if (window.confirm('Сбросить все данные к начальным? Все созданные записи будут удалены.')) {
                    resetAllData();
                  }
                }}
              >
                Сбросить данные
              </button>
            )}
            <button className={styles.logoutBtn} onClick={handleLogout}>Выйти</button>
          </div>
        </header>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

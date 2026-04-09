import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import styles from './Auth.module.css';

const DEMO_USERS = [
  { label: 'Администратор — Петров П.П.', email: 'admin@ecomenu.ru', password: 'admin123' },
  { label: 'Менеджер по подбору персонала', email: 'manager@ecomenu.ru', password: 'manager123' },
  { label: 'Руководитель подразделения', email: 'head@ecomenu.ru', password: 'head123' },
];

export default function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = login(email, password);
    if (ok) {
      navigate('/home');
    } else {
      setError('Неверный логин или пароль');
    }
  }

  function fillDemo(e: string, p: string) {
    setEmail(e);
    setPassword(p);
    setError('');
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.leftPanel}>
        <div className={styles.logoBlock}>
          <img src="/logo.png" alt="Логотип" className={styles.logoImg} />
          <span className={styles.brandName}>ИС «Подбор персонала»</span>
          <span className={styles.brandSub}>ООО «Эко-Меню»</span>
        </div>
      </div>
      <div className={styles.rightPanel}>
        <div className={styles.card}>
          <h1 className={styles.cardTitle}>Добро пожаловать!</h1>
          <p className={styles.cardSub}>Введите данные для входа в систему</p>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Логин</label>
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@ecomenu.ru"
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Пароль</label>
              <input
                type="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.btn}>Войти</button>
          </form>
          <div className={styles.demo}>
            <p className={styles.demoTitle}>Быстрый вход (демо)</p>
            {DEMO_USERS.map((u) => (
              <button key={u.email} className={styles.demoBtn} onClick={() => fillDemo(u.email, u.password)}>
                {u.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

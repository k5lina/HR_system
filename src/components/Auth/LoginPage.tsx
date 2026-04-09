import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import styles from './Auth.module.css';

const DEMO_USERS = [
  { label: 'Администратор', email: 'admin@ecomenu.ru', password: 'admin123' },
  { label: 'Менеджер по подбору', email: 'manager@ecomenu.ru', password: 'manager123' },
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
      navigate('/requests');
    } else {
      setError('Неверный email или пароль');
    }
  }

  function fillDemo(e: string, p: string) {
    setEmail(e);
    setPassword(p);
    setError('');
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>👥</span>
          <h1 className={styles.title}>ИС «Подбор персонала»</h1>
          <p className={styles.subtitle}>ООО «Эко-Меню»</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
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
          <p className={styles.demoTitle}>Демо-доступ:</p>
          {DEMO_USERS.map((u) => (
            <button key={u.email} className={styles.demoBtn} onClick={() => fillDemo(u.email, u.password)}>
              {u.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

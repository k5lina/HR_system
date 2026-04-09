import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import styles from '../Requests/Requests.module.css';
import dirStyles from './Directories.module.css';

type DirKey = 'departments' | 'positions' | 'employmentTypes' | 'contractTypes' | 'searchChannels' | 'rejectionReasons' | 'emailTemplates' | 'users';

const DIR_TABS: { key: DirKey; label: string }[] = [
  { key: 'departments', label: 'Отделы' },
  { key: 'positions', label: 'Должности' },
  { key: 'employmentTypes', label: 'Типы занятости' },
  { key: 'contractTypes', label: 'Типы договора' },
  { key: 'searchChannels', label: 'Каналы поиска' },
  { key: 'rejectionReasons', label: 'Причины отказа' },
  { key: 'emailTemplates', label: 'Шаблоны писем' },
  { key: 'users', label: 'Пользователи' },
];

export default function DirectoriesPage() {
  const [activeTab, setActiveTab] = useState<DirKey>('departments');
  const {
    departments, positions, personnelTypes, employmentTypes, contractTypes,
    searchChannels, rejectionReasons, emailTemplates, users, roles,
  } = useApp();

  function renderContent() {
    switch (activeTab) {
      case 'departments':
        return (
          <table className={styles.table}>
            <thead><tr><th>ID</th><th>Название</th></tr></thead>
            <tbody>{departments.map((d) => (
              <tr key={d.department_id}><td>{d.department_id}</td><td>{d.name}</td></tr>
            ))}</tbody>
          </table>
        );
      case 'positions':
        return (
          <table className={styles.table}>
            <thead><tr><th>ID</th><th>Должность</th><th>Тип персонала</th></tr></thead>
            <tbody>{positions.map((p) => (
              <tr key={p.position_id}>
                <td>{p.position_id}</td>
                <td>{p.name}</td>
                <td>{personnelTypes.find((pt) => pt.personnel_type_id === p.personnel_type_id)?.name}</td>
              </tr>
            ))}</tbody>
          </table>
        );
      case 'employmentTypes':
        return (
          <table className={styles.table}>
            <thead><tr><th>ID</th><th>Название</th></tr></thead>
            <tbody>{employmentTypes.map((et) => (
              <tr key={et.employment_type_id}><td>{et.employment_type_id}</td><td>{et.name}</td></tr>
            ))}</tbody>
          </table>
        );
      case 'contractTypes':
        return (
          <table className={styles.table}>
            <thead><tr><th>ID</th><th>Название</th></tr></thead>
            <tbody>{contractTypes.map((ct) => (
              <tr key={ct.contract_type_id}><td>{ct.contract_type_id}</td><td>{ct.name}</td></tr>
            ))}</tbody>
          </table>
        );
      case 'searchChannels':
        return (
          <table className={styles.table}>
            <thead><tr><th>ID</th><th>Название</th><th>URL</th><th>Описание</th></tr></thead>
            <tbody>{searchChannels.map((sc) => (
              <tr key={sc.channel_id}>
                <td>{sc.channel_id}</td><td>{sc.name}</td>
                <td><a href={sc.url} target="_blank" rel="noreferrer" style={{ color: '#4f8ef7' }}>{sc.url}</a></td>
                <td>{sc.description}</td>
              </tr>
            ))}</tbody>
          </table>
        );
      case 'rejectionReasons':
        return (
          <table className={styles.table}>
            <thead><tr><th>ID</th><th>Причина отказа</th></tr></thead>
            <tbody>{rejectionReasons.map((r) => (
              <tr key={r.rejection_reason_id}><td>{r.rejection_reason_id}</td><td>{r.name}</td></tr>
            ))}</tbody>
          </table>
        );
      case 'emailTemplates':
        return (
          <table className={styles.table}>
            <thead><tr><th>ID</th><th>Название</th><th>Тема</th><th>Текст</th></tr></thead>
            <tbody>{emailTemplates.map((t) => (
              <tr key={t.template_id}>
                <td>{t.template_id}</td><td>{t.name}</td><td>{t.subject}</td>
                <td style={{ maxWidth: '300px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{t.body}</td>
              </tr>
            ))}</tbody>
          </table>
        );
      case 'users':
        return (
          <table className={styles.table}>
            <thead><tr><th>ID</th><th>ФИО</th><th>Email</th><th>Роль</th><th>Активен</th></tr></thead>
            <tbody>{users.map((u) => (
              <tr key={u.user_id}>
                <td>{u.user_id}</td>
                <td>{u.last_name} {u.first_name} {u.middle_name ?? ''}</td>
                <td>{u.email}</td>
                <td>{roles.find((r) => r.role_id === u.role_id)?.name}</td>
                <td>{u.is_active ? '✓' : '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        );
      default:
        return null;
    }
  }

  return (
    <div>
      <h2 className={styles.title}>Справочники</h2>
      <div className={dirStyles.tabs}>
        {DIR_TABS.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? `${dirStyles.tab} ${dirStyles.tabActive}` : dirStyles.tab}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.tableWrap}>{renderContent()}</div>
    </div>
  );
}

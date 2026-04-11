import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { nextId } from '../../utils';
import type {
  Department, Position, EmploymentType, ContractType,
  SearchChannel, RejectionReason, EmailTemplate, User,
} from '../../types';
import styles from '../Requests/Requests.module.css';
import d from './Directories.module.css';

type DirKey = 'departments' | 'positions' | 'employmentTypes' | 'contractTypes'
  | 'searchChannels' | 'rejectionReasons' | 'emailTemplates' | 'users';

const DIR_TABS: { key: DirKey; label: string }[] = [
  { key: 'departments',     label: 'Отделы' },
  { key: 'positions',       label: 'Должности' },
  { key: 'employmentTypes', label: 'Типы занятости' },
  { key: 'contractTypes',   label: 'Типы договора' },
  { key: 'searchChannels',  label: 'Каналы поиска' },
  { key: 'rejectionReasons',label: 'Причины отказа' },
  { key: 'emailTemplates',  label: 'Шаблоны писем' },
  { key: 'users',           label: 'Пользователи' },
];

/* ── icon helpers ───────────────────────────────────── */
const EditIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M14.121 4.379a3 3 0 00-4.242 0L3 11.243v4.242h4.242l6.879-6.879a3 3 0 000-4.243zM10.5 7.5l2.25 2.25"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/>
  </svg>
);

/* ── modal state types ──────────────────────────────── */
type TemplateForm = { id: number | null; name: string; subject: string; body: string };
type UserForm = {
  id: number | null;
  last_name: string; first_name: string; middle_name: string;
  role_id: number; position_id: number;
  phone: string; email: string; password: string; is_active: boolean;
};
type SimpleForm = { id: number | null; name: string; extra1?: string; extra2?: string };
type Modal =
  | { kind: 'template'; form: TemplateForm }
  | { kind: 'user';     form: UserForm }
  | { kind: 'simple';   dir: DirKey; form: SimpleForm };

const BLANK_TEMPLATE: TemplateForm = { id: null, name: '', subject: '', body: '' };
const BLANK_USER: UserForm = {
  id: null, last_name: '', first_name: '', middle_name: '',
  role_id: 1, position_id: 1, phone: '', email: '', password: '', is_active: true,
};

export default function DirectoriesPage() {
  const [activeTab, setActiveTab] = useState<DirKey>('departments');
  const {
    departments, positions, personnelTypes, employmentTypes, contractTypes,
    searchChannels, rejectionReasons, emailTemplates, setEmailTemplates,
    users, setUsers, roles,
  } = useApp();

  /* simple dirs — local state (reference data, no persistence needed for prototype) */
  const [localDepts,    setLocalDepts]    = useState<Department[]>(departments);
  const [localPos,      setLocalPos]      = useState<Position[]>(positions);
  const [localEmpTypes, setLocalEmpTypes] = useState<EmploymentType[]>(employmentTypes);
  const [localContr,    setLocalContr]    = useState<ContractType[]>(contractTypes);
  const [localChannels, setLocalChannels] = useState<SearchChannel[]>(searchChannels);
  const [localReasons,  setLocalReasons]  = useState<RejectionReason[]>(rejectionReasons);

  const [modal, setModal] = useState<Modal | null>(null);

  /* ── helpers ─────────────────────────────────────── */
  function openAdd() {
    if (activeTab === 'emailTemplates') {
      setModal({ kind: 'template', form: { ...BLANK_TEMPLATE } });
    } else if (activeTab === 'users') {
      setModal({ kind: 'user', form: { ...BLANK_USER } });
    } else {
      setModal({ kind: 'simple', dir: activeTab, form: { id: null, name: '', extra1: '', extra2: '' } });
    }
  }

  function openEdit(record: any) {
    if (activeTab === 'emailTemplates') {
      const t = record as EmailTemplate;
      setModal({ kind: 'template', form: { id: t.template_id, name: t.name, subject: t.subject, body: t.body } });
    } else if (activeTab === 'users') {
      const u = record as User;
      setModal({ kind: 'user', form: {
        id: u.user_id, last_name: u.last_name, first_name: u.first_name,
        middle_name: u.middle_name ?? '', role_id: u.role_id,
        position_id: u.position_id, phone: u.phone, email: u.email,
        password: u.password, is_active: u.is_active,
      }});
    } else if (activeTab === 'departments') {
      const r = record as Department;
      setModal({ kind: 'simple', dir: activeTab, form: { id: r.department_id, name: r.name } });
    } else if (activeTab === 'positions') {
      const r = record as Position;
      setModal({ kind: 'simple', dir: activeTab, form: { id: r.position_id, name: r.name, extra1: String(r.personnel_type_id) } });
    } else if (activeTab === 'employmentTypes') {
      const r = record as EmploymentType;
      setModal({ kind: 'simple', dir: activeTab, form: { id: r.employment_type_id, name: r.name } });
    } else if (activeTab === 'contractTypes') {
      const r = record as ContractType;
      setModal({ kind: 'simple', dir: activeTab, form: { id: r.contract_type_id, name: r.name } });
    } else if (activeTab === 'searchChannels') {
      const r = record as SearchChannel;
      setModal({ kind: 'simple', dir: activeTab, form: { id: r.channel_id, name: r.name, extra1: r.url, extra2: r.description } });
    } else if (activeTab === 'rejectionReasons') {
      const r = record as RejectionReason;
      setModal({ kind: 'simple', dir: activeTab, form: { id: r.rejection_reason_id, name: r.name } });
    }
  }

  function handleDelete(id: number) {
    if (!window.confirm('Удалить запись?')) return;
    switch (activeTab) {
      case 'emailTemplates': setEmailTemplates((p) => p.filter((t) => t.template_id !== id)); break;
      case 'users':          setUsers((p) => p.filter((u) => u.user_id !== id)); break;
      case 'departments':    setLocalDepts((p) => p.filter((r) => r.department_id !== id)); break;
      case 'positions':      setLocalPos((p) => p.filter((r) => r.position_id !== id)); break;
      case 'employmentTypes':setLocalEmpTypes((p) => p.filter((r) => r.employment_type_id !== id)); break;
      case 'contractTypes':  setLocalContr((p) => p.filter((r) => r.contract_type_id !== id)); break;
      case 'searchChannels': setLocalChannels((p) => p.filter((r) => r.channel_id !== id)); break;
      case 'rejectionReasons':setLocalReasons((p) => p.filter((r) => r.rejection_reason_id !== id)); break;
    }
  }

  function saveTemplate(form: TemplateForm) {
    if (form.id === null) {
      setEmailTemplates((p) => [...p, {
        template_id: nextId(p, 'template_id'),
        name: form.name, subject: form.subject, body: form.body,
      }]);
    } else {
      setEmailTemplates((p) => p.map((t) => t.template_id === form.id
        ? { ...t, name: form.name, subject: form.subject, body: form.body } : t));
    }
    setModal(null);
  }

  function saveUser(form: UserForm) {
    if (form.id === null) {
      setUsers((p) => [...p, {
        user_id: nextId(p, 'user_id'),
        last_name: form.last_name, first_name: form.first_name,
        middle_name: form.middle_name || undefined,
        role_id: form.role_id, position_id: form.position_id,
        phone: form.phone, email: form.email, password: form.password,
        is_active: form.is_active,
      }]);
    } else {
      setUsers((p) => p.map((u) => u.user_id === form.id ? {
        ...u, last_name: form.last_name, first_name: form.first_name,
        middle_name: form.middle_name || undefined,
        role_id: form.role_id, position_id: form.position_id,
        phone: form.phone, email: form.email, password: form.password,
        is_active: form.is_active,
      } : u));
    }
    setModal(null);
  }

  function saveSimple(dir: DirKey, form: SimpleForm) {
    switch (dir) {
      case 'departments':
        setLocalDepts((p) => form.id === null
          ? [...p, { department_id: nextId(p, 'department_id'), name: form.name }]
          : p.map((r) => r.department_id === form.id ? { ...r, name: form.name } : r));
        break;
      case 'positions':
        setLocalPos((p) => form.id === null
          ? [...p, { position_id: nextId(p, 'position_id'), name: form.name, personnel_type_id: Number(form.extra1) || 1 }]
          : p.map((r) => r.position_id === form.id ? { ...r, name: form.name, personnel_type_id: Number(form.extra1) || r.personnel_type_id } : r));
        break;
      case 'employmentTypes':
        setLocalEmpTypes((p) => form.id === null
          ? [...p, { employment_type_id: nextId(p, 'employment_type_id'), name: form.name }]
          : p.map((r) => r.employment_type_id === form.id ? { ...r, name: form.name } : r));
        break;
      case 'contractTypes':
        setLocalContr((p) => form.id === null
          ? [...p, { contract_type_id: nextId(p, 'contract_type_id'), name: form.name }]
          : p.map((r) => r.contract_type_id === form.id ? { ...r, name: form.name } : r));
        break;
      case 'searchChannels':
        setLocalChannels((p) => form.id === null
          ? [...p, { channel_id: nextId(p, 'channel_id'), name: form.name, url: form.extra1 ?? '', description: form.extra2 ?? '' }]
          : p.map((r) => r.channel_id === form.id ? { ...r, name: form.name, url: form.extra1 ?? r.url, description: form.extra2 ?? r.description } : r));
        break;
      case 'rejectionReasons':
        setLocalReasons((p) => form.id === null
          ? [...p, { rejection_reason_id: nextId(p, 'rejection_reason_id'), name: form.name }]
          : p.map((r) => r.rejection_reason_id === form.id ? { ...r, name: form.name } : r));
        break;
    }
    setModal(null);
  }

  /* ── action column ───────────────────────────────── */
  function ActionCell({ record, id }: { record: any; id: number }) {
    return (
      <div className={styles.actionCell}>
        <button className={styles.actionIcon} title="Редактировать" onClick={() => openEdit(record)}>
          <EditIcon />
        </button>
        <button className={styles.actionIcon} title="Удалить" onClick={() => handleDelete(id)}>
          <TrashIcon />
        </button>
      </div>
    );
  }

  /* ── table content ───────────────────────────────── */
  function renderTable() {
    switch (activeTab) {
      case 'departments':
        return (
          <table className={styles.table}>
            <thead><tr><th>№</th><th>Название</th><th style={{ width: 70 }}></th></tr></thead>
            <tbody>{localDepts.map((r, i) => (
              <tr key={r.department_id}>
                <td>{i + 1}</td><td>{r.name}</td>
                <td><ActionCell record={r} id={r.department_id} /></td>
              </tr>
            ))}</tbody>
          </table>
        );
      case 'positions':
        return (
          <table className={styles.table}>
            <thead><tr><th>№</th><th>Должность</th><th>Тип персонала</th><th style={{ width: 70 }}></th></tr></thead>
            <tbody>{localPos.map((r, i) => (
              <tr key={r.position_id}>
                <td>{i + 1}</td><td>{r.name}</td>
                <td>{personnelTypes.find((pt) => pt.personnel_type_id === r.personnel_type_id)?.name ?? '—'}</td>
                <td><ActionCell record={r} id={r.position_id} /></td>
              </tr>
            ))}</tbody>
          </table>
        );
      case 'employmentTypes':
        return (
          <table className={styles.table}>
            <thead><tr><th>№</th><th>Название</th><th style={{ width: 70 }}></th></tr></thead>
            <tbody>{localEmpTypes.map((r, i) => (
              <tr key={r.employment_type_id}>
                <td>{i + 1}</td><td>{r.name}</td>
                <td><ActionCell record={r} id={r.employment_type_id} /></td>
              </tr>
            ))}</tbody>
          </table>
        );
      case 'contractTypes':
        return (
          <table className={styles.table}>
            <thead><tr><th>№</th><th>Название</th><th style={{ width: 70 }}></th></tr></thead>
            <tbody>{localContr.map((r, i) => (
              <tr key={r.contract_type_id}>
                <td>{i + 1}</td><td>{r.name}</td>
                <td><ActionCell record={r} id={r.contract_type_id} /></td>
              </tr>
            ))}</tbody>
          </table>
        );
      case 'searchChannels':
        return (
          <table className={styles.table}>
            <thead><tr><th>№</th><th>Название</th><th>URL</th><th>Описание</th><th style={{ width: 70 }}></th></tr></thead>
            <tbody>{localChannels.map((r, i) => (
              <tr key={r.channel_id}>
                <td>{i + 1}</td><td>{r.name}</td>
                <td><a href={r.url} target="_blank" rel="noreferrer" style={{ color: 'var(--red-400)' }}>{r.url}</a></td>
                <td>{r.description}</td>
                <td><ActionCell record={r} id={r.channel_id} /></td>
              </tr>
            ))}</tbody>
          </table>
        );
      case 'rejectionReasons':
        return (
          <table className={styles.table}>
            <thead><tr><th>№</th><th>Причина отказа</th><th style={{ width: 70 }}></th></tr></thead>
            <tbody>{localReasons.map((r, i) => (
              <tr key={r.rejection_reason_id}>
                <td>{i + 1}</td><td>{r.name}</td>
                <td><ActionCell record={r} id={r.rejection_reason_id} /></td>
              </tr>
            ))}</tbody>
          </table>
        );
      case 'emailTemplates':
        return (
          <table className={styles.table}>
            <thead><tr><th>№</th><th>Название</th><th>Тема</th><th>Текст письма</th><th style={{ width: 70 }}></th></tr></thead>
            <tbody>{emailTemplates.map((t, i) => (
              <tr key={t.template_id}>
                <td>{i + 1}</td><td>{t.name}</td><td>{t.subject}</td>
                <td style={{ maxWidth: 260, fontSize: '0.78rem', color: 'var(--text-light)' }}>{t.body}</td>
                <td><ActionCell record={t} id={t.template_id} /></td>
              </tr>
            ))}</tbody>
          </table>
        );
      case 'users':
        return (
          <table className={styles.table}>
            <thead><tr><th>№</th><th>ФИО</th><th>Роль</th><th>Электронная почта</th><th>Активен</th><th style={{ width: 70 }}></th></tr></thead>
            <tbody>{users.map((u, i) => (
              <tr key={u.user_id}>
                <td>{i + 1}</td>
                <td>{u.last_name} {u.first_name}{u.middle_name ? ' ' + u.middle_name : ''}</td>
                <td>{roles.find((r) => r.role_id === u.role_id)?.name ?? '—'}</td>
                <td>{u.email}</td>
                <td>{u.is_active ? 'Да' : 'Нет'}</td>
                <td><ActionCell record={u} id={u.user_id} /></td>
              </tr>
            ))}</tbody>
          </table>
        );
      default: return null;
    }
  }

  /* ── modal content ───────────────────────────────── */
  function renderModal() {
    if (!modal) return null;

    if (modal.kind === 'template') {
      const f = modal.form;
      const isEdit = f.id !== null;
      return (
        <div className={d.modalOverlay} onClick={() => setModal(null)}>
          <div className={d.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={d.modalHead}>
              <span className={d.modalTitle}>{isEdit ? 'Редактирование записи' : 'Новая запись'}</span>
              <button className={d.modalClose} onClick={() => setModal(null)}>✕</button>
            </div>
            <div className={d.autoField}>
              <div className={d.autoLabel}>№</div>
              <div className={d.autoValue}>{isEdit ? f.id : 'заполняется автоматически'}</div>
            </div>
            <div className={d.formGrid1}>
              <div className={d.formField}>
                <label className={d.formLabel}>Название</label>
                <input className={d.formInput} value={f.name}
                  onChange={(e) => setModal({ ...modal, form: { ...f, name: e.target.value } })} />
              </div>
              <div className={d.formField}>
                <label className={d.formLabel}>Тема письма</label>
                <input className={d.formInput} value={f.subject}
                  onChange={(e) => setModal({ ...modal, form: { ...f, subject: e.target.value } })} />
              </div>
              <div className={d.formField}>
                <label className={d.formLabel}>Текст письма</label>
                <textarea className={d.formTextarea} value={f.body}
                  onChange={(e) => setModal({ ...modal, form: { ...f, body: e.target.value } })} />
              </div>
            </div>
            <button className={d.modalSaveBtn} onClick={() => saveTemplate(f)}>Сохранить</button>
          </div>
        </div>
      );
    }

    if (modal.kind === 'user') {
      const f = modal.form;
      const isEdit = f.id !== null;
      return (
        <div className={d.modalOverlay} onClick={() => setModal(null)}>
          <div className={`${d.modalCard} ${d.modalCardWide}`} onClick={(e) => e.stopPropagation()}>
            <div className={d.modalHead}>
              <span className={d.modalTitle}>{isEdit ? 'Редактирование записи' : 'Новая запись'}</span>
              <button className={d.modalClose} onClick={() => setModal(null)}>✕</button>
            </div>
            <div className={d.autoField}>
              <div className={d.autoLabel}>№</div>
              <div className={d.autoValue}>{isEdit ? f.id : 'заполняется автоматически'}</div>
            </div>
            <div className={d.formGrid1}>
              <div className={d.formField}>
                <label className={d.formLabel}>Фамилия</label>
                <input className={d.formInput} value={f.last_name}
                  onChange={(e) => setModal({ ...modal, form: { ...f, last_name: e.target.value } })} />
              </div>
              <div className={d.formField}>
                <label className={d.formLabel}>Имя</label>
                <input className={d.formInput} value={f.first_name}
                  onChange={(e) => setModal({ ...modal, form: { ...f, first_name: e.target.value } })} />
              </div>
              <div className={d.formField}>
                <label className={d.formLabel}>Отчество</label>
                <input className={d.formInput} value={f.middle_name}
                  onChange={(e) => setModal({ ...modal, form: { ...f, middle_name: e.target.value } })} />
              </div>
              <div className={d.formField}>
                <label className={d.formLabel}>Роль</label>
                <select className={d.formSelect} value={f.role_id}
                  onChange={(e) => setModal({ ...modal, form: { ...f, role_id: Number(e.target.value) } })}>
                  {roles.map((r) => <option key={r.role_id} value={r.role_id}>{r.name}</option>)}
                </select>
              </div>
              <div className={d.formField}>
                <label className={d.formLabel}>Должность</label>
                <select className={d.formSelect} value={f.position_id}
                  onChange={(e) => setModal({ ...modal, form: { ...f, position_id: Number(e.target.value) } })}>
                  {localPos.map((p) => <option key={p.position_id} value={p.position_id}>{p.name}</option>)}
                </select>
              </div>
              <div className={d.formField}>
                <label className={d.formLabel}>Телефон</label>
                <input className={d.formInput} value={f.phone}
                  onChange={(e) => setModal({ ...modal, form: { ...f, phone: e.target.value } })} />
              </div>
              <div className={d.formField}>
                <label className={d.formLabel}>Почта</label>
                <input className={d.formInput} type="email" value={f.email}
                  onChange={(e) => setModal({ ...modal, form: { ...f, email: e.target.value } })} />
              </div>
              <div className={d.formField}>
                <label className={d.formLabel}>Пароль</label>
                <input className={d.formInput} type="password" value={f.password}
                  onChange={(e) => setModal({ ...modal, form: { ...f, password: e.target.value } })} />
              </div>
              <div className={d.formField}>
                <label className={d.formLabel}>Активен</label>
                <div className={d.checkboxRow}>
                  <input type="checkbox" checked={f.is_active}
                    onChange={(e) => setModal({ ...modal, form: { ...f, is_active: e.target.checked } })} />
                  <span style={{ fontSize: '0.8125rem' }}>{f.is_active ? 'Да' : 'Нет'}</span>
                </div>
              </div>
            </div>
            <button className={d.modalSaveBtn} onClick={() => saveUser(f)}>Сохранить</button>
          </div>
        </div>
      );
    }

    if (modal.kind === 'simple') {
      const { dir, form: f } = modal;
      const isEdit = f.id !== null;
      const showExtra1 = dir === 'positions' || dir === 'searchChannels';
      const showExtra2 = dir === 'searchChannels';

      return (
        <div className={d.modalOverlay} onClick={() => setModal(null)}>
          <div className={d.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={d.modalHead}>
              <span className={d.modalTitle}>{isEdit ? 'Редактирование записи' : 'Новая запись'}</span>
              <button className={d.modalClose} onClick={() => setModal(null)}>✕</button>
            </div>
            <div className={d.autoField}>
              <div className={d.autoLabel}>№</div>
              <div className={d.autoValue}>{isEdit ? f.id : 'заполняется автоматически'}</div>
            </div>
            <div className={d.formGrid1}>
              <div className={d.formField}>
                <label className={d.formLabel}>Название</label>
                <input className={d.formInput} value={f.name}
                  onChange={(e) => setModal({ ...modal, form: { ...f, name: e.target.value } })} />
              </div>
              {dir === 'positions' && (
                <div className={d.formField}>
                  <label className={d.formLabel}>Тип персонала</label>
                  <select className={d.formSelect} value={f.extra1 ?? '1'}
                    onChange={(e) => setModal({ ...modal, form: { ...f, extra1: e.target.value } })}>
                    {personnelTypes.map((pt) => (
                      <option key={pt.personnel_type_id} value={pt.personnel_type_id}>{pt.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {showExtra1 && dir === 'searchChannels' && (
                <div className={d.formField}>
                  <label className={d.formLabel}>URL</label>
                  <input className={d.formInput} value={f.extra1 ?? ''}
                    onChange={(e) => setModal({ ...modal, form: { ...f, extra1: e.target.value } })} />
                </div>
              )}
              {showExtra2 && (
                <div className={d.formField}>
                  <label className={d.formLabel}>Описание</label>
                  <input className={d.formInput} value={f.extra2 ?? ''}
                    onChange={(e) => setModal({ ...modal, form: { ...f, extra2: e.target.value } })} />
                </div>
              )}
            </div>
            <button className={d.modalSaveBtn} onClick={() => saveSimple(dir, f)}>Сохранить</button>
          </div>
        </div>
      );
    }

    return null;
  }

  /* ── render ──────────────────────────────────────── */
  return (
    <div>
      <div className={d.tabs}>
        {DIR_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${d.tab} ${activeTab === tab.key ? d.tabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.topActions}>
        <button className={styles.btnToolbar} onClick={openAdd}>
          Создать новую запись
        </button>
      </div>

      <div className={styles.tableWrap}>
        {renderTable()}
      </div>

      {renderModal()}
    </div>
  );
}

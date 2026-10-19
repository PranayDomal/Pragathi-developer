import { Component, computed, effect, HostListener, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { AdminService, TableName } from '../../core/services/admin.service';
import { AdminUser, UsersService, UserRole } from '../../core/services/users.service';

type Row = Record<string, any>;

interface Col {
  key: string;
  label: string;
  edit?: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'bool';
  options?: string[] | 'rooms';
  kind?: 'datetime';
  badge?: boolean;
}

// A question shown in a popup before something risky happens.
interface Ask {
  title: string;
  message: string;
  confirmText: string;
  danger?: boolean;
  password?: boolean;
  run: (value: string) => void;
}

const ACTIVITY_TYPES = ['Enquiry', 'SiteVisit', 'FloorPlanDownload', 'BrochureDownload', 'ContactMessage', 'Chat'];
const VISIT_STATUSES = ['Requested', 'Confirmed', 'Completed', 'Cancelled'];

const ROLE_INFO = [
  { name: 'Viewer', blurb: 'Can look at everything but cannot change anything.' },
  { name: 'Editor', blurb: 'Can also edit and delete leads, activities and visits.' },
  { name: 'Superuser', blurb: 'Full access, including adding and managing admin users.' },
];

const PERMISSIONS: { label: string; viewer: boolean; editor: boolean; superuser: boolean }[] = [
  { label: 'View leads, activities, visits and configurations', viewer: true, editor: true, superuser: true },
  { label: 'Edit leads, activities and visits', viewer: false, editor: true, superuser: true },
  { label: 'Delete records', viewer: false, editor: true, superuser: true },
  { label: 'Add admin users', viewer: false, editor: false, superuser: true },
  { label: 'Change roles, switch accounts off, reset passwords', viewer: false, editor: false, superuser: true },
];

const TABLES: { key: TableName; label: string; single: string; locked?: boolean; cols: Col[] }[] = [
  {
    key: 'leads', label: 'Leads', single: 'lead',
    cols: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name', edit: 'text' },
      { key: 'phone', label: 'Phone', edit: 'text' },
      { key: 'email', label: 'Email', edit: 'text' },
      { key: 'createdAt', label: 'Created', kind: 'datetime' },
      { key: 'updatedAt', label: 'Updated', kind: 'datetime' },
    ],
  },
  {
    key: 'activities', label: 'Activities', single: 'activity',
    cols: [
      { key: 'id', label: 'ID' },
      { key: 'leadName', label: 'Lead' },
      { key: 'type', label: 'Type', edit: 'select', options: ACTIVITY_TYPES, badge: true },
      { key: 'configuration', label: 'Configuration', edit: 'select', options: 'rooms' },
      { key: 'homeLoan', label: 'Home loan', edit: 'bool', badge: true },
      { key: 'message', label: 'Message', edit: 'textarea' },
      { key: 'detail', label: 'Detail', edit: 'text' },
      { key: 'createdAt', label: 'Created', kind: 'datetime' },
    ],
  },
  {
    key: 'visits', label: 'Visits', single: 'visit',
    cols: [
      { key: 'id', label: 'ID' },
      { key: 'leadName', label: 'Lead' },
      { key: 'preferredDate', label: 'Date', edit: 'date' },
      { key: 'timeSlot', label: 'Time slot', edit: 'text' },
      { key: 'visitors', label: 'Visitors', edit: 'number' },
      { key: 'status', label: 'Status', edit: 'select', options: VISIT_STATUSES, badge: true },
      { key: 'createdAt', label: 'Created', kind: 'datetime' },
    ],
  },
  {
    key: 'configurations', label: 'Configurations', single: 'configuration', locked: true,
    cols: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'sortOrder', label: 'Sort order' },
    ],
  },
];

@Component({
  selector: 'app-admin-page',
  imports: [],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css',
})
export class AdminPage {
  private router = inject(Router);
  private admin = inject(AdminService);
  private auth = inject(AdminAuthService);
  private usersApi = inject(UsersService);

  // ---------- Who is signed in ----------
  isSuperuser = this.auth.isSuperuser();
  // Viewer: false. Editor and Superuser: true.
  canEdit = this.auth.canEdit();
  who = this.auth.name();
  role = this.auth.role();
  initials =
    (this.who ?? '').split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?';

  // ---------- Screen state ----------
  showDash = signal(true);
  showUsers = signal(false);
  users = signal<AdminUser[]>([]);
  showAdd = signal(false);
  roleInfo = ROLE_INFO;
  permissions = PERMISSIONS;
  skeletonRows = [1, 2, 3, 4, 5];

  search = signal('');

  tables = TABLES;
  active = signal<TableName>('leads');
  data = signal<Record<TableName, Row[]>>({ leads: [], activities: [], visits: [], configurations: [] });
  loading = signal(false);
  slow = signal(false); // true when loading takes a while (the free server is probably waking up)
  saving = signal(false);
  error = signal('');
  info = signal('');

  editingId = signal<number | null>(null);
  draft: Row = {};

  // ---------- "Are you sure?" popup ----------
  asking = signal<Ask | null>(null);
  askValue = signal('');
  askError = signal('');

  // ---------- Sorting and pages ----------
  sortKey = signal<string>('');
  sortDir = signal<'asc' | 'desc'>('asc');
  page = signal(0);
  pageSize = signal(10);

  current = computed(() => TABLES.find((t) => t.key === this.active())!);

  rows = computed(() => {
    let list = this.data()[this.active()];
    const q = this.search().trim().toLowerCase();
    if (q) {
      const cols = this.current().cols;
      list = list.filter((row) => cols.some((c) => this.show(row, c).toLowerCase().includes(q)));
    }
    const key = this.sortKey();
    if (key) {
      const col = this.current().cols.find((c) => c.key === key);
      const dir = this.sortDir() === 'asc' ? 1 : -1;
      list = [...list].sort((a, b) => dir * this.compare(a[key], b[key], col));
    }
    return list;
  });

  pageCount = computed(() => Math.max(1, Math.ceil(this.rows().length / this.pageSize())));
  currentPage = computed(() => Math.min(this.page(), this.pageCount() - 1));
  pagedRows = computed(() => {
    const start = this.currentPage() * this.pageSize();
    return this.rows().slice(start, start + this.pageSize());
  });
  rangeText = computed(() => {
    const total = this.rows().length;
    if (!total) return '0 records';
    const start = this.currentPage() * this.pageSize();
    return `${start + 1}–${Math.min(start + this.pageSize(), total)} of ${total}`;
  });
  editingRow = computed(() => this.data()[this.active()].find((r) => r['id'] === this.editingId()));

  filteredUsers = computed(() => {
    const all = this.users();
    const q = this.search().trim().toLowerCase();
    if (!q) return all;
    return all.filter((u) =>
      [String(u.id), u.loginId, u.name, u.role, u.isActive ? 'yes' : 'no'].some((v) =>
        v.toLowerCase().includes(q),
      ),
    );
  });

  rooms = computed(() => this.data().configurations.map((c) => String(c['name'])));

  // ---------- Dashboard numbers ----------
  stats = computed(() => {
    const d = this.data();
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return {
      leads: d.leads.length,
      newThisWeek: d.leads.filter((l) => new Date(l['createdAt']).getTime() >= weekAgo).length,
      visits: d.visits.length,
      pendingVisits: d.visits.filter((v) => v['status'] === 'Requested').length,
      activities: d.activities.length,
      configurations: d.configurations.length,
    };
  });

  leadsByDay = computed(() => {
    const days: { key: string; label: string; count: number; pct: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 13; i >= 0; i--) {
      const dt = new Date(today);
      dt.setDate(today.getDate() - i);
      days.push({
        key: dt.toDateString(),
        label: dt.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
        count: 0,
        pct: 0,
      });
    }
    for (const l of this.data().leads) {
      const day = days.find((x) => x.key === new Date(l['createdAt']).toDateString());
      if (day) day.count++;
    }
    const max = Math.max(1, ...days.map((x) => x.count));
    for (const x of days) x.pct = Math.round((x.count / max) * 100);
    return days;
  });

  recentLeads = computed(() =>
    [...this.data().leads]
      .sort((a, b) => new Date(b['createdAt']).getTime() - new Date(a['createdAt']).getTime())
      .slice(0, 6),
  );

  visitsByStatus = computed(() => this.countBy(this.data().visits, 'status'));
  activitiesByType = computed(() => this.countBy(this.data().activities, 'type'));

  constructor() {
    // The "Saved." note fades away on its own after a few seconds.
    effect((onCleanup) => {
      if (!this.info()) return;
      const t = setTimeout(() => this.info.set(''), 3500);
      onCleanup(() => clearTimeout(t));
    });

    // If loading drags on, the free server is probably waking up: say so.
    effect((onCleanup) => {
      if (!this.loading()) {
        this.slow.set(false);
        return;
      }
      const t = setTimeout(() => this.slow.set(true), 5000);
      onCleanup(() => clearTimeout(t));
    });

    // Opened the URL directly without signing in? Send them home.
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/');
      return;
    }
    this.loadAll();
    if (this.isSuperuser) this.loadUsers();
  }

  // Escape closes whichever popup is open.
  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.asking()) this.askCancel();
    else if (this.editingId() !== null) this.cancelEdit();
    else if (this.showAdd()) this.toggleAdd();
  }

  // ---------- Popup: "Are you sure?" ----------
  ask(a: Ask) {
    this.askValue.set('');
    this.askError.set('');
    this.asking.set(a);
  }

  askCancel() {
    this.asking.set(null);
  }

  onAskInput(event: Event) {
    this.askValue.set((event.target as HTMLInputElement).value);
    this.askError.set('');
  }

  askOk() {
    const a = this.asking();
    if (!a) return;
    if (a.password && this.askValue().length < 8) {
      this.askError.set('Password must be at least 8 characters.');
      return;
    }
    this.asking.set(null);
    a.run(this.askValue());
  }

  // ---------- Navigation ----------
  onSearch(event: Event) {
    this.search.set((event.target as HTMLInputElement).value);
    this.page.set(0);
  }

  sortBy(key: string) {
    if (this.sortKey() === key) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
    this.page.set(0);
  }

  goPage(n: number) {
    this.page.set(Math.max(0, Math.min(n, this.pageCount() - 1)));
  }

  setPageSize(event: Event) {
    this.pageSize.set(Number((event.target as HTMLSelectElement).value));
    this.page.set(0);
  }

  openDash() {
    this.showDash.set(true);
    this.showUsers.set(false);
    this.editingId.set(null);
    this.error.set('');
    this.info.set('');
    this.search.set('');
  }

  select(table: TableName) {
    this.sortKey.set('');
    this.page.set(0);
    this.showDash.set(false);
    this.search.set('');
    this.showUsers.set(false);
    this.active.set(table);
    this.editingId.set(null);
    this.error.set('');
    this.info.set('');
  }

  openUsers() {
    this.showDash.set(false);
    this.showUsers.set(true);
    this.editingId.set(null);
    this.error.set('');
    this.info.set('');
    this.loadUsers();
    this.search.set('');
  }

  signOut() {
    this.ask({
      title: 'Sign out!',
      message: 'You will be signed out of the admin panel. Continue?',
      confirmText: 'Sign out',
      run: () => {
        this.auth.logout();
        this.router.navigateByUrl('/');
      },
    });
  }

  // ---------- Users ----------
  loadUsers() {
    this.loading.set(true);
    this.usersApi.list().subscribe({
      next: (u) => {
        this.users.set(u);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(this.errorText(err));
      },
    });
  }

  toggleAdd() {
    this.showAdd.update((v) => !v);
    this.error.set('');
    this.info.set('');
  }

  createUser(event: Event) {
    event.preventDefault();
    const d = new FormData(event.target as HTMLFormElement);
    const body = {
      loginId: String(d.get('loginId') ?? '').trim(),
      name: String(d.get('name') ?? '').trim(),
      password: String(d.get('password') ?? ''),
      role: String(d.get('role') ?? 'Viewer') as UserRole,
    };
    this.saving.set(true);
    this.error.set('');
    this.usersApi.create(body).subscribe({
      next: () => {
        this.saving.set(false);
        this.showAdd.set(false);
        this.info.set('User added.');
        this.loadUsers();
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.error.set(this.userErrorText(err));
      },
    });
  }

  changeRole(u: AdminUser, event: Event) {
    const role = (event.target as HTMLSelectElement).value as UserRole;
    this.updateUser(u, { role }, `${u.loginId} is now ${role}.`);
  }

  toggleActive(u: AdminUser) {
    this.updateUser(
      u,
      { isActive: !u.isActive },
      u.isActive ? `${u.loginId} switched off.` : `${u.loginId} switched on.`,
    );
  }

  resetPassword(u: AdminUser) {
    this.ask({
      title: 'Reset password',
      message: `New password for ${u.loginId} (at least 8 characters):`,
      confirmText: 'Change password',
      password: true,
      run: (pw) => this.updateUser(u, { password: pw }, `Password changed for ${u.loginId}.`),
    });
  }

  removeUser(u: AdminUser) {
    this.ask({
      title: `Delete user "${u.loginId}"?`,
      message: 'This person will no longer be able to sign in. This cannot be undone.',
      confirmText: 'Delete user',
      danger: true,
      run: () => {
        this.error.set('');
        this.info.set('');
        this.usersApi.remove(u.id).subscribe({
          next: () => {
            this.info.set(`${u.loginId} deleted.`);
            this.loadUsers();
          },
          error: (err: HttpErrorResponse) => this.error.set(this.userErrorText(err)),
        });
      },
    });
  }

  private updateUser(
    u: AdminUser,
    changes: { password?: string; role?: UserRole; isActive?: boolean },
    done: string,
  ) {
    this.error.set('');
    this.info.set('');
    this.usersApi.update(u.id, { name: u.name, ...changes }).subscribe({
      next: () => {
        this.info.set(done);
        this.loadUsers();
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(this.userErrorText(err));
        this.loadUsers(); // put the dropdown back to the real value
      },
    });
  }

  private userErrorText(err: HttpErrorResponse): string {
    if (err.status === 403) return 'Only a Superuser can manage users.';
    const e = err.error;
    if (typeof e === 'string' && e) return e;
    if (e?.message) return String(e.message);
    if (e?.error) return String(e.error);
    return this.errorText(err);
  }

  // ---------- Load ----------
  loadAll() {
    this.loading.set(true);
    forkJoin({
      leads: this.admin.list<Row>('leads'),
      activities: this.admin.list<Row>('activities'),
      visits: this.admin.list<Row>('visits'),
      configurations: this.admin.list<Row>('configurations'),
    }).subscribe({
      next: (d) => {
        this.data.set(d);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(
          err.status === 404
            ? 'Admin API not found. Is the API running in Development mode?'
            : this.errorText(err),
        );
      },
    });
  }

  // ---------- Edit ----------
  startEdit(row: Row) {
    this.draft = {};
    for (const col of this.current().cols) {
      if (!col.edit) continue;
      const v = row[col.key];
      this.draft[col.key] =
        col.edit === 'bool' ? (v === true ? 'Yes' : v === false ? 'No' : '') : (v ?? '');
    }
    this.error.set('');
    this.info.set('');
    this.editingId.set(row['id']);
  }

  cancelEdit() {
    this.editingId.set(null);
    this.error.set('');
  }

  setDraft(key: string, event: Event) {
    this.draft[key] = (event.target as HTMLInputElement).value;
  }

  save(row: Row) {
    const body: Row = {};
    for (const col of this.current().cols) {
      if (col.edit) body[col.key] = this.fromDraft(this.draft[col.key], col);
    }
    this.saving.set(true);
    this.error.set('');
    this.admin.update(this.active(), row['id'], body).subscribe({
      next: () => {
        this.saving.set(false);
        this.editingId.set(null);
        this.info.set('Saved.');
        this.loadAll();
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.error.set(this.errorText(err));
      },
    });
  }

  private fromDraft(v: unknown, col: Col): unknown {
    if (col.edit === 'number') return v === '' || v === null ? null : Number(v);
    if (col.edit === 'bool') return v === 'Yes' ? true : v === 'No' ? false : null;
    const s = String(v ?? '').trim();
    return s === '' ? null : s;
  }

  // ---------- Delete ----------
  remove(row: Row) {
    const t = this.current();
    const warning =
      t.key === 'leads' ? 'This also deletes all of its activities and visits. '
      : t.key === 'activities' ? 'Its visit (if any) is deleted too. '
      : t.key === 'configurations' ? 'Activities that used it will show no configuration. '
      : '';
    this.ask({
      title: `Delete ${t.single} #${row['id']}?`,
      message: `${warning}This cannot be undone.`,
      confirmText: 'Delete',
      danger: true,
      run: () => {
        this.error.set('');
        this.admin.remove(t.key, row['id']).subscribe({
          next: () => {
            this.info.set('Deleted.');
            this.loadAll();
          },
          error: (err: HttpErrorResponse) => this.error.set(this.errorText(err)),
        });
      },
    });
  }

  // ---------- Display helpers ----------
  show(row: Row, col: Col): string {
    const v = row[col.key];
    if (v === null || v === undefined || v === '') return '—';
    if (col.kind === 'datetime') return new Date(v).toLocaleString();
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    return String(v);
  }

  optionsFor(col: Col): string[] {
    if (col.edit === 'bool') return ['', 'Yes', 'No'];
    if (col.options === 'rooms') return ['', ...this.rooms()];
    return col.options ?? [];
  }

  badgeClass(v: string): string {
    return 'b-' + v.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  roleCount(name: string): number {
    return this.users().filter((u) => u.role === name).length;
  }

  ago(v: unknown): string {
    const mins = Math.floor((Date.now() - new Date(String(v)).getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const h = Math.floor(mins / 60);
    if (h < 24) return `${h} h ago`;
    const d = Math.floor(h / 24);
    return `${d} day${d > 1 ? 's' : ''} ago`;
  }

  private compare(x: unknown, y: unknown, col?: Col): number {
    if (x == null && y == null) return 0;
    if (x == null) return -1;
    if (y == null) return 1;
    if (col?.kind === 'datetime') return new Date(String(x)).getTime() - new Date(String(y)).getTime();
    if (typeof x === 'number' && typeof y === 'number') return x - y;
    return String(x).localeCompare(String(y), undefined, { numeric: true, sensitivity: 'base' });
  }

  private countBy(rows: Row[], key: string) {
    const map = new Map<string, number>();
    for (const r of rows) {
      const k = String(r[key] ?? '—');
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    const total = rows.length || 1;
    return [...map.entries()]
      .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  }

  private errorText(err: HttpErrorResponse): string {
    if (err.status === 0) return "Can't reach the server. Is the API running?";
    const errors = err.error?.errors;
    if (errors) return String(Object.values(errors).flat()[0]);
    return 'Something went wrong. Please try again.';
  }
}
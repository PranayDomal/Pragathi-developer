import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { AdminService, TableName } from '../../core/services/admin.service';
import { AdminUser, UsersService, UserRole } from '../../core/services/users.service';
import { SIGN_OUT_WARNING } from '../../core/services/admin-http';

type Row = Record<string, any>;

interface Col {
  key: string;
  label: string;
  edit?: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'bool';
  options?: string[] | 'rooms';
  kind?: 'datetime';
}

const ACTIVITY_TYPES = ['Enquiry', 'SiteVisit', 'FloorPlanDownload', 'BrochureDownload', 'ContactMessage', 'Chat'];
const VISIT_STATUSES = ['Requested', 'Confirmed', 'Completed', 'Cancelled'];

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
      { key: 'type', label: 'Type', edit: 'select', options: ACTIVITY_TYPES },
      { key: 'configuration', label: 'Configuration', edit: 'select', options: 'rooms' },
      { key: 'homeLoan', label: 'Home loan', edit: 'bool' },
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
      { key: 'status', label: 'Status', edit: 'select', options: VISIT_STATUSES },
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
    isSuperuser = this.auth.isSuperuser();
    showUsers = signal(false);
    users = signal<AdminUser[]>([]);
    showAdd = signal(false);

    search = signal('');

  onSearch(event: Event) {
    this.search.set((event.target as HTMLInputElement).value);
  }

    // Viewer: false. Editor and Superuser: true.
    canEdit = this.auth.canEdit();
    who = this.auth.name();
    role = this.auth.role();

  tables = TABLES;
  active = signal<TableName>('leads');
  data = signal<Record<TableName, Row[]>>({ leads: [], activities: [], visits: [], configurations: [] });
  loading = signal(false);
  saving = signal(false);
  error = signal('');
  info = signal('');

  editingId = signal<number | null>(null);
  draft: Row = {};

  current = computed(() => TABLES.find((t) => t.key === this.active())!);
    rows = computed(() => {
    const all = this.data()[this.active()];
    const q = this.search().trim().toLowerCase();
    if (!q) return all;
    const cols = this.current().cols;
    return all.filter((row) => cols.some((c) => this.show(row, c).toLowerCase().includes(q)));
  });

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

  constructor() {
    // Opened the URL directly without signing in? Send them home.
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/');
      return;
    }
    this.loadAll();
  }

    signOut() {
    if (!confirm(SIGN_OUT_WARNING)) return;
    this.auth.logout();
    this.router.navigateByUrl('/');
  }

    openUsers() {
    this.showUsers.set(true);
    this.editingId.set(null);
    this.error.set('');
    this.info.set('');
    this.loadUsers();
    this.search.set('');
  }

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
    const pw = prompt(`New password for ${u.loginId} (at least 8 characters):`);
    if (pw === null) return; // pressed Cancel
    if (pw.length < 8) {
      this.error.set('Password must be at least 8 characters.');
      return;
    }
    this.updateUser(u, { password: pw }, `Password changed for ${u.loginId}.`);
  }

  removeUser(u: AdminUser) {
    if (!confirm(`Delete user "${u.loginId}"? This cannot be undone.`)) return;
    this.error.set('');
    this.info.set('');
    this.usersApi.remove(u.id).subscribe({
      next: () => {
        this.info.set(`${u.loginId} deleted.`);
        this.loadUsers();
      },
      error: (err: HttpErrorResponse) => this.error.set(this.userErrorText(err)),
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

  select(table: TableName) {
    this.search.set('');
    this.showUsers.set(false);
    this.active.set(table);
    this.editingId.set(null);
    this.error.set('');
    this.info.set('');
  }

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
      t.key === 'leads' ? ' This also deletes all of its activities and visits.'
      : t.key === 'activities' ? ' Its visit (if any) is deleted too.'
      : t.key === 'configurations' ? ' Activities that used it will show no configuration.'
      : '';
    if (!confirm(`Delete ${t.single} #${row['id']}?${warning}`)) return;

    this.error.set('');
    this.admin.remove(t.key, row['id']).subscribe({
      next: () => {
        this.info.set('Deleted.');
        this.loadAll();
      },
      error: (err: HttpErrorResponse) => this.error.set(this.errorText(err)),
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

  private errorText(err: HttpErrorResponse): string {
    if (err.status === 0) return "Can't reach the server. Is the API running?";
    const errors = err.error?.errors;
    if (errors) return String(Object.values(errors).flat()[0]);
    return 'Something went wrong. Please try again.';
  }
}
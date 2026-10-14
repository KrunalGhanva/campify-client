import { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { getAdminUsers, toggleUserRole, toggleUserSuspend, deleteAdminUser } from '../../api/admin';
import { FlashContext } from '../../context/FlashContext';
import { AuthContext } from '../../context/AuthContext';
import { Button, Table, Pagination, Modal, Badge, EmptyState, Loading, Select, Icon } from '../../components/ui';

const LIMIT = 10;

const avatar = (user) =>
    user?.avatar?.url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || '?')}&background=E8EFE9&color=2F5D46&size=48`;

/* ── AdminUsers page ──────────────────────────────────────────── */
const AdminUsers = () => {
    const { showFlash } = useContext(FlashContext);
    const { currentUser } = useContext(AuthContext);

    const [users, setUsers]     = useState([]);
    const [total, setTotal]     = useState(0);
    const [page, setPage]       = useState(1);
    const [pages, setPages]     = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [pendingSearch, setPendingSearch] = useState('');

    const [confirmUser, setConfirmUser] = useState(null); // user to delete
    const [busyId, setBusyId] = useState(null);           // id being mutated

    const searchTimer = useRef(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAdminUsers({
                page,
                limit: LIMIT,
                search: search || undefined,
                role: roleFilter || undefined
            });
            setUsers(data.users);
            setTotal(data.total);
            setPages(data.pages);
        } catch {
            showFlash('danger', 'Failed to load users.');
        } finally {
            setLoading(false);
        }
    }, [page, search, roleFilter, showFlash]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // Debounce search input
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setPendingSearch(val);
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setSearch(val);
            setPage(1);
        }, 350);
    };

    const handleRoleFilter = (e) => { setRoleFilter(e.target.value); setPage(1); };

    /* ── Actions ─────────────────────────────────────────────── */
    const handleToggleRole = async (user) => {
        setBusyId(user._id);
        try {
            const res = await toggleUserRole(user._id);
            showFlash('success', res.message);
            fetchUsers();
        } catch (err) {
            showFlash('danger', err.response?.data?.error || 'Failed to update role.');
        } finally {
            setBusyId(null);
        }
    };

    const handleToggleSuspend = async (user) => {
        setBusyId(user._id);
        try {
            const res = await toggleUserSuspend(user._id);
            showFlash('success', res.message);
            fetchUsers();
        } catch (err) {
            showFlash('danger', err.response?.data?.error || 'Failed to update status.');
        } finally {
            setBusyId(null);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!confirmUser) return;
        setBusyId(confirmUser._id);
        setConfirmUser(null);
        try {
            const res = await deleteAdminUser(confirmUser._id);
            showFlash('success', res.message);
            fetchUsers();
        } catch (err) {
            showFlash('danger', err.response?.data?.error || 'Failed to delete user.');
        } finally {
            setBusyId(null);
        }
    };

    const isSelf = (u) => currentUser?._id === u._id;

    return (
        <div>
            <Modal
                open={!!confirmUser}
                onClose={() => setConfirmUser(null)}
                title="Delete user?"
                footer={
                    <>
                        <Button onClick={() => setConfirmUser(null)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDeleteConfirm}>Delete permanently</Button>
                    </>
                }
            >
                {confirmUser && (
                    <div className="stack">
                        <p>
                            You are about to permanently delete <strong>{confirmUser.username}</strong>.
                            This also removes all of their campgrounds, reviews and uploaded images.
                        </p>
                        <p><strong>This can’t be undone.</strong></p>
                    </div>
                )}
            </Modal>

            <div className="page-head">
                <div>
                    <h1>Users</h1>
                    <p>{total} total</p>
                </div>
            </div>

            <div className="toolbar">
                <div className="input-icon toolbar__search">
                    <Icon name="search" size={16} />
                    <input
                        type="search"
                        className="input"
                        aria-label="Search users"
                        placeholder="Search by name or email"
                        value={pendingSearch}
                        onChange={handleSearchChange}
                        id="admin-user-search"
                    />
                </div>
                <Select aria-label="Filter by role" fieldClassName="toolbar__select" id="admin-role-filter" value={roleFilter} onChange={handleRoleFilter}>
                    <option value="">All roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </Select>
            </div>

            {loading ? (
                <Loading label="Loading users…" />
            ) : users.length === 0 ? (
                <EmptyState icon="users" title="No users found">Try a different search or role filter.</EmptyState>
            ) : (
                <Table label="Users">
                    <thead>
                        <tr>
                            <th scope="col">User</th>
                            <th scope="col">Email</th>
                            <th scope="col">Role</th>
                            <th scope="col">Joined</th>
                            <th scope="col">Status</th>
                            <th scope="col"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u._id}>
                                <td>
                                    <div className="cell-media">
                                        <img src={avatar(u)} alt="" className="avatar avatar--md" />
                                        <strong>{u.username}</strong>
                                        {isSelf(u) && <Badge tone="forest">You</Badge>}
                                    </div>
                                </td>
                                <td className="muted">{u.email || '—'}</td>
                                <td><Badge tone={u.role === 'admin' ? 'forest' : 'neutral'}>{u.role}</Badge></td>
                                <td className="muted">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                                <td><Badge tone={u.suspended ? 'warning' : 'neutral'}>{u.suspended ? 'Suspended' : 'Active'}</Badge></td>
                                <td className="actions">
                                    <Button
                                        size="sm"
                                        loading={busyId === u._id}
                                        onClick={() => handleToggleRole(u)}
                                        disabled={!!busyId || isSelf(u)}
                                        aria-label={`${u.role === 'admin' ? 'Demote' : 'Promote'} ${u.username}`}
                                    >
                                        {u.role === 'admin' ? 'Demote' : 'Promote'}
                                    </Button>{' '}
                                    <Button
                                        size="sm"
                                        onClick={() => handleToggleSuspend(u)}
                                        disabled={!!busyId || isSelf(u)}
                                        aria-label={`${u.suspended ? 'Reactivate' : 'Suspend'} ${u.username}`}
                                    >
                                        {u.suspended ? 'Activate' : 'Suspend'}
                                    </Button>{' '}
                                    <Button
                                        size="sm"
                                        variant="danger-ghost"
                                        iconOnly
                                        onClick={() => setConfirmUser(u)}
                                        disabled={!!busyId || isSelf(u)}
                                        aria-label={`Delete ${u.username}`}
                                    >
                                        <Icon name="trash" size={14} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            <Pagination page={page} pages={pages} total={total} onChange={setPage} label="Users pagination" />
        </div>
    );
};

export default AdminUsers;

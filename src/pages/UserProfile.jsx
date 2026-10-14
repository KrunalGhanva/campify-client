import { useState, useContext, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FlashContext } from '../context/FlashContext';
import { updateProfile, updatePassword } from '../api/auth';
import { getAllCampgrounds, deleteCampground } from '../api/campgrounds';
import StarRating from '../components/StarRating';
import { Button, Input, Table, Modal, EmptyState, Skeleton, Icon, Badge } from '../components/ui';

/* ══════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════ */

/* ── Loading rows ──────────────────────────────────────── */
const SkeletonRows = () => (
    <div className="stack" role="status" aria-label="Loading your campgrounds">
        {[1, 2, 3].map(i => <Skeleton key={i} variant="block" className="skeleton--row" />)}
    </div>
);

/* ── Delete confirm ────────────────────────────────────── */
const DeleteModal = ({ camp, onConfirm, onClose, busy }) => (
    <Modal
        open
        onClose={busy ? undefined : onClose}
        title="Delete this campground?"
        footer={
            <>
                <Button onClick={onClose} disabled={busy}>Cancel</Button>
                <Button variant="danger" loading={busy} onClick={onConfirm}>{busy ? 'Deleting…' : 'Delete campground'}</Button>
            </>
        }
    >
        <p>
            This permanently removes <strong>{camp.title}</strong>, its photos and all of its reviews. This can’t be undone.
        </p>
    </Modal>
);

const avgOf = (camp) => (camp.reviews?.length
    ? camp.reviews.reduce((s, r) => s + (r.rating || 0), 0) / camp.reviews.length
    : null);

const Thumb = ({ camp }) => (
    camp.images?.[0]?.url
        ? <img className="list-rows__img" src={camp.images[0].url.replace('/upload', '/upload/w_160,h_120,c_fill')} alt="" />
        : <span className="list-rows__img list-rows__img--empty"><Icon name="image" size={18} /></span>
);

/* ══════════════════════════════════════════════════════════
   TABS
══════════════════════════════════════════════════════════ */

/* ── Overview Tab ──────────────────────────────────────── */
const OverviewTab = ({ campgrounds, loading, onTabChange }) => {
    const totalReviews = campgrounds.reduce((s, c) => s + (c.reviews?.length || 0), 0);
    const avgRating = campgrounds.length
        ? campgrounds.reduce((sum, c) => {
            if (!c.reviews?.length) return sum;
            return sum + c.reviews.reduce((rs, r) => rs + (r.rating || 0), 0) / c.reviews.length;
        }, 0) / campgrounds.filter(c => c.reviews?.length).length
        : null;

    const stats = [
        { label: 'My campgrounds', value: campgrounds.length },
        { label: 'Reviews received', value: totalReviews },
        { label: 'Average rating', value: Number.isFinite(avgRating) && avgRating !== null ? `${avgRating.toFixed(1)} / 5` : '—' },
    ];

    const recentCamps = [...campgrounds].slice(0, 3);

    return (
        <div className="stack">
            <dl className="stats">
                {stats.map(s => (
                    <div key={s.label} className="stats__item">
                        <dt>{s.label}</dt>
                        <dd>{loading ? <Skeleton width="48px" /> : s.value}</dd>
                    </div>
                ))}
            </dl>

            {loading ? <SkeletonRows /> : recentCamps.length > 0 ? (
                <section aria-labelledby="recent-h">
                    <div className="row-between">
                        <h2 id="recent-h" className="section-h">Recent campgrounds</h2>
                        <Button size="sm" variant="ghost" onClick={() => onTabChange('campgrounds')}>View all</Button>
                    </div>
                    <ul className="list-rows">
                        {recentCamps.map(c => (
                            <li key={c._id}>
                                <Thumb camp={c} />
                                <div className="list-rows__text">
                                    <Link to={`/campgrounds/${c._id}`}>{c.title}</Link>
                                    <span className="muted"><Icon name="pin" size={12} /> {c.location}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : (
                <EmptyState
                    title="No campgrounds yet"
                    action={<Button variant="primary" icon="plus" to="/campgrounds/new">Create your first campground</Button>}
                >
                    Share a favourite outdoor spot with the community.
                </EmptyState>
            )}
        </div>
    );
};

/* ── My Campgrounds Tab ────────────────────────────────── */
const MyCampgroundsTab = ({ campgrounds, loading, onDelete }) => {
    const [search, setSearch] = useState('');
    const filtered = campgrounds.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="stack">
            <div className="toolbar">
                <div className="input-icon toolbar__search">
                    <Icon name="search" size={16} />
                    <input
                        type="search"
                        className="input"
                        aria-label="Search my campgrounds"
                        placeholder="Search my campgrounds"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="primary" icon="plus" to="/campgrounds/new">New campground</Button>
            </div>

            {loading ? (
                <SkeletonRows />
            ) : filtered.length === 0 ? (
                campgrounds.length === 0 ? (
                    <EmptyState
                        title="You haven’t listed any campgrounds"
                        action={<Button variant="primary" icon="plus" to="/campgrounds/new">Create your first campground</Button>}
                    >
                        Campgrounds you add will show up here.
                    </EmptyState>
                ) : (
                    <EmptyState icon="search" title="No matches" action={<Button onClick={() => setSearch('')}>Clear search</Button>}>
                        None of your campgrounds match “{search}”.
                    </EmptyState>
                )
            ) : (
                <Table label="My campgrounds">
                    <thead>
                        <tr>
                            <th scope="col">Campground</th>
                            <th scope="col" className="num">Price</th>
                            <th scope="col">Rating</th>
                            <th scope="col"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(c => {
                            const avg = avgOf(c);
                            return (
                                <tr key={c._id}>
                                    <td>
                                        <div className="cell-media">
                                            <Thumb camp={c} />
                                            <div className="list-rows__text">
                                                <Link to={`/campgrounds/${c._id}`}>{c.title}</Link>
                                                <span className="muted">{c.location}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="num">${c.price}</td>
                                    <td>
                                        {avg !== null
                                            ? <span className="row-gap"><StarRating rating={Math.round(avg)} readOnly size="sm" /><span className="muted">({c.reviews.length})</span></span>
                                            : <span className="muted">No reviews</span>}
                                    </td>
                                    <td className="actions">
                                        <Button size="sm" variant="ghost" icon="edit" to={`/campgrounds/${c._id}/edit`} aria-label={`Edit ${c.title}`}>Edit</Button>
                                        <Button size="sm" variant="danger-ghost" icon="trash" onClick={() => onDelete(c)} aria-label={`Delete ${c.title}`}>Delete</Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            )}
        </div>
    );
};

/* ── Settings Tab ──────────────────────────────────────── */
const SettingsTab = ({ currentUser, setCurrentUser, showFlash }) => {
    const [email, setEmail]     = useState(currentUser.email || '');
    const [mobile, setMobile]   = useState(currentUser.mobile || '');
    const [username, setUsername] = useState(currentUser.username || '');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd]         = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [pwdSubmitting, setPwdSubmitting] = useState(false);

    const contactMissing = !email.trim() && !mobile.trim();
    const mismatch = confirmPwd.length > 0 && newPwd !== confirmPwd;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() && !mobile.trim()) {
            return showFlash('danger', 'Provide either Email or Mobile Number.');
        }
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('email', email);
            fd.append('mobile', mobile);
            fd.append('username', username);
            if (avatarFile) fd.append('avatar', avatarFile);
            const data = await updateProfile(fd);
            setCurrentUser(data.user);
            showFlash('success', 'Profile updated!');
            setAvatarFile(null);
            setAvatarPreview(null);
        } catch (err) {
            showFlash('danger', err.response?.data?.error || 'Failed to update profile');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (newPwd !== confirmPwd) return showFlash('danger', 'Passwords do not match');
        setPwdSubmitting(true);
        try {
            await updatePassword(currentPwd, newPwd);
            showFlash('success', 'Password updated!');
            setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
        } catch (err) {
            showFlash('danger', err.response?.data?.error || 'Failed to update password');
        } finally {
            setPwdSubmitting(false);
        }
    };

    return (
        <div className="split split--even">
            <section aria-labelledby="prof-h">
                <h2 id="prof-h" className="section-h">Profile</h2>
                <form className="stack" onSubmit={handleProfileSubmit}>
                    <div className="row-gap">
                        <img
                            className="avatar avatar--lg"
                            src={avatarPreview || currentUser.avatar?.url ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=2F5D46&color=fff&size=200`}
                            alt="Your avatar"
                        />
                        <div className="field">
                            <label className="field__label" htmlFor="s-avatar">Avatar</label>
                            <input id="s-avatar" type="file" className="input" accept="image/png,image/jpeg" onChange={handleFileChange} />
                        </div>
                    </div>
                    <Input label="Username" id="s-username" type="text" value={username}
                        onChange={e => setUsername(e.target.value)} required minLength={3} maxLength={30} autoComplete="username" />
                    <Input label="Email" id="s-email" type="email" value={email} autoComplete="email"
                        onChange={e => setEmail(e.target.value)}
                        error={contactMissing ? 'Provide an email or a mobile number.' : undefined} />
                    <Input label="Mobile" id="s-mobile" type="tel" value={mobile} autoComplete="tel"
                        onChange={e => setMobile(e.target.value)} />
                    <div><Button type="submit" variant="primary" loading={submitting}>{submitting ? 'Saving…' : 'Save changes'}</Button></div>
                </form>
            </section>

            <section aria-labelledby="pw-h">
                <h2 id="pw-h" className="section-h">Password</h2>
                <form className="stack" onSubmit={handlePasswordSubmit}>
                    <Input label="Current password" id="s-cur-pwd" type="password" value={currentPwd}
                        onChange={e => setCurrentPwd(e.target.value)} required autoComplete="current-password" />
                    <Input label="New password" id="s-new-pwd" type="password" value={newPwd}
                        onChange={e => setNewPwd(e.target.value)} required minLength={6} autoComplete="new-password"
                        hint="At least 6 characters." />
                    <Input label="Confirm new password" id="s-con-pwd" type="password" value={confirmPwd}
                        onChange={e => setConfirmPwd(e.target.value)} required minLength={6} autoComplete="new-password"
                        error={mismatch ? 'Passwords do not match.' : undefined} />
                    <div><Button type="submit" variant="primary" loading={pwdSubmitting}>{pwdSubmitting ? 'Updating…' : 'Update password'}</Button></div>
                </form>
            </section>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════
   MAIN UserProfile PAGE
══════════════════════════════════════════════════════════ */
const TABS = [
    { id: 'overview',     label: 'Overview' },
    { id: 'campgrounds',  label: 'My campgrounds' },
    { id: 'settings',     label: 'Settings' },
];

const UserProfile = () => {
    const { currentUser, setCurrentUser } = useContext(AuthContext);
    const { showFlash } = useContext(FlashContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    const [campgrounds, setCampgrounds] = useState([]);
    const [campLoading, setCampLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    /* Fetch all campgrounds and filter to current user's */
    const fetchMyCampgrounds = useCallback(async () => {
        if (!currentUser) return;
        setCampLoading(true);
        try {
            const { campgrounds: all } = await getAllCampgrounds();
            const mine = all.filter(c =>
                c.author?._id === currentUser._id || c.author === currentUser._id
            );
            setCampgrounds(mine);
        } catch {
            showFlash('danger', 'Could not load your campgrounds.');
        } finally {
            setCampLoading(false);
        }
    }, [currentUser, showFlash]);

    useEffect(() => { fetchMyCampgrounds(); }, [fetchMyCampgrounds]);

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await deleteCampground(deleteTarget._id);
            showFlash('success', `"${deleteTarget.title}" deleted.`);
            setCampgrounds(prev => prev.filter(c => c._id !== deleteTarget._id));
        } catch (err) {
            showFlash('danger', err.response?.data?.error || 'Failed to delete campground.');
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    if (!currentUser) {
        navigate('/login');
        return null;
    }

    const avatarUrl = currentUser.avatar?.url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=2F5D46&color=fff&size=200`;

    return (
        <div>
            {deleteTarget && (
                <DeleteModal
                    camp={deleteTarget}
                    busy={deleting}
                    onConfirm={handleDeleteConfirm}
                    onClose={() => setDeleteTarget(null)}
                />
            )}

            <header className="profile-head">
                <img className="avatar avatar--lg" src={avatarUrl} alt="" />
                <div>
                    <h1 className="display">{currentUser.username}</h1>
                    <p className="muted">{currentUser.email || currentUser.mobile}</p>
                    <div className="row-gap profile-head__meta">
                        <Badge tone={currentUser.role === 'admin' ? 'forest' : 'neutral'}>{currentUser.role === 'admin' ? 'Admin' : 'Camper'}</Badge>
                        <span className="muted">{campgrounds.length} campground{campgrounds.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </header>

            <div className="tabs" role="tablist" aria-label="Profile sections">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        id={`tab-${tab.id}`}
                        aria-selected={activeTab === tab.id}
                        aria-controls={`panel-${tab.id}`}
                        tabIndex={activeTab === tab.id ? 0 : -1}
                        className={`tabs__tab${activeTab === tab.id ? ' is-active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        onKeyDown={(e) => {
                            const i = TABS.findIndex(t => t.id === activeTab);
                            if (e.key === 'ArrowRight') { e.preventDefault(); setActiveTab(TABS[(i + 1) % TABS.length].id); }
                            if (e.key === 'ArrowLeft')  { e.preventDefault(); setActiveTab(TABS[(i - 1 + TABS.length) % TABS.length].id); }
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`} className="tabpanel">
                {activeTab === 'overview' && (
                    <OverviewTab campgrounds={campgrounds} loading={campLoading} onTabChange={setActiveTab} />
                )}
                {activeTab === 'campgrounds' && (
                    <MyCampgroundsTab campgrounds={campgrounds} loading={campLoading} onDelete={setDeleteTarget} />
                )}
                {activeTab === 'settings' && (
                    <SettingsTab currentUser={currentUser} setCurrentUser={setCurrentUser} showFlash={showFlash} />
                )}
            </div>
        </div>
    );
};

export default UserProfile;

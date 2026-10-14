import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../../api/admin';
import StarRating from '../../components/StarRating';
import { Button, Table, Badge, Alert, Skeleton, EmptyState } from '../../components/ui';

const avatar = (user) =>
    user?.avatar?.url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || '?')}&background=E8EFE9&color=2F5D46&size=48`;

const Section = ({ title, to, loading, empty, children }) => (
    <section className="dash-section">
        <div className="row-between">
            <h2 className="section-h">{title}</h2>
            <Button size="sm" variant="ghost" to={to}>View all</Button>
        </div>
        {loading ? <Skeleton variant="block" /> : empty ? <EmptyState icon="info" title="Nothing yet" /> : children}
    </section>
);

/* ── Dashboard page ───────────────────────────────────────────── */
const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getAdminStats()
            .then(setData)
            .catch(() => setError('Failed to load stats.'))
            .finally(() => setLoading(false));
    }, []);

    if (error) {
        return <Alert title="Couldn’t load the dashboard" onRetry={() => window.location.reload()}>{error}</Alert>;
    }

    const stats = data?.stats || {};
    const kpis = [
        { label: 'Users',       value: stats.users,       to: '/admin/users' },
        { label: 'Campgrounds', value: stats.campgrounds, to: '/admin/campgrounds' },
        { label: 'Reviews',     value: stats.reviews,     to: '/admin/reviews' },
        { label: 'Admins',      value: stats.admins },
    ];

    const recentUsers = data?.recentUsers || [];
    const recentCamps = data?.recentCampgrounds || [];
    const recentReviews = data?.recentReviews || [];

    return (
        <div className="stack dash">
            <div className="page-head">
                <div>
                    <h1>Dashboard</h1>
                    <p>What’s happening across Campify.</p>
                </div>
            </div>

            <dl className="stats stats--4">
                {kpis.map(k => (
                    <div key={k.label} className="stats__item">
                        <dt>{k.to ? <Link to={k.to}>{k.label}</Link> : k.label}</dt>
                        <dd>{loading ? <Skeleton width="48px" /> : (k.value ?? 0)}</dd>
                    </div>
                ))}
            </dl>

            <div className="dash__grid">
                <Section title="Recent registrations" to="/admin/users" loading={loading} empty={!recentUsers.length}>
                    <Table label="Recent registrations" className="table-ui--compact">
                        <thead><tr><th scope="col">User</th><th scope="col">Role</th></tr></thead>
                        <tbody>
                            {recentUsers.map(u => (
                                <tr key={u._id}>
                                    <td>
                                        <div className="cell-media">
                                            <img src={avatar(u)} alt="" className="avatar avatar--md" />
                                            <div className="list-rows__text">
                                                <strong>{u.username}</strong>
                                                <span className="muted">{u.email || '—'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td><Badge tone={u.role === 'admin' ? 'forest' : 'neutral'}>{u.role}</Badge></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Section>

                <Section title="Recent campgrounds" to="/admin/campgrounds" loading={loading} empty={!recentCamps.length}>
                    <Table label="Recent campgrounds" className="table-ui--compact">
                        <thead><tr><th scope="col">Title</th><th scope="col">Author</th><th scope="col" className="num">Price</th></tr></thead>
                        <tbody>
                            {recentCamps.map(c => (
                                <tr key={c._id}>
                                    <td><strong>{c.title}</strong></td>
                                    <td>{c.author?.username || '—'}</td>
                                    <td className="num">${c.price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Section>
            </div>

            <Section title="Recent reviews" to="/admin/reviews" loading={loading} empty={!recentReviews.length}>
                <Table label="Recent reviews">
                    <thead><tr><th scope="col">Author</th><th scope="col">Rating</th><th scope="col">Preview</th><th scope="col">Date</th></tr></thead>
                    <tbody>
                        {recentReviews.map(r => (
                            <tr key={r._id}>
                                <td>
                                    <div className="cell-media">
                                        <img src={avatar(r.author)} alt="" className="avatar avatar--md" />
                                        <strong>{r.author?.username}</strong>
                                    </div>
                                </td>
                                <td><StarRating rating={r.rating} readOnly size="sm" /></td>
                                <td className="cell-clip muted">{r.body}</td>
                                <td className="muted">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Section>
        </div>
    );
};

export default AdminDashboard;

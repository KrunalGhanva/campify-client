import { useContext, useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FlashContext } from '../context/FlashContext';
import FlashMessage from './FlashMessage';
import { Icon, Button } from './ui';

const NAV_LINKS = [
    { to: '/admin/dashboard',   icon: 'grid',  label: 'Dashboard' },
    { to: '/admin/users',       icon: 'users', label: 'Users' },
    { to: '/admin/campgrounds', icon: 'tent',  label: 'Campgrounds' },
    { to: '/admin/reviews',     icon: 'star',  label: 'Reviews' },
];

const AdminLayout = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const { showFlash } = useContext(FlashContext);
    const navigate = useNavigate();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await logout();
            showFlash('success', 'Logged out.');
            navigate('/');
        } catch {
            showFlash('danger', 'Error logging out');
            setLoggingOut(false);
        }
    };

    return (
        <div className="adm">
            <a className="skip-link" href="#admin-main">Skip to content</a>
            <header className="adm__top">
                <Link className="brand" to="/admin/dashboard">
                    <Icon name="tent" size={22} />
                    Campify
                </Link>
                <span className="adm__tag">Admin</span>
                <span className="adm__spacer" />
                <span className="adm__who">{currentUser?.username}</span>
                <Button variant="ghost" size="sm" icon="external" to="/campgrounds">View site</Button>
                <Button variant="ghost" size="sm" icon="logout" loading={loggingOut} onClick={handleLogout}>Log out</Button>
            </header>

            <div className="adm__body">
                <nav className="adm__nav" aria-label="Admin">
                    {NAV_LINKS.map(({ to, icon, label }) => (
                        <NavLink key={to} to={to} className={({ isActive }) => `nav__link${isActive ? ' active' : ''}`}>
                            <Icon name={icon} size={16} />
                            {label}
                        </NavLink>
                    ))}
                </nav>
                <main id="admin-main" className="adm__main">
                    <Outlet />
                </main>
            </div>
            <FlashMessage />
        </div>
    );
};

export default AdminLayout;

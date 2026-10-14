import { useContext, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FlashContext } from '../context/FlashContext';
import { Icon, Button } from './ui';

const Navbar = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const { showFlash } = useContext(FlashContext);
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const close = () => setOpen(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await logout();
            showFlash('success', 'You have been logged out.');
            close();
            navigate('/');
        } catch {
            showFlash('danger', 'Error logging out');
        } finally {
            setLoggingOut(false);
        }
    };

    const avatarUrl = currentUser?.avatar?.url
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.username || 'U')}&background=2F5D46&color=fff&size=48`;

    const linkClass = ({ isActive }) => `nav__link${isActive ? ' active' : ''}`;

    return (
        <header className="nav">
            <div className="wrap nav__bar">
                <Link className="brand" to="/" onClick={close}>
                    <Icon name="tent" size={22} />
                    Campify
                </Link>

                <Button
                    variant="ghost"
                    iconOnly
                    className="nav__toggle"
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    aria-expanded={open}
                    aria-controls="site-menu"
                    onClick={() => setOpen(o => !o)}
                >
                    <Icon name={open ? 'x' : 'menu'} />
                </Button>

                <nav id="site-menu" className={`nav__menu${open ? ' is-open' : ''}`} aria-label="Main">
                    <ul className="nav__links">
                        <li><NavLink className={linkClass} to="/campgrounds" end onClick={close}>Campgrounds</NavLink></li>
                        <li><NavLink className={linkClass} to="/about" onClick={close}>About</NavLink></li>
                        <li><NavLink className={linkClass} to="/contact" onClick={close}>Contact</NavLink></li>
                    </ul>

                    <ul className="nav__auth">
                        {!currentUser ? (
                            <>
                                <li><NavLink className={linkClass} to="/login" onClick={close}>Log in</NavLink></li>
                                <li><Button variant="primary" to="/register" onClick={close}>Sign up</Button></li>
                            </>
                        ) : (
                            <>
                                <li><Button variant="secondary" icon="plus" to="/campgrounds/new" onClick={close}>New campground</Button></li>
                                {currentUser.role === 'admin' && (
                                    <li>
                                        <NavLink className={linkClass} to="/admin/dashboard" onClick={close}>
                                            <Icon name="shield" size={16} /> Admin
                                        </NavLink>
                                    </li>
                                )}
                                <li>
                                    <NavLink className={linkClass} to="/profile" onClick={close}>
                                        <span className="nav__user">
                                            <img className="avatar" src={avatarUrl} alt="" />
                                            {currentUser.username}
                                        </span>
                                    </NavLink>
                                </li>
                                <li>
                                    <Button variant="ghost" icon="logout" loading={loggingOut} onClick={handleLogout}>Log out</Button>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;

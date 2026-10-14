import { Link } from 'react-router-dom';
import { Icon } from './ui';

const Footer = () => (
    <footer className="footer">
        <div className="wrap footer__inner">
            <Link className="brand" to="/">
                <Icon name="tent" size={20} />
                Campify
            </Link>
            <ul className="footer__links">
                <li><Link to="/campgrounds">Campgrounds</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact</Link></li>
            </ul>
            <span>© {new Date().getFullYear()} Campify</span>
        </div>
    </footer>
);

export default Footer;

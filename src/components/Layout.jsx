import Navbar from './Navbar';
import Footer from './Footer';
import FlashMessage from './FlashMessage';
import ChatWidget from './ChatWidget';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="shell">
            <a className="skip-link" href="#main">Skip to content</a>
            <Navbar />
            <main id="main" className="wrap page">
                <Outlet />
            </main>
            <Footer />
            <FlashMessage />
            {/* Campify AI assistant — visible on all public pages */}
            <ChatWidget />
        </div>
    );
};

export default Layout;

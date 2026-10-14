import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import ChatWidget from '../components/ChatWidget';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FlashMessage from '../components/FlashMessage';
import { Button, Icon } from '../components/ui';

const FEATURES = [
    { icon: 'map',   title: 'Find it on the map',  body: 'Every campground is pinned, so you can see what is near the place you are headed.' },
    { icon: 'image', title: 'See it first',        body: 'Photos from the people who list and visit the sites, not stock images.' },
    { icon: 'chat',  title: 'Read honest reviews', body: 'Ratings and written reviews from campers who have stayed there.' },
];

const STEPS = [
    { n: '1', title: 'Create an account', body: 'A username and an email or mobile number. Browsing needs no account.' },
    { n: '2', title: 'Find a campground', body: 'Search by name or place, or browse the map.' },
    { n: '3', title: 'Share what you found', body: 'Leave a rating and photos, or list a spot of your own.' },
];

const Home = () => {
    const { currentUser } = useContext(AuthContext);

    return (
        <div className="shell">
            <a className="skip-link" href="#main">Skip to content</a>
            <Navbar />

            <main id="main">
                <section className="hero">
                    <div className="hero__img" aria-hidden="true" />
                    <div className="wrap hero__inner">
                        <h1 className="display hero__title">Find somewhere good to camp.</h1>
                        <p className="hero__sub">
                            Campify is a community guide to campgrounds: real photos, honest reviews, and a map to help you choose.
                        </p>
                        <div className="row-gap">
                            <Button variant="primary" size="lg" to="/campgrounds" icon="arrow-right">Browse campgrounds</Button>
                            {currentUser
                                ? <Button size="lg" className="btn-ui--on-dark" to="/campgrounds/new" icon="plus">List a campground</Button>
                                : <Button size="lg" className="btn-ui--on-dark" to="/register">Create an account</Button>}
                        </div>
                    </div>
                </section>

                <section className="wrap home-section" aria-labelledby="why-h">
                    <h2 id="why-h" className="display home-section__h">What you can do here</h2>
                    <ul className="features">
                        {FEATURES.map(f => (
                            <li key={f.title}>
                                <Icon name={f.icon} size={22} />
                                <h3>{f.title}</h3>
                                <p className="muted">{f.body}</p>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="wrap home-section" aria-labelledby="how-h">
                    <h2 id="how-h" className="display home-section__h">How it works</h2>
                    <ol className="steps">
                        {STEPS.map(s => (
                            <li key={s.n}>
                                <span className="steps__n" aria-hidden="true">{s.n}</span>
                                <div>
                                    <h3>{s.title}</h3>
                                    <p className="muted">{s.body}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="wrap home-cta">
                    <h2 className="display">Ready for the next trip?</h2>
                    <div className="row-gap">
                        <Button variant="primary" size="lg" to="/campgrounds">Browse campgrounds</Button>
                        {!currentUser && <Button size="lg" to="/register">Create an account</Button>}
                    </div>
                </section>
            </main>

            <Footer />
            <FlashMessage />
            <ChatWidget />
        </div>
    );
};

export default Home;

import { Button, Icon } from '../components/ui';

const values = [
    { icon: 'chat',  title: 'Honest reviews',      body: 'Ratings and written reviews come from people who have camped there, with photos so you can see for yourself.' },
    { icon: 'map',   title: 'Mapped locations',    body: 'Every campground is placed on a map, so you know where you are headed before you pack.' },
    { icon: 'image', title: 'Real photos',         body: 'Photos are uploaded by the people who list and visit the sites, not stock images.' },
    { icon: 'tree',  title: 'Leave no trace',      body: 'We encourage low-impact camping. Pack it in, pack it out, and leave the site as you found it.' },
];

const About = () => (
    <div className="about">
        <div className="page-head">
            <div>
                <h1>About Campify</h1>
                <p>A community guide to places worth camping.</p>
            </div>
        </div>

        <div className="prose-wrap stack">
            <p className="prose prose--lead">
                Campify started from a simple idea: the best campsites are usually found through other campers, not brochures.
                So we built a place where people can list the spots they love, review the ones they have visited, and
                find somewhere new for the next trip.
            </p>
            <p className="prose">
                Whether it is a backcountry clearing or a family-friendly lakeside site, every listing has a location on the map,
                a nightly price, photos and reviews from the community. Browsing is free, and anyone with an account can add a campground.
            </p>
        </div>

        <h2 className="section-h about__h">What we care about</h2>
        <dl className="values">
            {values.map((v) => (
                <div key={v.title} className="values__item">
                    <dt><Icon name={v.icon} size={18} /> {v.title}</dt>
                    <dd className="muted">{v.body}</dd>
                </div>
            ))}
        </dl>

        <div className="about__cta row-gap">
            <Button variant="primary" to="/campgrounds" icon="arrow-right">Browse campgrounds</Button>
            <Button to="/contact">Get in touch</Button>
        </div>
    </div>
);

export default About;

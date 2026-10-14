import { Link } from 'react-router-dom';
import { Icon } from './ui';

const CampgroundCard = ({ campground }) => {
    const reviewCount = campground.reviews?.length || 0;
    const avgRating = reviewCount
        ? campground.reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviewCount
        : null;

    return (
        <article className="camp-card">
            <div className="camp-card__media">
                {campground.images?.length ? (
                    <img
                        src={campground.images[0].url.replace('/upload', '/upload/w_640,h_420,c_fill')}
                        alt=""
                        loading="lazy"
                    />
                ) : (
                    <div className="camp-card__placeholder"><Icon name="image" size={28} /><span>No photo yet</span></div>
                )}
            </div>
            <div className="camp-card__body">
                <h2 className="camp-card__title">
                    <Link to={`/campgrounds/${campground._id}`}>{campground.title}</Link>
                </h2>
                <p className="camp-card__loc muted"><Icon name="pin" size={14} /> {campground.location}</p>
                <p className="camp-card__desc muted">{campground.description || 'No description provided.'}</p>
                <div className="camp-card__foot">
                    <span className="camp-card__price"><strong>${campground.price}</strong> <span className="muted">/ night</span></span>
                    {avgRating !== null ? (
                        <span className="camp-card__rating" aria-label={`Rated ${avgRating.toFixed(1)} from ${reviewCount} review${reviewCount !== 1 ? 's' : ''}`}>
                            <Icon name="star" size={14} filled /> {avgRating.toFixed(1)} <span className="muted">({reviewCount})</span>
                        </span>
                    ) : (
                        <span className="muted">No reviews</span>
                    )}
                </div>
            </div>
        </article>
    );
};

export default CampgroundCard;

import { Fragment, useId, useState } from 'react';
import Icon from './ui/Icon';

const SIZES = { sm: 14, md: 18, lg: 24 };

const StarRating = ({ rating, setRating, readOnly = false, name = 'rating', size = 'md' }) => {
    const idPrefix = useId().replace(/:/g, '');
    const [hovered, setHovered] = useState(0);
    const px = SIZES[size] || SIZES.md;

    if (readOnly) {
        return (
            <span className="stars" role="img" aria-label={`${rating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map(num => (
                    <Icon key={num} name="star" size={px} filled={num <= rating} className={num <= rating ? 'stars__on' : 'stars__off'} />
                ))}
            </span>
        );
    }

    return (
        <fieldset className="stars stars--pick">
            <legend className="sr-only">Rating</legend>
            {[1, 2, 3, 4, 5].map((num) => (
                <Fragment key={num}>
                    <input
                        type="radio"
                        id={`${idPrefix}-${num}`}
                        name={name}
                        value={num}
                        checked={rating === num}
                        onChange={() => setRating(num)}
                        className="sr-only"
                    />
                    <label
                        htmlFor={`${idPrefix}-${num}`}
                        className="stars__label"
                        onMouseEnter={() => setHovered(num)}
                        onMouseLeave={() => setHovered(0)}
                    >
                        <span className="sr-only">{num} star{num > 1 ? 's' : ''}</span>
                        <Icon
                            name="star"
                            size={px}
                            filled={num <= (hovered || rating)}
                            className={num <= (hovered || rating) ? 'stars__on' : 'stars__off'}
                        />
                    </label>
                </Fragment>
            ))}
        </fieldset>
    );
};

export default StarRating;

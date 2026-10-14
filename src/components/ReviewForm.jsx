import { useState, useContext, useRef } from 'react';
import { createReview } from '../api/reviews';
import { FlashContext } from '../context/FlashContext';
import StarRating from './StarRating';
import { validateReview } from '../utils/validation';
import { Button, Textarea, Icon } from './ui';

const MAX_PHOTOS = 6;
const MAX_FILE_MB = 5;

const ReviewForm = ({ campgroundId, onReviewAdded }) => {
    const [rating, setRating] = useState(0);
    const [body, setBody] = useState('');
    const [photos, setPhotos] = useState([]); // [{file, preview}]
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);
    const { showFlash } = useContext(FlashContext);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const remaining = MAX_PHOTOS - photos.length;
        const toAdd = files.slice(0, remaining).filter(f => {
            if (f.size > MAX_FILE_MB * 1024 * 1024) {
                showFlash('danger', `${f.name} exceeds ${MAX_FILE_MB} MB limit.`);
                return false;
            }
            return true;
        });
        const newPhotos = toAdd.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
        setPhotos(prev => [...prev, ...newPhotos]);
        // Reset input so same file can be re-added if removed
        e.target.value = '';
    };

    const removePhoto = (idx) => {
        setPhotos(prev => {
            URL.revokeObjectURL(prev[idx].preview);
            return prev.filter((_, i) => i !== idx);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nextErrors = validateReview({ rating, body });
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('review[rating]', rating);
            fd.append('review[body]', body);
            photos.forEach(p => fd.append('image', p.file));

            const data = await createReview(campgroundId, fd);
            showFlash('success', 'Review posted!');

            // Clean up previews
            photos.forEach(p => URL.revokeObjectURL(p.preview));
            setRating(0);
            setBody('');
            setPhotos([]);
            if (onReviewAdded) onReviewAdded(data);
        } catch (err) {
            showFlash('danger', err.response?.data?.error || 'Could not post review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="stack" noValidate>
            <div className="field">
                <span className="field__label">Your rating</span>
                <StarRating
                    rating={rating}
                    setRating={(v) => {
                        setRating(v);
                        setErrors(c => ({ ...c, rating: undefined }));
                    }}
                    size="lg"
                    name={`rating-${campgroundId}`}
                />
                {errors.rating && (
                    <div className="field__error" role="alert"><Icon name="alert" size={14} /><span>{errors.rating}</span></div>
                )}
            </div>

            <Textarea
                label="Your review"
                id="review-body"
                rows={4}
                maxLength={1000}
                placeholder="What was it like? Terrain, noise, facilities, who you'd bring."
                value={body}
                error={errors.body}
                hint={`${body.length}/1000`}
                onChange={e => {
                    setBody(e.target.value);
                    setErrors(c => ({ ...c, body: undefined }));
                }}
            />

            <div className="field">
                <span className="field__label">Photos <span className="field__opt">(optional, up to {MAX_PHOTOS})</span></span>
                {photos.length < MAX_PHOTOS && (
                    <>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            multiple
                            className="sr-only"
                            tabIndex={-1}
                            onChange={handleFileChange}
                        />
                        <div>
                            <Button size="sm" icon="camera" onClick={() => fileInputRef.current?.click()}>Choose photos</Button>
                        </div>
                    </>
                )}
                {photos.length > 0 && (
                    <ul className="thumbs">
                        {photos.map((p, i) => (
                            <li key={i} className="thumb">
                                <img src={p.preview} alt={`Preview ${i + 1}`} />
                                <button type="button" className="thumb__x" onClick={() => removePhoto(i)} aria-label={`Remove photo ${i + 1}`}>
                                    <Icon name="x" size={12} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div>
                <Button type="submit" variant="primary" loading={submitting}>{submitting ? 'Posting…' : 'Post review'}</Button>
            </div>
        </form>
    );
};

export default ReviewForm;

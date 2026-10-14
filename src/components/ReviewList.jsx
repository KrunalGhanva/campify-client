import { useContext, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FlashContext } from '../context/FlashContext';
import { deleteReview, updateReview } from '../api/reviews';
import StarRating from './StarRating';
import { validateReview } from '../utils/validation';
import { Button, Textarea, Icon, Modal, EmptyState } from './ui';

/* ─── Aggregate rating summary ────────────────────────────────── */
const RatingSummary = ({ reviews }) => {
    if (!reviews.length) return null;

    const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    const counts = [5, 4, 3, 2, 1].map(n => ({
        star: n,
        count: reviews.filter(r => r.rating === n).length
    }));

    return (
        <div className="rating-summary">
            <div className="rating-summary__score">
                <div className="rating-summary__avg">{avg.toFixed(1)}</div>
                <StarRating rating={Math.round(avg)} readOnly />
                <div className="muted">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
            </div>
            <div className="rating-summary__bars">
                {counts.map(({ star, count }) => {
                    const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                    return (
                        <div key={star} className="rating-bar-row">
                            <span className="rating-bar-label">{star} star</span>
                            <div className="rating-bar-track" role="presentation">
                                <div className="rating-bar-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="rating-bar-count">{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ─── Inline edit form ────────────────────────────────────────── */
const EditReviewForm = ({ review, campgroundId, onSaved, onCancel }) => {
    const [rating, setRating] = useState(review.rating);
    const [body, setBody] = useState(review.body);
    const [photos, setPhotos] = useState([]); // new photos to add
    const [deleteImages, setDeleteImages] = useState([]); // filenames to remove
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);
    const { showFlash } = useContext(FlashContext);

    const toggleDeleteImage = (filename) => {
        setDeleteImages(prev =>
            prev.includes(filename) ? prev.filter(f => f !== filename) : [...prev, filename]
        );
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const total = (review.images?.length || 0) - deleteImages.length + photos.length + files.length;
        if (total > 6) {
            showFlash('danger', 'Maximum 6 photos per review.');
            return;
        }
        const newPhotos = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
        setPhotos(prev => [...prev, ...newPhotos]);
        e.target.value = '';
    };

    const removeNewPhoto = (idx) => {
        setPhotos(prev => {
            URL.revokeObjectURL(prev[idx].preview);
            return prev.filter((_, i) => i !== idx);
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const nextErrors = validateReview({ rating, body });
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('review[rating]', rating);
            fd.append('review[body]', body);
            photos.forEach(p => fd.append('image', p.file));
            deleteImages.forEach(fn => fd.append('deleteImages[]', fn));

            const data = await updateReview(campgroundId, review._id, fd);
            photos.forEach(p => URL.revokeObjectURL(p.preview));
            showFlash('success', 'Review updated!');
            onSaved(data);
        } catch (err) {
            showFlash('danger', err.response?.data?.error || 'Could not update review');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="stack edit-review" noValidate>
            <div className="field">
                <span className="field__label">Rating</span>
                <StarRating
                    rating={rating}
                    setRating={v => { setRating(v); setErrors(c => ({ ...c, rating: undefined })); }}
                    name={`edit-rating-${review._id}`}
                />
                {errors.rating && (
                    <div className="field__error" role="alert"><Icon name="alert" size={14} /><span>{errors.rating}</span></div>
                )}
            </div>

            <Textarea
                label="Review"
                id={`edit-body-${review._id}`}
                rows={3}
                maxLength={1000}
                value={body}
                error={errors.body}
                onChange={e => { setBody(e.target.value); setErrors(c => ({ ...c, body: undefined })); }}
            />

            {review.images && review.images.length > 0 && (
                <div className="field">
                    <span className="field__label">Existing photos</span>
                    <span className="field__hint">Select a photo to mark it for removal.</span>
                    <ul className="thumbs">
                        {review.images.map(img => {
                            const marked = deleteImages.includes(img.filename);
                            return (
                                <li key={img.filename} className={`thumb${marked ? ' thumb--marked' : ''}`}>
                                    <button
                                        type="button"
                                        className="thumb__btn"
                                        aria-pressed={marked}
                                        aria-label={marked ? 'Keep this photo' : 'Remove this photo'}
                                        onClick={() => toggleDeleteImage(img.filename)}
                                    >
                                        <img src={img.url} alt="" />
                                        {marked && <span className="thumb__tag">Remove</span>}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            <div className="field">
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
                    <Button size="sm" icon="camera" onClick={() => fileInputRef.current?.click()}>Add photos</Button>
                </div>
                {photos.length > 0 && (
                    <ul className="thumbs">
                        {photos.map((p, i) => (
                            <li key={i} className="thumb">
                                <img src={p.preview} alt="" />
                                <button type="button" className="thumb__x" onClick={() => removeNewPhoto(i)} aria-label={`Remove new photo ${i + 1}`}>
                                    <Icon name="x" size={12} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="row-gap">
                <Button type="submit" variant="primary" size="sm" loading={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
                <Button size="sm" onClick={onCancel} disabled={saving}>Cancel</Button>
            </div>
        </form>
    );
};

/* ─── Single review ───────────────────────────────────────────── */
const ReviewCard = ({ review, campgroundId, currentUser, onDeleted, onUpdated }) => {
    const { showFlash } = useContext(FlashContext);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [editing, setEditing] = useState(false);
    const [lightbox, setLightbox] = useState(null); // url string

    const isOwner = currentUser && review.author && review.author._id === currentUser._id;

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteReview(campgroundId, review._id);
            showFlash('success', 'Review deleted.');
            onDeleted(review._id);
        } catch (err) {
            showFlash('danger', err.response?.data?.error || 'Could not delete review');
            setConfirmDelete(false);
        } finally {
            setDeleting(false);
        }
    };

    const date = review.createdAt
        ? new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
        : null;

    return (
        <article className="review">
            <Modal open={!!lightbox} onClose={() => setLightbox(null)} title="Photo" size="lg">
                {lightbox && <img className="lightbox-img" src={lightbox} alt="Full size review" />}
            </Modal>
            <Modal
                open={confirmDelete}
                onClose={() => !deleting && setConfirmDelete(false)}
                title="Delete this review?"
                footer={
                    <>
                        <Button onClick={() => setConfirmDelete(false)} disabled={deleting}>Cancel</Button>
                        <Button variant="danger" loading={deleting} onClick={handleDelete}>{deleting ? 'Deleting…' : 'Delete review'}</Button>
                    </>
                }
            >
                <p>This can’t be undone.</p>
            </Modal>

            <header className="review__head">
                <img
                    src={review.author?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author?.username || 'U')}&background=E8EFE9&color=2F5D46&size=64`}
                    alt=""
                    className="avatar avatar--md"
                />
                <div className="review__who">
                    <strong>{review.author?.username}</strong>
                    {date && <span className="muted">{date}</span>}
                </div>
                <StarRating rating={review.rating} readOnly size="sm" />
            </header>

            <p className="review__body">{review.body}</p>

            {review.images && review.images.length > 0 && (
                <ul className="thumbs">
                    {review.images.map(img => (
                        <li key={img.filename || img._id} className="thumb">
                            <button type="button" className="thumb__btn" onClick={() => setLightbox(img.url)} aria-label="View photo full size">
                                <img src={img.url?.replace('/upload', '/upload/w_200,h_160,c_fill') || img.url} alt="" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {isOwner && !editing && (
                <div className="row-gap">
                    <Button size="sm" icon="edit" onClick={() => setEditing(true)}>Edit</Button>
                    <Button size="sm" variant="danger-ghost" icon="trash" onClick={() => setConfirmDelete(true)}>Delete</Button>
                </div>
            )}

            {editing && (
                <EditReviewForm
                    review={review}
                    campgroundId={campgroundId}
                    onSaved={(data) => { setEditing(false); onUpdated(data.review); }}
                    onCancel={() => setEditing(false)}
                />
            )}
        </article>
    );
};

/* ─── ReviewList (main export) ────────────────────────────────── */
const ReviewList = ({ reviews, campgroundId, onReviewDeleted, onReviewUpdated }) => {
    const { currentUser } = useContext(AuthContext);

    if (!reviews.length) {
        return (
            <EmptyState icon="chat" title="No reviews yet">
                Be the first to share what this place is like.
            </EmptyState>
        );
    }

    return (
        <div>
            <RatingSummary reviews={reviews} />
            <div className="reviews">
                {reviews.map(review => (
                    <ReviewCard
                        key={review._id}
                        review={review}
                        campgroundId={campgroundId}
                        currentUser={currentUser}
                        onDeleted={onReviewDeleted}
                        onUpdated={onReviewUpdated}
                    />
                ))}
            </div>
        </div>
    );
};

export default ReviewList;

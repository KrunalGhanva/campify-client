import { useCallback, useEffect, useState, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getCampground, deleteCampground } from '../api/campgrounds';
import { AuthContext } from '../context/AuthContext';
import { FlashContext } from '../context/FlashContext';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';
import { Button, Modal, Alert, Icon } from '../components/ui';

const CampgroundShow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [campground, setCampground]   = useState(null);
    const [loading, setLoading]         = useState(true);
    const [deleting, setDeleting]       = useState(false);
    const [activeImg, setActiveImg]     = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const mapContainerRef = useRef(null);
    const mapRef          = useRef(null);

    const { currentUser } = useContext(AuthContext);
    const { showFlash }   = useContext(FlashContext);
    const mapToken        = import.meta.env.VITE_MAPBOX_TOKEN;

    const fetchCampground = useCallback(async () => {
        try {
            const data = await getCampground(id);
            setCampground(data.campground);
        } catch {
            showFlash('danger', 'Cannot find that campground!');
            navigate('/campgrounds');
        } finally {
            setLoading(false);
        }
    }, [id, navigate, showFlash]);

    useEffect(() => { fetchCampground(); }, [fetchCampground]);

    useEffect(() => {
        if (!loading && mapToken && campground?.geometry && mapContainerRef.current && !mapRef.current) {
            mapboxgl.accessToken = mapToken;
            const map = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/outdoors-v12',
                center: campground.geometry.coordinates,
                zoom: 10
            });
            map.addControl(new mapboxgl.NavigationControl());
            new mapboxgl.Marker({ color: '#A64B1B' })
                .setLngLat(campground.geometry.coordinates)
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(
                    `<strong style="font-family:Inter,sans-serif;color:#1F2421">${campground.title}</strong>
                     <p style="font-size:0.78rem;color:#5F625B;margin:4px 0 0">${campground.location}</p>`
                ))
                .addTo(map);
            mapRef.current = map;
        }
        return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
    }, [loading, campground, mapToken]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteCampground(id);
            showFlash('success', 'Campground deleted.');
            navigate('/campgrounds');
        } catch (err) {
            showFlash('danger', err.response?.data?.error || 'Error deleting campground');
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading)     return <LoadingSpinner label="Loading campground…" />;
    if (!campground) return null;

    const images     = campground.images || [];
    const reviews    = campground.reviews || [];
    const isAuthor   = currentUser && campground.author && campground.author._id === currentUser._id;
    const avgRating  = reviews.length
        ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length
        : null;

    return (
        <div>
            <Modal
                open={showDeleteModal}
                onClose={() => !deleting && setShowDeleteModal(false)}
                title="Delete this campground?"
                footer={
                    <>
                        <Button onClick={() => setShowDeleteModal(false)} disabled={deleting}>Cancel</Button>
                        <Button variant="danger" loading={deleting} onClick={handleDelete}>{deleting ? 'Deleting…' : 'Delete campground'}</Button>
                    </>
                }
            >
                <p>
                    This permanently removes <strong>{campground.title}</strong>, its photos and all of its reviews. This can’t be undone.
                </p>
            </Modal>

            <nav aria-label="Breadcrumb" className="crumbs">
                <Button variant="ghost" size="sm" icon="arrow-left" to="/campgrounds">All campgrounds</Button>
            </nav>

            <div className="page-head">
                <div>
                    <h1>{campground.title}</h1>
                    <p className="row-gap">
                        <span><Icon name="pin" size={14} /> {campground.location}</span>
                        {campground.author?.username && <span>· Listed by {campground.author.username}</span>}
                    </p>
                </div>
                {isAuthor && (
                    <div className="row-gap">
                        <Button icon="edit" to={`/campgrounds/${campground._id}/edit`}>Edit</Button>
                        <Button variant="danger-ghost" icon="trash" onClick={() => setShowDeleteModal(true)}>Delete</Button>
                    </div>
                )}
            </div>

            {images.length > 0 && (
                <figure className="gallery">
                    <img className="gallery__main" src={images[activeImg]?.url} alt={`${campground.title}, photo ${activeImg + 1} of ${images.length}`} />
                    {images.length > 1 && (
                        <ul className="thumbs gallery__thumbs">
                            {images.map((img, i) => (
                                <li key={img._id} className={`thumb thumb--lg${i === activeImg ? ' thumb--on' : ''}`}>
                                    <button type="button" className="thumb__btn" onClick={() => setActiveImg(i)}
                                        aria-label={`Show photo ${i + 1}`} aria-pressed={i === activeImg}>
                                        <img src={img.url.replace('/upload', '/upload/w_160,h_160,c_fill')} alt="" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </figure>
            )}

            <div className="show">
                <div className="show__main">
                    <section aria-labelledby="about-h" className="stack">
                        <h2 id="about-h" className="sr-only">About</h2>
                        <div className="facts">
                            <div>
                                <div className="facts__k">Price</div>
                                <div className="facts__v">${campground.price}<span className="muted"> / night</span></div>
                            </div>
                            <div>
                                <div className="facts__k">Rating</div>
                                <div className="facts__v">
                                    {avgRating !== null ? (
                                        <span className="row-gap"><StarRating rating={Math.round(avgRating)} readOnly size="sm" /> {avgRating.toFixed(1)}</span>
                                    ) : <span className="muted">No reviews yet</span>}
                                </div>
                            </div>
                        </div>
                        <p className="prose">{campground.description || 'No description provided.'}</p>
                    </section>

                    <hr className="divider" />

                    <section aria-labelledby="reviews-h">
                        <h2 id="reviews-h" className="section-h">Reviews {reviews.length > 0 && <span className="muted">({reviews.length})</span>}</h2>
                        <ReviewList
                            reviews={reviews}
                            campgroundId={id}
                            onReviewDeleted={fetchCampground}
                            onReviewUpdated={(updatedReview) => {
                                setCampground(prev => ({
                                    ...prev,
                                    reviews: prev.reviews.map(r => r._id === updatedReview._id ? updatedReview : r)
                                }));
                            }}
                        />
                    </section>
                </div>

                <aside className="show__side stack">
                    {mapToken ? (
                        <div>
                            <div ref={mapContainerRef} className="map-box map-box--sm" role="region" aria-label="Location map" />
                        </div>
                    ) : (
                        <Alert variant="warning">Map unavailable. Set <code>VITE_MAPBOX_TOKEN</code> to enable it.</Alert>
                    )}

                    <section className="panel" aria-labelledby="leave-h">
                        <h2 id="leave-h" className="section-h">Leave a review</h2>
                        {currentUser ? (
                            <ReviewForm campgroundId={id} onReviewAdded={fetchCampground} />
                        ) : (
                            <div className="stack">
                                <p className="muted">Log in to rate this campground and share photos.</p>
                                <div><Button variant="primary" to="/login">Log in</Button></div>
                            </div>
                        )}
                    </section>
                </aside>
            </div>
        </div>
    );
};

export default CampgroundShow;

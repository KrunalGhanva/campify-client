import { useEffect, useState, useCallback, useContext } from 'react';
import { getAdminReviews, deleteAdminReview } from '../../api/admin';
import { FlashContext } from '../../context/FlashContext';
import StarRating from '../../components/StarRating';
import { Button, Table, Pagination, Modal, EmptyState, Loading, Icon } from '../../components/ui';

const LIMIT = 10;

const avatar = (user) =>
    user?.avatar?.url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || '?')}&background=E8EFE9&color=2F5D46&size=48`;

const AdminReviews = () => {
    const { showFlash } = useContext(FlashContext);
    const [reviews, setReviews] = useState([]);
    const [total, setTotal]     = useState(0);
    const [page, setPage]       = useState(1);
    const [pages, setPages]     = useState(1);
    const [loading, setLoading] = useState(true);
    const [confirmReview, setConfirmReview] = useState(null);
    const [busyId, setBusyId]   = useState(null);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAdminReviews({ page, limit: LIMIT });
            setReviews(data.reviews);
            setTotal(data.total);
            setPages(data.pages);
        } catch {
            showFlash('danger', 'Failed to load reviews.');
        } finally {
            setLoading(false);
        }
    }, [page, showFlash]);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    const handleDelete = async () => {
        if (!confirmReview) return;
        setBusyId(confirmReview._id);
        setConfirmReview(null);
        try {
            const res = await deleteAdminReview(confirmReview._id);
            showFlash('success', res.message);
            fetchReviews();
        } catch (err) {
            showFlash('danger', err.response?.data?.error || 'Failed to delete review.');
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div>
            <Modal
                open={!!confirmReview}
                onClose={() => setConfirmReview(null)}
                title="Delete review?"
                footer={
                    <>
                        <Button onClick={() => setConfirmReview(null)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDelete}>Delete</Button>
                    </>
                }
            >
                {confirmReview && (
                    <div className="stack">
                        <p>Delete this review by <strong>{confirmReview.author?.username}</strong>?</p>
                        <blockquote className="quote">
                            {confirmReview.body?.slice(0, 120)}{confirmReview.body?.length > 120 ? '…' : ''}
                        </blockquote>
                    </div>
                )}
            </Modal>

            <div className="page-head">
                <div>
                    <h1>Reviews</h1>
                    <p>{total} total</p>
                </div>
            </div>

            {loading ? (
                <Loading label="Loading reviews…" />
            ) : reviews.length === 0 ? (
                <EmptyState icon="chat" title="No reviews found">Reviews will appear here as campers post them.</EmptyState>
            ) : (
                <Table label="Reviews">
                    <thead>
                        <tr>
                            <th scope="col">Author</th>
                            <th scope="col">Rating</th>
                            <th scope="col">Review</th>
                            <th scope="col">Photos</th>
                            <th scope="col">Date</th>
                            <th scope="col"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map(r => (
                            <tr key={r._id}>
                                <td>
                                    <div className="cell-media">
                                        <img src={avatar(r.author)} alt="" className="avatar avatar--md" />
                                        <strong>{r.author?.username || '—'}</strong>
                                    </div>
                                </td>
                                <td><StarRating rating={r.rating} readOnly size="sm" /></td>
                                <td className="cell-clip muted">{r.body}</td>
                                <td className="muted">{r.images?.length || 0}</td>
                                <td className="muted">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
                                <td className="actions">
                                    <Button size="sm" variant="danger-ghost" iconOnly aria-label={`Delete review by ${r.author?.username || 'unknown'}`}
                                        loading={busyId === r._id} onClick={() => setConfirmReview(r)} disabled={busyId === r._id}>
                                        <Icon name="trash" size={14} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            <Pagination page={page} pages={pages} total={total} onChange={setPage} label="Reviews pagination" />
        </div>
    );
};

export default AdminReviews;

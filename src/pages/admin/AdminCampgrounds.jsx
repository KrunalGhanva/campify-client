import { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { getAdminCampgrounds, deleteAdminCampground } from '../../api/admin';
import { FlashContext } from '../../context/FlashContext';
import { Button, Table, Pagination, Modal, EmptyState, Loading, Icon } from '../../components/ui';

const LIMIT = 10;

const AdminCampgrounds = () => {
    const { showFlash } = useContext(FlashContext);
    const [campgrounds, setCampgrounds] = useState([]);
    const [total, setTotal]   = useState(0);
    const [page, setPage]     = useState(1);
    const [pages, setPages]   = useState(1);
    const [loading, setLoading] = useState(true);
    const [pendingSearch, setPendingSearch] = useState('');
    const [search, setSearch] = useState('');
    const [confirmCamp, setConfirmCamp] = useState(null);
    const [busyId, setBusyId] = useState(null);
    const timer = useRef(null);

    const fetchCamps = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAdminCampgrounds({ page, limit: LIMIT, search: search || undefined });
            setCampgrounds(data.campgrounds);
            setTotal(data.total);
            setPages(data.pages);
        } catch {
            showFlash('danger', 'Failed to load campgrounds.');
        } finally {
            setLoading(false);
        }
    }, [page, search, showFlash]);

    useEffect(() => { fetchCamps(); }, [fetchCamps]);

    const handleSearch = (e) => {
        const v = e.target.value;
        setPendingSearch(v);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => { setSearch(v); setPage(1); }, 350);
    };

    const handleDelete = async () => {
        if (!confirmCamp) return;
        setBusyId(confirmCamp._id);
        setConfirmCamp(null);
        try {
            const res = await deleteAdminCampground(confirmCamp._id);
            showFlash('success', res.message);
            fetchCamps();
        } catch (err) {
            showFlash('danger', err.response?.data?.error || 'Failed to delete.');
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div>
            <Modal
                open={!!confirmCamp}
                onClose={() => setConfirmCamp(null)}
                title="Delete campground?"
                footer={
                    <>
                        <Button onClick={() => setConfirmCamp(null)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDelete}>Delete</Button>
                    </>
                }
            >
                {confirmCamp && (
                    <p>Delete <strong>{confirmCamp.title}</strong>? Its photos and reviews are removed too. This can’t be undone.</p>
                )}
            </Modal>

            <div className="page-head">
                <div>
                    <h1>Campgrounds</h1>
                    <p>{total} total</p>
                </div>
            </div>

            <div className="toolbar">
                <div className="input-icon toolbar__search">
                    <Icon name="search" size={16} />
                    <input
                        type="search"
                        className="input"
                        aria-label="Search campgrounds"
                        placeholder="Search by title or location"
                        value={pendingSearch}
                        onChange={handleSearch}
                        id="admin-camp-search"
                    />
                </div>
            </div>

            {loading ? (
                <Loading label="Loading campgrounds…" />
            ) : campgrounds.length === 0 ? (
                <EmptyState icon="tent" title="No campgrounds found">Try a different search.</EmptyState>
            ) : (
                <Table label="Campgrounds">
                    <thead>
                        <tr>
                            <th scope="col">Campground</th>
                            <th scope="col">Location</th>
                            <th scope="col">Author</th>
                            <th scope="col" className="num">Price</th>
                            <th scope="col"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {campgrounds.map(c => (
                            <tr key={c._id}>
                                <td>
                                    <div className="cell-media">
                                        {c.images?.[0]?.url ? (
                                            <img src={c.images[0].url.replace('/upload', '/upload/w_80,h_80,c_fill')} alt="" className="list-rows__img" />
                                        ) : (
                                            <span className="list-rows__img list-rows__img--empty"><Icon name="image" size={18} /></span>
                                        )}
                                        <strong>{c.title}</strong>
                                    </div>
                                </td>
                                <td className="muted">{c.location}</td>
                                <td>{c.author?.username || '—'}</td>
                                <td className="num">${c.price}</td>
                                <td className="actions">
                                    <Button size="sm" variant="ghost" iconOnly aria-label={`View ${c.title} on site`}
                                        to={`/campgrounds/${c._id}`} target="_blank" rel="noreferrer">
                                        <Icon name="external" size={14} />
                                    </Button>
                                    <Button size="sm" variant="ghost" iconOnly aria-label={`Edit ${c.title}`}
                                        to={`/campgrounds/${c._id}/edit`} target="_blank" rel="noreferrer">
                                        <Icon name="edit" size={14} />
                                    </Button>
                                    <Button size="sm" variant="danger-ghost" iconOnly aria-label={`Delete ${c.title}`}
                                        loading={busyId === c._id} onClick={() => setConfirmCamp(c)} disabled={busyId === c._id}>
                                        <Icon name="trash" size={14} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            <Pagination page={page} pages={pages} total={total} onChange={setPage} label="Campgrounds pagination" />
        </div>
    );
};

export default AdminCampgrounds;

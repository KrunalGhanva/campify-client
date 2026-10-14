import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCampground, updateCampground } from '../api/campgrounds';
import { FlashContext } from '../context/FlashContext';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { validateCampground } from '../utils/validation';
import { Button } from '../components/ui';
import { CampgroundFields, NewPhotoThumbs } from '../components/CampgroundFields';

const CampgroundEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showFlash }   = useContext(FlashContext);
    const { currentUser } = useContext(AuthContext);

    const [campground, setCampground]     = useState(null);
    const [loading, setLoading]           = useState(true);
    const [formData, setFormData]         = useState({ title: '', location: '', price: '', description: '' });
    const [newImages, setNewImages]       = useState([]);
    const [newPreviews, setNewPreviews]   = useState([]);
    const [deleteImages, setDeleteImages] = useState([]);
    const [errors, setErrors]             = useState({});
    const [submitting, setSubmitting]     = useState(false);

    useEffect(() => {
        const fetchCampground = async () => {
            try {
                const data = await getCampground(id);
                if (!data.campground.author || data.campground.author._id !== currentUser?._id) {
                    showFlash('danger', 'You do not have permission to edit that campground.');
                    navigate(`/campgrounds/${id}`, { replace: true });
                    return;
                }
                setCampground(data.campground);
                setFormData({
                    title:       data.campground.title,
                    location:    data.campground.location,
                    price:       data.campground.price,
                    description: data.campground.description,
                });
            } catch {
                showFlash('danger', 'Cannot find that campground!');
                navigate('/campgrounds');
            } finally {
                setLoading(false);
            }
        };
        fetchCampground();
    }, [id, currentUser, navigate, showFlash]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Validation runs on submit; just clear this field's stale error while typing.
        if (errors[name]) setErrors(({ [name]: _cleared, ...rest }) => rest);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setNewImages(files);
        setNewPreviews(files.map(f => URL.createObjectURL(f)));
    };

    const removeNewPreview = (idx) => {
        setNewImages(prev => prev.filter((_, i) => i !== idx));
        setNewPreviews(prev => prev.filter((_, i) => i !== idx));
    };

    const toggleDeleteImage = (filename) => {
        setDeleteImages(prev =>
            prev.includes(filename) ? prev.filter(f => f !== filename) : [...prev, filename]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nextErrors = validateCampground(formData);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        const data = new FormData();
        data.append('campground[title]',       formData.title);
        data.append('campground[location]',    formData.location);
        data.append('campground[price]',       formData.price);
        data.append('campground[description]', formData.description);
        newImages.forEach(f => data.append('image', f));
        deleteImages.forEach(fn => data.append('deleteImages[]', fn));

        setSubmitting(true);
        try {
            const res = await updateCampground(id, data);
            showFlash('success', 'Campground updated!');
            navigate(`/campgrounds/${res.campground._id}`);
        } catch (err) {
            showFlash('danger', err.response?.data?.error || 'Failed to update campground');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading)     return <LoadingSpinner label="Loading campground..." />;
    if (!campground) return null;

    return (
        <div className="narrow">
            <div className="page-head">
                <div>
                    <h1>Edit campground</h1>
                    <p>{campground.title}</p>
                </div>
            </div>

            <form className="stack" onSubmit={handleSubmit} noValidate encType="multipart/form-data">
                <CampgroundFields formData={formData} errors={errors} onChange={handleChange} />

                {campground.images?.length > 0 && (
                    <div className="field">
                        <span className="field__label">Current photos</span>
                        <span className="field__hint">Select a photo to mark it for removal. Changes apply when you save.</span>
                        <ul className="thumbs">
                            {campground.images.map((img, i) => {
                                const marked = deleteImages.includes(img.filename);
                                return (
                                    <li key={img._id} className={`thumb thumb--lg${marked ? ' thumb--marked' : ''}`}>
                                        <button
                                            type="button"
                                            className="thumb__btn"
                                            aria-pressed={marked}
                                            aria-label={`${marked ? 'Keep' : 'Remove'} photo ${i + 1}`}
                                            onClick={() => toggleDeleteImage(img.filename)}
                                        >
                                            <img src={(img.thumbnail || img.url).replace('/upload', '/upload/w_160,h_160,c_fill')} alt="" />
                                            {marked && <span className="thumb__tag">Remove</span>}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                        {deleteImages.length > 0 && (
                            <span className="field__error" role="status">
                                {deleteImages.length} photo{deleteImages.length > 1 ? 's' : ''} will be removed on save.
                            </span>
                        )}
                    </div>
                )}

                <div className="field">
                    <label className="field__label" htmlFor="formFileMultiple">Add photos <span className="field__opt">(optional)</span></label>
                    <input id="formFileMultiple" name="image" type="file" className="input"
                        accept="image/jpeg,image/png" multiple onChange={handleFileChange} />
                    <NewPhotoThumbs previews={newPreviews} onRemove={removeNewPreview} />
                </div>

                <div className="row-gap">
                    <Button type="submit" variant="primary" size="lg" loading={submitting}>
                        {submitting ? 'Saving…' : 'Save changes'}
                    </Button>
                    <Button size="lg" to={`/campgrounds/${id}`}>Cancel</Button>
                </div>
            </form>
        </div>
    );
};

export default CampgroundEdit;

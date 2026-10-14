import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCampground } from '../api/campgrounds';
import { FlashContext } from '../context/FlashContext';
import { validateCampground } from '../utils/validation';
import { Button } from '../components/ui';
import { CampgroundFields, NewPhotoThumbs } from '../components/CampgroundFields';

const CampgroundNew = () => {
    const navigate = useNavigate();
    const { showFlash } = useContext(FlashContext);

    const [formData, setFormData] = useState({ title: '', location: '', price: '', description: '' });
    const [images, setImages]     = useState([]);
    const [previews, setPreviews] = useState([]);
    const [errors, setErrors]     = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Validation runs on submit; just clear this field's stale error while typing.
        if (errors[name]) setErrors(({ [name]: _cleared, ...rest }) => rest);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
        const urls = files.map(f => URL.createObjectURL(f));
        setPreviews(urls);
    };

    const removePreview = (idx) => {
        const newFiles = images.filter((_, i) => i !== idx);
        const newUrls  = previews.filter((_, i) => i !== idx);
        setImages(newFiles);
        setPreviews(newUrls);
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
        images.forEach(f => data.append('image', f));

        setSubmitting(true);
        try {
            const res = await createCampground(data);
            showFlash('success', 'Campground created!');
            navigate(`/campgrounds/${res.campground._id}`);
        } catch (err) {
            showFlash('danger', err.response?.data?.error || 'Failed to create campground');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="narrow">
            <div className="page-head">
                <div>
                    <h1>Add a campground</h1>
                    <p>Share a good spot with the Campify community.</p>
                </div>
            </div>

            <form className="stack" onSubmit={handleSubmit} noValidate encType="multipart/form-data">
                <CampgroundFields formData={formData} errors={errors} onChange={handleChange} />

                <div className="field">
                    <label className="field__label" htmlFor="formFileMultiple">Photos <span className="field__opt">(optional)</span></label>
                    <input id="formFileMultiple" name="image" type="file" className="input"
                        accept="image/jpeg,image/png" multiple onChange={handleFileChange} />
                    <span className="field__hint">PNG or JPG. You can select several at once.</span>
                    <NewPhotoThumbs previews={previews} onRemove={removePreview} />
                </div>

                <div className="row-gap">
                    <Button type="submit" variant="primary" size="lg" loading={submitting}>
                        {submitting ? 'Creating…' : 'Create campground'}
                    </Button>
                    <Button size="lg" to="/campgrounds">Cancel</Button>
                </div>
            </form>
        </div>
    );
};

export default CampgroundNew;

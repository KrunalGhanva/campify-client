import { Input, Textarea, Icon } from './ui';

/** Presentational fields shared by the New and Edit campground pages. State stays in the page. */
export const CampgroundFields = ({ formData, errors, onChange }) => (
    <>
        <Input label="Title" id="title" name="title" type="text" maxLength="100"
            placeholder="Blue Ridge Summit Camp"
            value={formData.title} onChange={onChange} error={errors.title} />
        <Input label="Location" id="location" name="location" type="text" maxLength="200"
            placeholder="Asheville, North Carolina"
            hint="Used to place the campground on the map."
            value={formData.location} onChange={onChange} error={errors.location} />
        <Input label="Price per night (USD)" id="price" name="price" type="number" min="0" step="0.01" inputMode="decimal"
            placeholder="0.00"
            value={formData.price} onChange={onChange} error={errors.price} />
        <Textarea label="Description" id="description" name="description" rows={6} maxLength="2000"
            placeholder="Terrain, facilities, best season, what makes it worth the drive."
            hint={`${formData.description.length}/2000`}
            value={formData.description} onChange={onChange} error={errors.description} />
    </>
);

/** Thumbnail list with a remove button (new uploads). */
export const NewPhotoThumbs = ({ previews, onRemove }) => (
    previews.length > 0 ? (
        <ul className="thumbs">
            {previews.map((url, i) => (
                <li key={url} className="thumb">
                    <img src={url} alt={`New photo ${i + 1}`} />
                    <button type="button" className="thumb__x" onClick={() => onRemove(i)} aria-label={`Remove new photo ${i + 1}`}>
                        <Icon name="x" size={12} />
                    </button>
                </li>
            ))}
        </ul>
    ) : null
);

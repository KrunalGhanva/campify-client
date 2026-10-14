import { useState, useContext } from 'react';
import { FlashContext } from '../context/FlashContext';
import { Button, Input, Textarea, Select, Icon, Alert } from '../components/ui';

/* ── Contact info items ───────────────────────────────── */
const INFO_ITEMS = [
    { icon: 'mail',  label: 'Email',         value: 'support@campify.com'             },
    { icon: 'phone', label: 'Phone',         value: '+1 (555) 123-4567'               },
    { icon: 'pin',   label: 'Office',        value: '123 Trail View, Nature City, CA' },
    { icon: 'info',  label: 'Support hours', value: 'Mon – Fri · 9 AM – 6 PM IST'     },
];

const SUBJECTS = [
    'General Inquiry',
    'Report a Campground',
    'Account Issue',
    'Partnership',
    'Other',
];

/* ── Validation ───────────────────────────────────────── */
const validate = ({ name, email, subject, message }) => {
    const e = {};
    if (!name.trim())    e.name    = 'Name is required';
    if (!email.trim())   e.email   = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!subject)        e.subject = 'Please select a subject';
    if (!message.trim()) e.message = 'Message cannot be empty';
    return e;
};

/* ── Page component ───────────────────────────────────── */
const Contact = () => {
    const { showFlash } = useContext(FlashContext);

    const [form, setForm]           = useState({ name: '', email: '', subject: '', message: '' });
    const [errors, setErrors]       = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent]           = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate(form);
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSubmitting(true);
        await new Promise(r => setTimeout(r, 900));   // simulate network
        setSubmitting(false);
        setSent(true);
        showFlash('success', "Message sent! We’ll get back to you within 24 hours.");
    };

    const handleReset = () => {
        setForm({ name: '', email: '', subject: '', message: '' });
        setErrors({});
        setSent(false);
    };

    return (
        <div>
            <div className="page-head">
                <div>
                    <h1>Contact</h1>
                    <p>Questions, feedback or a campground to report? Send us a note.</p>
                </div>
            </div>

            <div className="split">
                <div>
                    {sent ? (
                        <div className="stack" role="status">
                            <Alert variant="info" title="Message sent">
                                Thanks, {form.name}. We’ll reply to {form.email} within 24 hours.
                            </Alert>
                            <div><Button onClick={handleReset}>Send another message</Button></div>
                        </div>
                    ) : (
                        <form className="stack" onSubmit={handleSubmit} noValidate>
                            <div className="grid-2">
                                <Input label="Name" id="name" name="name" autoComplete="name"
                                    value={form.name} onChange={handleChange} error={errors.name} />
                                <Input label="Email" id="email" name="email" type="email" autoComplete="email"
                                    value={form.email} onChange={handleChange} error={errors.email} />
                            </div>
                            <Select label="Subject" id="subject" name="subject"
                                value={form.subject} onChange={handleChange} error={errors.subject}>
                                <option value="">Select a subject</option>
                                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </Select>
                            <Textarea label="Message" id="message" name="message" rows={6}
                                value={form.message} onChange={handleChange} error={errors.message} />
                            <div>
                                <Button type="submit" variant="primary" size="lg" loading={submitting}>
                                    {submitting ? 'Sending…' : 'Send message'}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>

                <aside aria-label="Contact details">
                    <ul className="info-list">
                        {INFO_ITEMS.map(item => (
                            <li key={item.label}>
                                <Icon name={item.icon} size={18} />
                                <div>
                                    <div className="muted">{item.label}</div>
                                    <div>{item.value}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </aside>
            </div>
        </div>
    );
};

export default Contact;

import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FlashContext } from '../context/FlashContext';
import AuthForm from '../components/AuthForm';
import { validateRegistration } from '../utils/validation';
import { Input } from '../components/ui';

const Register = () => {
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const { register } = useContext(AuthContext);
    const { showFlash } = useContext(FlashContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nextErrors = validateRegistration({ email, mobile, username, password });
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        setSubmitting(true);
        try {
            await register(email, mobile, username, password);
            showFlash('success', 'Welcome to Campify!');
            navigate('/campgrounds');
        } catch (err) {
            const response = err.response?.data;
            if (response?.code === 'EMAIL_IN_USE') {
                setErrors((current) => ({ ...current, email: 'This email is already registered.' }));
            }
            if (response?.code === 'MOBILE_IN_USE') {
                setErrors((current) => ({ ...current, mobile: 'This mobile number is already registered.' }));
            }
            if (response?.code === 'USERNAME_IN_USE') {
                setErrors((current) => ({ ...current, username: 'This username is already taken.' }));
            }
            showFlash('danger', response?.error || 'Registration failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthForm 
            title="Create account" 
            onSubmit={handleSubmit} 
            linkTo="/login" 
            linkText="Already have an account? Log in"
            submitting={submitting}
        >
            <Input label="Username" type="text" id="username" name="username" maxLength="30" autoFocus
                autoComplete="username" error={errors.username}
                value={username} onChange={e => {
                    setUsername(e.target.value);
                    setErrors(validateRegistration({ email, mobile, username: e.target.value, password }));
                }} />
            <Input label="Email" type="email" id="email" name="email" autoComplete="email"
                hint="Provide an email or a mobile number, or both." error={errors.email}
                value={email} onChange={e => {
                    setEmail(e.target.value);
                    setErrors(validateRegistration({ email: e.target.value, mobile, username, password }));
                }} />
            <Input label="Mobile number" type="tel" id="mobile" name="mobile" autoComplete="tel" error={errors.mobile}
                value={mobile} onChange={e => {
                    setMobile(e.target.value);
                    setErrors(validateRegistration({ email, mobile: e.target.value, username, password }));
                }} />
            <Input label="Password" type="password" id="password" name="password" autoComplete="new-password"
                hint="6 to 128 characters." error={errors.password}
                value={password} onChange={e => {
                    setPassword(e.target.value);
                    setErrors(validateRegistration({ email, mobile, username, password: e.target.value }));
                }} />
        </AuthForm>
    );
};

export default Register;

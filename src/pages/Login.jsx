import { useState, useContext } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FlashContext } from '../context/FlashContext';
import AuthForm from '../components/AuthForm';
import { validateLogin } from '../utils/validation';
import { Input, Alert } from '../components/ui';

const Login = () => {
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const { login } = useContext(AuthContext);
    const { showFlash } = useContext(FlashContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const isSuspended = searchParams.get('reason') === 'suspended';

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nextErrors = validateLogin({ loginIdentifier, password });
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        setSubmitting(true);
        try {
            await login(loginIdentifier, password);
            showFlash('success', 'Welcome back!');
            const redirectTo = location.state?.from?.pathname || '/campgrounds';
            navigate(redirectTo, { replace: true });
        } catch (err) {
            showFlash('danger', err.response?.data?.error || 'Invalid username or password');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthForm 
            title="Log in" 
            onSubmit={handleSubmit} 
            linkTo="/register" 
            linkText="New to Campify? Create an account"
            submitting={submitting}
        >
            {isSuspended && (
                <Alert title="Account suspended">
                    An administrator has suspended your account. Contact support if you believe this is a mistake.
                </Alert>
            )}
            <Input label="Username, email or mobile" type="text" id="loginIdentifier" name="loginIdentifier" autoFocus
                autoComplete="username" error={errors.loginIdentifier}
                value={loginIdentifier} onChange={e => {
                    setLoginIdentifier(e.target.value);
                    setErrors(validateLogin({ loginIdentifier: e.target.value, password }));
                }} />
            <Input label="Password" type="password" id="password" name="password"
                autoComplete="current-password" error={errors.password}
                value={password} onChange={e => {
                    setPassword(e.target.value);
                    setErrors(validateLogin({ loginIdentifier, password: e.target.value }));
                }} />
        </AuthForm>
    );
};

export default Login;

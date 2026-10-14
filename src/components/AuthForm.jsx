import { Link } from 'react-router-dom';
import { Button, Icon } from './ui';

/** Auth page shell: a plain bordered panel, no hero image. Same props as before. */
const AuthForm = ({ title, onSubmit, children, linkTo, linkText, submitting = false }) => {
    return (
        <div className="auth">
            <h1 className="display auth__title">{title}</h1>
            <form className="auth__form stack" onSubmit={onSubmit} noValidate>
                {children}
                <Button type="submit" variant="primary" size="lg" block loading={submitting}>
                    {submitting ? 'Please wait…' : title}
                </Button>
            </form>
            <p className="auth__alt">
                <Link to={linkTo}>{linkText} <Icon name="arrow-right" size={14} /></Link>
            </p>
        </div>
    );
};

export default AuthForm;

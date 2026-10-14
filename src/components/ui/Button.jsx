import { Link } from 'react-router-dom';
import Icon from './Icon';

/**
 * Button. Renders <button>, or a router <Link> when `to` is given.
 * variant: primary | secondary | ghost | danger | danger-ghost
 * loading: shows a spinner, disables the button, sets aria-busy.
 */
const Button = ({
    variant = 'secondary',
    size = 'md',
    loading = false,
    block = false,
    iconOnly = false,
    icon,
    to,
    type = 'button',
    disabled,
    className = '',
    children,
    ...rest
}) => {
    const cls = [
        'btn-ui',
        `btn-ui--${variant}`,
        size !== 'md' && `btn-ui--${size}`,
        block && 'btn-ui--block',
        iconOnly && 'btn-ui--icon',
        className,
    ].filter(Boolean).join(' ');

    const content = (
        <>
            {loading ? <span className="spinner" aria-hidden="true" /> : icon && <Icon name={icon} size={16} />}
            {children}
        </>
    );

    if (to) {
        return <Link to={to} className={cls} {...rest}>{content}</Link>;
    }
    return (
        <button
            type={type}
            className={cls}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            {...rest}
        >
            {content}
        </button>
    );
};

export default Button;

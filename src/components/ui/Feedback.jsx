import Icon from './Icon';
import Button from './Button';

/** Page/section loading state. */
export const Loading = ({ label = 'Loading…', fullPage = false }) => (
    <div className="loading" role="status" style={fullPage ? { minHeight: '60vh', justifyContent: 'center' } : undefined}>
        <span className="spinner spinner--lg" aria-hidden="true" />
        <span>{label}</span>
    </div>
);

/** Placeholder shapes while content loads. */
export const Skeleton = ({ variant = 'line', width, className = '' }) => (
    <div className={`skeleton skeleton--${variant} ${className}`.trim()} style={width ? { width } : undefined} aria-hidden="true" />
);

/** Empty list / no results. `action` is an optional node (usually a Button). */
export const EmptyState = ({ icon = 'tent', title, children, action }) => (
    <div className="empty">
        <Icon name={icon} size={32} />
        <h2>{title}</h2>
        {children && <p>{children}</p>}
        {action}
    </div>
);

/** Inline error/warning with optional retry. */
export const Alert = ({ variant = 'danger', title, children, onRetry, retryLabel = 'Try again' }) => (
    <div className={`alert-ui alert-ui--${variant}`} role={variant === 'danger' ? 'alert' : 'status'}>
        <Icon name={variant === 'info' ? 'info' : 'alert'} size={18} />
        <div className="alert-ui__body">
            {title && <div className="alert-ui__title">{title}</div>}
            {children && <div>{children}</div>}
        </div>
        {onRetry && <Button size="sm" onClick={onRetry}>{retryLabel}</Button>}
    </div>
);

export const Badge = ({ tone = 'neutral', children }) => (
    <span className={`badge-ui ${tone !== 'neutral' ? `badge-ui--${tone}` : ''}`.trim()}>{children}</span>
);

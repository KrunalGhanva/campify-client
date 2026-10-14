import { useId } from 'react';
import Icon from './Icon';

/**
 * Field wraps a control with label, hint and inline error.
 * Pass the control as a function child to get wired-up a11y props:
 *   <Field label="Title" error={errors.title}>{(p) => <input className="input" {...p} />}</Field>
 * Or use the ready-made Input / Textarea / Select below.
 */
export const Field = ({ label, error, hint, optional = false, id, children, className = '' }) => {
    const auto = useId();
    const fid = id || auto;
    const describedBy = [error && `${fid}-err`, hint && `${fid}-hint`].filter(Boolean).join(' ') || undefined;
    const props = { id: fid, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy };

    return (
        <div className={`field ${className}`.trim()}>
            {label && (
                <label className="field__label" htmlFor={fid}>
                    {label}{optional && <span className="field__opt"> (optional)</span>}
                </label>
            )}
            {typeof children === 'function' ? children(props) : children}
            {hint && !error && <div className="field__hint" id={`${fid}-hint`}>{hint}</div>}
            {error && (
                <div className="field__error" id={`${fid}-err`} role="alert">
                    <Icon name="alert" size={14} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export const Input = ({ label, error, hint, optional, icon, className = '', fieldClassName = '', ...rest }) => (
    <Field label={label} error={error} hint={hint} optional={optional} id={rest.id} className={fieldClassName}>
        {(p) => (
            <div className={icon ? 'input-icon' : undefined}>
                {icon && <Icon name={icon} size={16} />}
                <input className={`input ${className}`.trim()} {...p} {...rest} />
            </div>
        )}
    </Field>
);

export const Textarea = ({ label, error, hint, optional, className = '', fieldClassName = '', rows = 4, ...rest }) => (
    <Field label={label} error={error} hint={hint} optional={optional} id={rest.id} className={fieldClassName}>
        {(p) => <textarea className={`input ${className}`.trim()} rows={rows} {...p} {...rest} />}
    </Field>
);

export const Select = ({ label, error, hint, optional, className = '', fieldClassName = '', children, ...rest }) => (
    <Field label={label} error={error} hint={hint} optional={optional} id={rest.id} className={fieldClassName}>
        {(p) => <select className={`input ${className}`.trim()} {...p} {...rest}>{children}</select>}
    </Field>
);

export default Input;

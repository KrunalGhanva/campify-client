import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';
import Button from './Button';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal: role=dialog, focus trap, Escape + backdrop close,
 * scroll lock, focus returns to the trigger on close.
 * Render conditionally or use `open`. `footer` is a node (usually Buttons).
 */
const Modal = ({ open = true, onClose, title, children, footer, size = 'md' }) => {
    const panelRef = useRef(null);
    const titleId = useId();

    useEffect(() => {
        if (!open) return undefined;
        const previouslyFocused = document.activeElement;
        const panel = panelRef.current;
        const first = panel?.querySelector('[data-autofocus]') || panel?.querySelector(FOCUSABLE);
        first?.focus();

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onKey = (e) => {
            if (e.key === 'Escape') { e.stopPropagation(); onClose?.(); return; }
            if (e.key !== 'Tab' || !panel) return;
            const items = [...panel.querySelectorAll(FOCUSABLE)];
            if (!items.length) return;
            const firstEl = items[0];
            const lastEl = items[items.length - 1];
            if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
            else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
        };
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
            previouslyFocused?.focus?.();
        };
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div className="modal-ui" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
            <div
                ref={panelRef}
                className={`modal-ui__panel ${size === 'lg' ? 'modal-ui__panel--lg' : ''}`.trim()}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >
                <div className="modal-ui__head">
                    <h2 id={titleId}>{title}</h2>
                    <Button variant="ghost" size="sm" iconOnly onClick={onClose} aria-label="Close dialog">
                        <Icon name="x" size={16} />
                    </Button>
                </div>
                <div className="modal-ui__body">{children}</div>
                {footer && <div className="modal-ui__foot">{footer}</div>}
            </div>
        </div>,
        document.body
    );
};

export default Modal;

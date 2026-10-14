import { useContext } from 'react';
import { FlashContext } from '../context/FlashContext';
import { Icon, Button } from './ui';

const ICONS = { success: 'check', danger: 'alert', warning: 'alert', info: 'info' };

/** Toast. Same FlashContext API as before; only the presentation changed. */
const FlashMessage = () => {
    const { flash, clearFlash } = useContext(FlashContext);

    if (!flash) return null;
    const type = ICONS[flash.type] ? flash.type : 'info';

    return (
        <div
            className={`toast-ui toast-ui--${type}`}
            role={type === 'danger' ? 'alert' : 'status'}
            aria-live={type === 'danger' ? 'assertive' : 'polite'}
        >
            <Icon name={ICONS[type]} size={18} className="toast-ui__icon" />
            <div className="toast-ui__msg">{flash.message}</div>
            <Button variant="ghost" size="sm" iconOnly onClick={clearFlash} aria-label="Dismiss message">
                <Icon name="x" size={14} />
            </Button>
        </div>
    );
};

export default FlashMessage;

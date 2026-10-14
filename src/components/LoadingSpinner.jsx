import { Loading } from './ui';

/** Kept for existing imports; now delegates to the shared Loading state. */
const LoadingSpinner = ({ label = 'Loading…', fullPage = false }) => (
    <Loading label={label} fullPage={fullPage} />
);

export default LoadingSpinner;

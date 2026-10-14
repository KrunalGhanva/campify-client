import { Button, Icon } from '../components/ui';

const Forbidden = () => (
    <div className="status-page">
        <Icon name="lock" size={32} />
        <p className="status-page__code">403</p>
        <h1 className="display">Access denied</h1>
        <p className="muted">
            You don’t have permission to view this page. If you think this is a mistake, please contact support.
        </p>
        <div className="row-gap">
            <Button variant="primary" to="/">Go home</Button>
            <Button to="/campgrounds">Browse campgrounds</Button>
        </div>
    </div>
);

export default Forbidden;

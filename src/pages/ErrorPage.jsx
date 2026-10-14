import { useRouteError } from 'react-router-dom';
import { Button, Icon } from '../components/ui';

const ErrorPage = () => {
    const error = useRouteError();
    const status  = error?.status || 500;
    const message = error?.statusText || error?.message || 'Something went wrong';

    return (
        <main className="status-page">
            <Icon name={status === 404 ? 'map' : 'alert'} size={32} />
            <p className="status-page__code">{status}</p>
            <h1 className="display">{status === 404 ? 'Trail not found' : 'Something went wrong'}</h1>
            <p className="muted">
                {status === 404
                    ? 'This page isn’t on our map. Head back to the trailhead.'
                    : `Something went wrong on our end: ${message}`}
            </p>
            <div className="row-gap">
                <Button variant="primary" to="/">Go home</Button>
                <Button to="/campgrounds">Browse campgrounds</Button>
            </div>
        </main>
    );
};

export default ErrorPage;

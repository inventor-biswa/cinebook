import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import './NotFound.css';

function NotFound() {
    return (
        <Layout>
            <div className="notfound">
                <h1 className="notfound__code">404</h1>
                <p className="notfound__title">Oops! Page not found.</p>
                <p className="notfound__sub">The page you're looking for doesn't exist or has been moved.</p>
                <Link to="/" className="btn btn-primary btn-lg">← Back to Home</Link>
            </div>
        </Layout>
    );
}

export default NotFound;

import { Outlet, Link } from 'react-router-dom';
function AdminLayout() {
    return (
        <div style={{display:'flex'}}>
            <nav style={{width:'200px',padding:'1rem',background:'#1a1a2e'}}>
                <Link to="/admin" style={{display:'block',color:'white',marginBottom:'1rem'}}>Dashboard</Link>
                <Link to="/admin/movies" style={{display:'block',color:'white',marginBottom:'1rem'}}>Movies</Link>
                <Link to="/admin/events" style={{display:'block',color:'white',marginBottom:'1rem'}}>Events</Link>
                <Link to="/admin/theatres" style={{display:'block',color:'white',marginBottom:'1rem'}}>Theatres</Link>
                <Link to="/admin/shows" style={{display:'block',color:'white',marginBottom:'1rem'}}>Shows</Link>
            </nav>
            <main style={{flex:1,padding:'2rem'}}><Outlet /></main>
        </div>
    );
}
export default AdminLayout;

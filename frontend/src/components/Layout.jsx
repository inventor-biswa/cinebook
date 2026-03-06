import Navbar from './Navbar';
import Footer from './Footer';

// ─── PAGE LAYOUT ──────────────────────────────────────────────────────────────
// Every public-facing page is wrapped in this Layout, which renders:
//   Navbar → page content (children) → Footer
//
// Usage:
//   function Home() {
//     return <Layout><div>...</div></Layout>;
//   }

function Layout({ children }) {
    return (
        <div className="page-layout">
            <Navbar />
            <main>{children}</main>
            <Footer />
        </div>
    );
}

export default Layout;

import { useEffect } from 'react';
import './TrailerModal.css';

/**
 * Trailer Modal Component
 * Props:
 *   trailerUrl  — full YouTube URL or just the video ID
 *   onClose     — callback to close the modal
 */
function TrailerModal({ trailerUrl, onClose }) {
    // Close on Escape key
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    // Extract YouTube video ID from various formats
    const getEmbedUrl = (url) => {
        if (!url) return null;
        // If it's already just an ID (11 chars alphanumeric)
        if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
            return `https://www.youtube.com/embed/${url}?autoplay=1`;
        }
        // Extract from full URL
        const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
        return url; // fallback: use as-is
    };

    const embedUrl = getEmbedUrl(trailerUrl);
    if (!embedUrl) return null;

    return (
        <div className="trailer-modal-overlay" onClick={onClose}>
            <div className="trailer-modal-box" onClick={e => e.stopPropagation()}>
                <button className="trailer-modal-close" onClick={onClose} aria-label="Close trailer">✕</button>
                <iframe
                    className="trailer-iframe"
                    src={embedUrl}
                    title="Movie Trailer"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                />
            </div>
        </div>
    );
}

export default TrailerModal;

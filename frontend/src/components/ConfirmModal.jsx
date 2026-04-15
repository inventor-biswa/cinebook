/**
 * ConfirmModal — reusable inline confirmation dialog.
 * Replaces native window.confirm() which can be blocked by browsers.
 *
 * Props:
 *   isOpen   — boolean, show/hide
 *   title    — modal title (e.g. "Delete Movie?")
 *   message  — body text
 *   onCancel — called when user clicks Cancel or presses Escape
 *   onConfirm — called when user clicks the confirm button
 *   confirmLabel — text on the confirm button (default: "Delete")
 *   danger   — if true, confirm button uses red/danger styling
 */
import { useEffect } from 'react';

function ConfirmModal({ isOpen, title, message, onCancel, onConfirm, confirmLabel = 'Delete', danger = true }) {
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => { if (e.key === 'Escape') onCancel(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 3000,
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px',
            }}
            onClick={onCancel}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '28px 32px',
                    maxWidth: '420px',
                    width: '100%',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
                    animation: 'slideUp 0.2s ease',
                }}
            >
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px' }}>
                    {title || 'Are you sure?'}
                </h3>
                {message && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                        {message}
                    </p>
                )}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                        className="btn btn-ghost"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn"
                        onClick={onConfirm}
                        style={danger ? {
                            background: 'rgba(239,68,68,0.15)',
                            color: '#f87171',
                            border: '1px solid rgba(239,68,68,0.4)',
                        } : {}}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;

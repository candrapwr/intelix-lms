export default function Modal({ open, title, description, onClose, children, footer }) {
    if (!open) {
        return null;
    }

    return (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
            <div className="modal-card">
                <div className="modal-header">
                    <div>
                        <div className="modal-title">{title}</div>
                        {description ? (
                            <div className="surface-subtitle" style={{ marginTop: '0.25rem' }}>
                                {description}
                            </div>
                        ) : null}
                    </div>
                    <button type="button" className="modal-close" onClick={onClose} aria-label="Tutup dialog">
                        ✕
                    </button>
                </div>
                <div className="modal-body">{children}</div>
                <div className="form-actions">{footer}</div>
            </div>
        </div>
    );
}

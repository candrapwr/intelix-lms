export default function NotFoundPage() {
    return (
        <div className="empty-state">
            <h2>Halaman tidak ditemukan</h2>
            <p>Periksa kembali URL atau pilih menu lain di sidebar.</p>
            <button type="button" onClick={() => window.history.back()}>
                Kembali
            </button>
        </div>
    );
}


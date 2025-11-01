import { useEffect, useState } from 'react';
import client from '../api/client';
import { useNotification } from '../context/NotificationContext';

const initialState = {
    totals: {
        students: 0,
        courses: 0,
        instructors: 0,
        completion_rate: 0,
    },
    enrollments: {
        active: 0,
        completed: 0,
    },
};

export default function DashboardPage() {
    const [metrics, setMetrics] = useState(initialState);
    const [loading, setLoading] = useState(true);
    const { pushError } = useNotification();

    useEffect(() => {
        let ignore = false;
        async function load() {
            setLoading(true);
            try {
                const response = await client.get('/dashboard/metrics');
                if (!ignore) {
                    setMetrics(response.data);
                }
            } catch (error) {
                pushError('Gagal memuat metrik', error.response?.data?.message ?? error.message);
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }
        load();
        return () => {
            ignore = true;
        };
    }, [pushError]);

    const { totals, enrollments } = metrics;

    return (
        <>
            <section className="surface">
                <div className="surface-header">
                    <div>
                        <div className="surface-title">Dashboard Overview</div>
                        <div className="surface-subtitle">
                            Ringkasan performa sistem pelatihan intelijen
                        </div>
                    </div>
                </div>
                
                <div className="metric-grid">
                    <div className="metric-card">
                        <div className="metric-title">Total Students</div>
                        <div className="metric-value">
                            {loading ? '...' : totals.students.toLocaleString('id-ID')}
                        </div>
                        <div className="metric-delta">
                            <span>Aktif belajar</span>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-title">Published Courses</div>
                        <div className="metric-value">
                            {loading ? '...' : totals.courses.toLocaleString('id-ID')}
                        </div>
                        <div className="metric-delta">
                            <span>{loading ? '' : `${enrollments.active} active enrollments`}</span>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-title">Completion Rate</div>
                        <div className="metric-value">
                            {loading ? '...' : `${totals.completion_rate.toFixed(1)}%`}
                        </div>
                        <div className={`metric-delta${totals.completion_rate < 70 ? ' negative' : ''}`}>
                            <span>
                                {loading
                                    ? ''
                                    : `${enrollments.completed.toLocaleString('id-ID')} selesai`}
                            </span>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-title">Certified Instructors</div>
                        <div className="metric-value">
                            {loading ? '...' : totals.instructors.toLocaleString('id-ID')}
                        </div>
                        <div className="metric-delta">
                            <span>Mengelola kurikulum</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="surface">
                <div className="surface-header">
                    <div>
                        <div className="surface-title">Enrollment Performance</div>
                        <div className="surface-subtitle">
                            Perbandingan enrollment aktif dan penyelesaian
                        </div>
                    </div>
                </div>
                
                <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                    <div className="surface-minor">
                        <div className="metric-title">Active Enrollments</div>
                        <div className="metric-value" style={{ fontSize: '1.5rem' }}>
                            {loading ? '...' : enrollments.active.toLocaleString('id-ID')}
                        </div>
                        <div className="metric-delta">Sedang mengikuti materi</div>
                    </div>
                    <div className="surface-minor">
                        <div className="metric-title">Completed Enrollments</div>
                        <div className="metric-value" style={{ fontSize: '1.5rem' }}>
                            {loading ? '...' : enrollments.completed.toLocaleString('id-ID')}
                        </div>
                        <div className="metric-delta">Telah menuntaskan kursus</div>
                    </div>
                </div>
            </section>
        </>
    );
}
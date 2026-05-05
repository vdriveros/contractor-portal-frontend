import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { clientsAPI, projectsAPI, filesAPI } from '../services/api';

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        clients: 0,
        activeProjects: 0,
        totalFiles: 0,
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                let projects = [];
                let clientsCount = 0;

                if (user?.role === 'contractor') {
                    const clients = await clientsAPI.list();
                    clientsCount = clients.length;
                    projects = await projectsAPI.list();
                } else {
                    projects = await projectsAPI.list(user?.client_profile?.id);
                    clientsCount = projects.length;
                }

                const activeProjectsCount = projects.filter(p => p.status === 'active').length;

                // Fetch files for all projects
                const filesPromises = projects.map(p => 
                    filesAPI.list(p.id)
                        .then(files => ({ project: p, files: files || [] }))
                        .catch(err => {
                            console.error(`Error fetching files for project ${p.id}:`, err);
                            return { project: p, files: [] };
                        })
                );
                const filesResults = await Promise.all(filesPromises);

                let totalFilesCount = 0;
                let allRecentFiles = [];

                filesResults.forEach(result => {
                    totalFilesCount += result.files.length;
                    
                    // Collect recent files
                    result.files.forEach(f => {
                        allRecentFiles.push({
                            id: f.id,
                            title: `Nuevo archivo subido en: ${result.project.name}`,
                            date: new Date(f.created_at),
                            type: 'file'
                        });
                    });
                });

                setStats({
                    clients: clientsCount,
                    activeProjects: activeProjectsCount,
                    totalFiles: totalFilesCount
                });

                // For recent activity, merge recent projects and recent files
                const recentProjects = projects.map(p => ({
                    id: p.id,
                    title: `Nuevo proyecto creado: ${p.name}`,
                    date: new Date(p.created_at),
                    type: 'project'
                }));

                const allActivity = [...recentProjects, ...allRecentFiles]
                    .filter(a => a.date && !isNaN(a.date.getTime()))
                    .sort((a, b) => b.date - a.date)
                    .slice(0, 5); // Take top 5

                setRecentActivity(allActivity);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="card">
                    <h1 className="text-3xl font-bold text-primary mb-2">
                        Bienvenido, {user?.full_name || user?.username}!
                    </h1>
                    <p className="text-neutral-600">
                        Aquí verás todo lo relacionado con tus {user?.role === 'contractor' ? 'clientes' : 'proyectos'} hoy.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-neutral-600">
                                    {user?.role === 'contractor' ? 'Total Clientes' : 'Mis Proyectos'}
                                </p>
                                <p className="text-3xl font-bold text-primary mt-2">
                                    {loading ? '...' : stats.clients}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-primary"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-neutral-600">
                                    Proyectos Activos
                                </p>
                                <p className="text-3xl font-bold text-primary mt-2">
                                    {loading ? '...' : stats.activeProjects}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-accent"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-neutral-600">
                                    Total de archivos
                                </p>
                                <p className="text-3xl font-bold text-primary mt-2">
                                    {loading ? '...' : stats.totalFiles}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card">
                    <h2 className="text-xl font-bold text-primary mb-4">
                        Actividad reciente
                    </h2>
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
                            <p className="mt-4 text-neutral-600">Cargando actividad...</p>
                        </div>
                    ) : recentActivity.length === 0 ? (
                        <div className="text-center py-12">
                            <svg
                                className="mx-auto h-12 w-12 text-neutral-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <p className="mt-4 text-neutral-600">
                                No hay actividad reciente
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentActivity.map((activity, idx) => (
                                <div key={`${activity.type}-${activity.id}-${idx}`} className="flex items-start space-x-4 p-4 rounded-lg bg-neutral-50 border border-neutral-100">
                                    <div className={`p-2 rounded-full ${activity.type === 'project' ? 'bg-primary/10 text-primary' : 'bg-green-100 text-green-600'}`}>
                                        {activity.type === 'project' ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-neutral-900 truncate">
                                            {activity.title}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            {activity.date.toLocaleDateString()} a las {activity.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
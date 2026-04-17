import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { projectsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ClientDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await projectsAPI.list();
            setProjects(data);
            setError('');
        } catch (err) {
            setError('Error al cargar proyectos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'completed':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'on_hold':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default:
                return 'bg-neutral-100 text-neutral-800 border-neutral-300';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active':
                return 'Activo';
            case 'completed':
                return 'Completado';
            case 'on_hold':
                return 'En Pausa';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-primary uppercase tracking-wide">
                        Mis Proyectos
                    </h1>
                    <p className="text-neutral-600 mt-1">
                        Revisa el progreso de tus proyectos y archivos
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card hover:shadow-xl transition-shadow border-l-4 border-accent">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                                    Total Proyectos
                                </p>
                                <p className="text-4xl font-bold text-primary mt-2">
                                    {projects.length}
                                </p>
                            </div>
                            <div className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-primary"
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

                    <div className="card hover:shadow-xl transition-shadow border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                                    Activos
                                </p>
                                <p className="text-4xl font-bold text-primary mt-2">
                                    {projects.filter(p => p.status === 'active').length}
                                </p>
                            </div>
                            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="card hover:shadow-xl transition-shadow border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                                    Completados
                                </p>
                                <p className="text-4xl font-bold text-primary mt-2">
                                    {projects.filter(p => p.status === 'completed').length}
                                </p>
                            </div>
                            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Projects List */}
                {projects.length === 0 ? (
                    <div className="card text-center py-12">
                        <svg
                            className="mx-auto h-16 w-16 text-secondary"
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
                        <h3 className="mt-4 text-lg font-semibold text-primary uppercase">
                            No hay proyectos
                        </h3>
                        <p className="mt-2 text-neutral-600">
                            Tu contratista aún no ha creado proyectos para ti
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className="card hover:shadow-xl transition-all border-l-4 border-accent cursor-pointer group"
                                onClick={() => navigate(`/client/projects/${project.id}`)}
                            >
                                {/* Status Badge */}
                                <div className="flex items-center justify-between mb-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border-2 ${getStatusColor(
                                            project.status
                                        )}`}
                                    >
                                        {getStatusText(project.status)}
                                    </span>
                                    <svg
                                        className="w-6 h-6 text-accent opacity-0 group-hover:opacity-100 transition-opacity"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>

                                {/* Project Info */}
                                <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-2 group-hover:text-accent transition-colors">
                                    {project.name}
                                </h3>

                                {project.description && (
                                    <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                                        {project.description}
                                    </p>
                                )}

                                {/* Dates */}
                                <div className="space-y-2 text-sm text-neutral-600">
                                    {project.start_date && (
                                        <div className="flex items-center gap-2">
                                            <svg
                                                className="w-4 h-4 text-accent"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <span>
                                                Inicio: {new Date(project.start_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                    {project.end_date && (
                                        <div className="flex items-center gap-2">
                                            <svg
                                                className="w-4 h-4 text-accent"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <span>
                                                Finalización:{' '}
                                                {new Date(project.end_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* File count */}
                                <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center gap-2 text-sm text-neutral-600">
                                    <svg
                                        className="w-4 h-4 text-accent"
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
                                    <span>{project.files?.length || 0} archivo(s)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
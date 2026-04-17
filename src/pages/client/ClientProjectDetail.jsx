import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { projectsAPI, filesAPI } from '../../services/api';

export default function ClientProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        fetchProjectData();
    }, [id]);

    const fetchProjectData = async () => {
        try {
            setLoading(true);
            const [projectData, filesData] = await Promise.all([
                projectsAPI.get(id),
                filesAPI.list(id),
            ]);

            setProject(projectData);
            setFiles(filesData);
            setError('');
        } catch (err) {
            setError('Error al cargar el proyecto');
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

    // Gallery handlers
    const openLightbox = (index) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === imageFiles.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? imageFiles.length - 1 : prev - 1
        );
    };

    // Keyboard navigation for lightbox
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!lightboxOpen) return;
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'Escape') closeLightbox();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen, currentImageIndex]);

    // Filter files by type
    const imageFiles = files.filter((f) => f.file_type === 'image');
    const documentFiles = files.filter((f) => f.file_type === 'document');

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!project) {
        return (
            <DashboardLayout>
                <div className="card text-center py-12">
                    <p className="text-neutral-600">Proyecto no encontrado</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 btn-accent"
                    >
                        Volver al inicio
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-primary hover:text-accent mb-4 font-semibold"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Volver a Mis Proyectos
                    </button>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-primary uppercase tracking-wide">
                                {project.name}
                            </h1>
                            <p className="text-neutral-600 mt-1">
                                Detalles y progreso del proyecto
                            </p>
                        </div>
                        <span
                            className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide border-2 ${getStatusColor(
                                project.status
                            )}`}
                        >
                            {getStatusText(project.status)}
                        </span>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Project Information */}
                <div className="card">
                    <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b-2 border-accent pb-2 inline-block mb-6">
                        Información del Proyecto
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Description */}
                        {project.description && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                                    Descripción
                                </label>
                                <p className="text-neutral-600 bg-neutral-50 p-4 rounded-lg">
                                    {project.description}
                                </p>
                            </div>
                        )}

                        {/* Start Date */}
                        {project.start_date && (
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                                    Fecha de Inicio
                                </label>
                                <div className="flex items-center gap-2 text-neutral-600">
                                    <svg
                                        className="w-5 h-5 text-accent"
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
                                    {new Date(project.start_date).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </div>
                            </div>
                        )}

                        {/* End Date */}
                        {project.end_date && (
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                                    Fecha de Finalización
                                </label>
                                <div className="flex items-center gap-2 text-neutral-600">
                                    <svg
                                        className="w-5 h-5 text-accent"
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
                                    {new Date(project.end_date).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Created Date */}
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                                Proyecto Creado
                            </label>
                            <div className="flex items-center gap-2 text-neutral-600">
                                <svg
                                    className="w-5 h-5 text-accent"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                {new Date(project.created_at).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Images Gallery */}
                {imageFiles.length > 0 && (
                    <div className="card">
                        <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b-2 border-accent pb-2 inline-block mb-6">
                            Galería de Imágenes ({imageFiles.length})
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {imageFiles.map((file, index) => (
                                <div key={file.id} className="relative group">
                                    <div
                                        className="aspect-square bg-neutral-100 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-accent transition-all shadow-md hover:shadow-xl"
                                        onClick={() => openLightbox(index)}
                                    >
                                        <img
                                            src={file.presigned_url}
                                            alt={file.file_name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>

                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                                        <svg
                                            className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                            />
                                        </svg>
                                    </div>

                                    <p className="mt-2 text-xs text-neutral-600 truncate">
                                        {file.file_name}
                                    </p>
                                    <p className="text-xs text-neutral-400">
                                        {new Date(file.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Documents List */}
                {documentFiles.length > 0 && (
                    <div className="card">
                        <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b-2 border-accent pb-2 inline-block mb-6">
                            Documentos PDF ({documentFiles.length})
                        </h2>

                        <div className="space-y-3">
                            {documentFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors border border-neutral-200"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                            <svg
                                                className="w-6 h-6 text-red-500"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-neutral-900">
                                                {file.file_name}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                Subido el{' '}
                                                {new Date(file.created_at).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href={file.presigned_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-2 bg-primary text-accent rounded-lg hover:bg-primary-light transition-colors text-sm font-semibold uppercase tracking-wide flex items-center gap-2"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                        Ver
                                    </a>
                </div>
              ))}
                    </div>
          </div>
        )}

            {/* No files message */}
            {imageFiles.length === 0 && documentFiles.length === 0 && (
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
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-semibold text-primary uppercase">
                        No hay archivos
                    </h3>
                    <p className="mt-2 text-neutral-600">
                        Tu contratista aún no ha subido archivos para este proyecto
                    </p>
                </div>
            )}

            {/* Lightbox Modal */}
            {lightboxOpen && imageFiles.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
                    {/* Close button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 text-white hover:text-accent transition-colors z-10"
                        title="Cerrar (Esc)"
                    >
                        <svg
                            className="w-10 h-10"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>

                    {/* Previous button */}
                    {imageFiles.length > 1 && (
                        <button
                            onClick={prevImage}
                            className="absolute left-4 text-white hover:text-accent transition-colors z-10 bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-75"
                            title="Anterior (←)"
                        >
                            <svg
                                className="w-10 h-10"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>
                    )}

                    {/* Image container */}
                    <div className="max-w-7xl max-h-[90vh] flex flex-col items-center justify-center">
                        <img
                            src={imageFiles[currentImageIndex]?.presigned_url}
                            alt={imageFiles[currentImageIndex]?.file_name}
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                        />

                        {/* Image info */}
                        <div className="mt-4 text-center">
                            <p className="text-white text-lg font-semibold">
                                {imageFiles[currentImageIndex]?.file_name}
                            </p>
                            <p className="text-neutral-400 text-sm mt-1">
                                Subido el{' '}
                                {new Date(
                                    imageFiles[currentImageIndex]?.created_at
                                ).toLocaleDateString('es-ES')}
                            </p>
                        </div>
                    </div>

                    {/* Next button */}
                    {imageFiles.length > 1 && (
                        <button
                            onClick={nextImage}
                            className="absolute right-4 text-white hover:text-accent transition-colors z-10 bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-75"
                            title="Siguiente (→)"
                        >
                            <svg
                                className="w-10 h-10"
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
                        </button>
                    )}

                    {/* Image counter */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg font-semibold">
                        {currentImageIndex + 1} / {imageFiles.length}
                    </div>
                </div>
            )}
        </div>
    </DashboardLayout>
  );
}
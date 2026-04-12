import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { projectsAPI, filesAPI, clientsAPI } from '../../services/api';
import Toast from '../../components/common/Toast';

export default function ProjectEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clients, setClients] = useState([]);
    const [project, setProject] = useState(null);
    const [showSuccess, setShowSuccessInternal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const setShowSuccess = (show, message = '') => {
        if (show) setSuccessMessage(message);
        setShowSuccessInternal(show);
    };

    // Files state
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [selectedFiles, setSelectedFiles] = useState([]);

    // Gallery state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [projectData, clientsData, filesData] = await Promise.all([
                projectsAPI.get(id),
                clientsAPI.list(),
                filesAPI.list(id),
            ]);

            setProject(projectData);
            setClients(clientsData);
            setFiles(filesData);

            // Llenar formulario
            setValue('client_id', projectData.client_id);
            setValue('name', projectData.name);
            setValue('description', projectData.description || '');
            setValue('status', projectData.status);
            setValue('start_date', projectData.start_date?.split('T')[0] || '');
            setValue('end_date', projectData.end_date?.split('T')[0] || '');

            setError('');
        } catch (err) {
            setError('Error al cargar proyecto');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            setError('');

            const projectData = {
                ...data,
                client_id: parseInt(data.client_id),
            };

            await projectsAPI.update(id, projectData);
            setShowSuccess(true, 'Registro modificado correctamente');
            //navigate('/projects');
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al actualizar proyecto');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // File upload handlers
    const handleFileSelect = (e) => {
        const newFiles = Array.from(e.target.files);
        setSelectedFiles(newFiles);
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        const newProgress = {};

        try {
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                newProgress[file.name] = 0;
                setUploadProgress({ ...newProgress });

                await filesAPI.upload(id, file, '');
                setShowSuccess(true, 'Archivo subido correctamente');

                newProgress[file.name] = 100;
                setUploadProgress({ ...newProgress });
            }

            // Recargar archivos
            const updatedFiles = await filesAPI.list(id);
            setFiles(updatedFiles);
            setSelectedFiles([]);
            setUploadProgress({});

            // Reset file input
            const fileInput = document.getElementById('file-upload');
            if (fileInput) fileInput.value = '';
        } catch (err) {
            setError('Error al subir archivos');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteFile = async (fileId) => {
        if (!window.confirm('¿Estás seguro de eliminar esta imagen?')) return;

        try {
            await filesAPI.delete(fileId);
            setFiles(files.filter(f => f.id !== fileId));
        } catch (err) {
            setError('Error al eliminar archivo');
            console.error(err);
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

    // Filter only image files
    const imageFiles = files
        .filter(f => f.file_type === 'image')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const documentFiles = files
        .filter(f => f.file_type === 'document')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

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
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/projects')}
                        className="flex items-center gap-2 text-primary hover:text-accent mb-4 font-semibold"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver a Proyectos
                    </button>
                    <h1 className="text-3xl font-bold text-primary uppercase tracking-wide">
                        Editar Proyecto
                    </h1>
                    <p className="text-neutral-600 mt-1">
                        Actualiza la información y gestiona los archivos del proyecto
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Project Info Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
                            <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b-2 border-accent pb-2 inline-block">
                                Información del Proyecto
                            </h2>

                            {/* Client Selection */}
                            <div>
                                <label htmlFor="client_id" className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                                    Cliente
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <select id="client_id" className="input-field" {...register('client_id', { required: 'Debes seleccionar un cliente' })}>
                                    <option value="">Selecciona un cliente</option>
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.company_name || client.contact_name}
                                        </option>
                                    ))}
                                </select>
                                {errors.client_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.client_id.message}</p>
                                )}
                            </div>

                            {/* Project Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                                    Nombre del Proyecto
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    className="input-field"
                                    {...register('name', { required: 'El nombre del proyecto es requerido' })}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                                    Descripción
                                </label>
                                <textarea
                                    id="description"
                                    rows="4"
                                    className="input-field"
                                    {...register('description')}
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label htmlFor="status" className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                                    Estado
                                </label>
                                <select id="status" className="input-field" {...register('status')}>
                                    <option value="active">Activo</option>
                                    <option value="completed">Completado</option>
                                    <option value="on_hold">En Pausa</option>
                                </select>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="start_date" className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                                        Fecha de Inicio
                                    </label>
                                    <input id="start_date" type="date" className="input-field" {...register('start_date')} />
                                </div>
                                <div>
                                    <label htmlFor="end_date" className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                                        Fecha de Finalización
                                    </label>
                                    <input id="end_date" type="date" className="input-field" {...register('end_date')} />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-neutral-200">
                                <button type="button" onClick={() => navigate('/projects')} className="flex-1 btn-secondary" disabled={isSubmitting}>
                                    Cancelar
                                </button>
                                <button type="submit" className="flex-1 btn-accent" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Guardando...
                                        </span>
                                    ) : (
                                        'Guardar Cambios'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column - File Upload */}
                    <div className="lg:col-span-1">
                        <div className="card">
                            <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b-2 border-accent pb-2 inline-block mb-6">
                                Subir Archivos
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                                        Seleccionar Imágenes
                                    </label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        multiple
                                        accept="image/*,.pdf"
                                        onChange={handleFileSelect}
                                        className="block w-full text-sm text-neutral-600
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-accent file:text-primary
                      file:uppercase file:tracking-wide
                      hover:file:bg-accent-light
                      file:cursor-pointer cursor-pointer"
                                    />
                                </div>

                                {selectedFiles.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-neutral-700">
                                            {selectedFiles.length} archivo(s) seleccionado(s)
                                        </p>
                                        <ul className="text-sm text-neutral-600 space-y-1">
                                            {selectedFiles.map((file, index) => (
                                                <li key={index} className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {file.name}
                                                    {uploadProgress[file.name] !== undefined && (
                                                        <span className="text-xs">({uploadProgress[file.name]}%)</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={handleUpload}
                                    disabled={selectedFiles.length === 0 || uploading}
                                    className="w-full btn-accent"
                                >
                                    {uploading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Subiendo...
                                        </span>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            Subir Archivos
                                        </>
                                    )}
                                </button>
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
                                        className="aspect-square bg-neutral-100 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-accent transition-all"
                                        onClick={() => openLightbox(index)}
                                    >
                                        <img
                                            src={file.presigned_url}
                                            alt={file.file_name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>

                                    {/* Delete button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteFile(file.id);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        title="Eliminar imagen"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>

                                    <p className="mt-2 text-xs text-neutral-600 truncate">{new Date(file.created_at).toLocaleDateString()}</p>
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

                        <div className="space-y-2">
                            {documentFiles.map((file) => (
                                <div key={file.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        <div>
                                            <p className="font-semibold text-neutral-900">{file.file_name}</p>
                                            <p className="text-xs text-neutral-500">
                                                {new Date(file.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <a
                                            href={file.presigned_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-primary text-accent rounded-lg hover:bg-primary-light transition-colors text-sm font-semibold uppercase"
                                        >
                                            Ver
                                        </a>
                                        <button
                                            onClick={() => handleDeleteFile(file.id)}
                                            className="px-4 py-2 bg-red-50 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Lightbox Modal */}
                {lightboxOpen && imageFiles.length > 0 && (
                    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
                        {/* Close button */}
                        <button
                            onClick={closeLightbox}
                            className="absolute top-4 right-4 text-white hover:text-accent transition-colors z-10"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Previous button */}
                        {imageFiles.length > 1 && (
                            <button
                                onClick={prevImage}
                                className="absolute left-4 text-white hover:text-accent transition-colors z-10"
                            >
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}

                        {/* Image */}
                        <div className="max-w-6xl max-h-[90vh] flex items-center justify-center">
                            <img
                                src={imageFiles[currentImageIndex]?.presigned_url}
                                alt={imageFiles[currentImageIndex]?.file_name}
                                className="max-w-full max-h-[90vh] object-contain"
                            />
                        </div>

                        {/* Next button */}
                        {imageFiles.length > 1 && (
                            <button
                                onClick={nextImage}
                                className="absolute right-4 text-white hover:text-accent transition-colors z-10"
                            >
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        )}

                        {/* Image counter */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                            {currentImageIndex + 1} / {imageFiles.length}
                        </div>
                    </div>
                )}
            </div>
            {showSuccess && (
                <Toast
                    message={successMessage}
                    onClose={() => setShowSuccess(false)}
                />
            )}
        </DashboardLayout>
    );
}
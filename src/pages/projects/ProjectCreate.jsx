import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { projectsAPI, clientsAPI } from '../../services/api';

export default function ProjectCreate() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clients, setClients] = useState([]);
    const [loadingClients, setLoadingClients] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    // Cargar lista de clientes
    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoadingClients(true);
            const data = await clientsAPI.list();
            setClients(data);
        } catch (err) {
            setError('Error al cargar clientes');
            console.error(err);
        } finally {
            setLoadingClients(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            setError('');

            // Convertir client_id a número
            const projectData = {
                ...data,
                client_id: parseInt(data.client_id),
            };

            const newProject = await projectsAPI.create(projectData);

            // Redirigir a la página de edición del proyecto recién creado
            navigate(`/projects/${newProject.id}/edit`);
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al crear proyecto');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/projects')}
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
                        Volver a Proyectos
                    </button>
                    <h1 className="text-3xl font-bold text-primary uppercase tracking-wide">
                        Nuevo Proyecto
                    </h1>
                    <p className="text-neutral-600 mt-1">
                        Completa la información del proyecto
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
                    {/* Client Selection */}
                    <div>
                        <label
                            htmlFor="client_id"
                            className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide"
                        >
                            Cliente
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        {loadingClients ? (
                            <div className="input-field flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent"></div>
                                <span className="ml-2 text-neutral-500">Cargando clientes...</span>
                            </div>
                        ) : clients.length === 0 ? (
                            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                <p className="text-sm text-yellow-700">
                                    No hay clientes disponibles.{' '}
                                    <button
                                        type="button"
                                        onClick={() => navigate('/clients/create')}
                                        className="font-semibold underline hover:text-yellow-900"
                                    >
                                        Crear un cliente primero
                                    </button>
                                </p>
                            </div>
                        ) : (
                            <select
                                id="client_id"
                                className="input-field"
                                {...register('client_id', {
                                    required: 'Debes seleccionar un cliente',
                                })}
                            >
                                <option value="">Selecciona un cliente</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.company_name + ' - ' + client.contact_name}
                                    </option>
                                ))}
                            </select>
                        )}
                        {errors.client_id && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.client_id.message}
                            </p>
                        )}
                    </div>

                    {/* Project Name */}
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide"
                        >
                            Nombre del Proyecto
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            className="input-field"
                            placeholder="Ej: Remodelación de cocina"
                            {...register('name', {
                                required: 'El nombre del proyecto es requerido',
                            })}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide"
                        >
                            Descripción
                            <span className="text-neutral-400 normal-case ml-2 text-xs">
                                (Opcional)
                            </span>
                        </label>
                        <textarea
                            id="description"
                            rows="4"
                            className="input-field"
                            placeholder="Describe los detalles del proyecto..."
                            {...register('description')}
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label
                            htmlFor="status"
                            className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide"
                        >
                            Estado
                        </label>
                        <select
                            id="status"
                            className="input-field"
                            {...register('status')}
                        >
                            <option value="active">Activo</option>
                            <option value="completed">Completado</option>
                            <option value="on_hold">En Pausa</option>
                        </select>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label
                                htmlFor="start_date"
                                className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide"
                            >
                                Fecha de Inicio
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                                id="start_date"
                                type="date"
                                className="input-field"
                                {...register('start_date', {
                                    required: 'La fecha de inicio es requerida',
                                })}
                            />
                            {errors.start_date && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.start_date.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="end_date"
                                className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide"
                            >
                                Fecha de Finalización
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                                id="end_date"
                                type="date"
                                className="input-field"
                                {...register('end_date', {
                                    required: 'La fecha de finalización es requerida',
                                })}
                            />
                            {errors.end_date && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.end_date.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Advisor */}
                    <div>
                        <label
                            htmlFor="advisor"
                            className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide"
                        >
                            Asesor
                            <span className="text-neutral-400 normal-case ml-2 text-xs">
                                (Opcional)
                            </span>
                        </label>
                        <input
                            id="advisor"
                            type="text"
                            className="input-field"
                            placeholder="Ej: Juan Pérez"
                            {...register('advisor')}
                        />
                    </div>

                    {/* Advisor Email */}
                    <div>
                        <label
                            htmlFor="advisor_email"
                            className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide"
                        >
                            Correo de Contacto
                            <span className="text-neutral-400 normal-case ml-2 text-xs">
                                (Opcional)
                            </span>
                        </label>
                        <input
                            id="advisor_email"
                            type="text"
                            className="input-field"
                            placeholder="Ej: ejemplo@email.com"
                            {...register('advisor_email')}
                        />
                    </div>

                    {/* Advisor Phone */}
                    <div>
                        <label
                            htmlFor="advisor_phone"
                            className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide"
                        >
                            Teléfono de Contacto
                            <span className="text-neutral-400 normal-case ml-2 text-xs">
                                (Opcional)
                            </span>
                        </label>
                        <input
                            id="advisor_phone"
                            type="text"
                            className="input-field"
                            placeholder="Ej: 1234567890"
                            {...register('advisor_phone')}
                        />
                    </div>

                    {/* Project Manager */}
                    <div>
                        <label
                            htmlFor="project_manager"
                            className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide"
                        >
                            Responsable de obra
                            <span className="text-neutral-400 normal-case ml-2 text-xs">
                                (Opcional)
                            </span>
                        </label>
                        <input
                            id="project_manager"
                            type="text"
                            className="input-field"
                            placeholder="Ej: Juan Pérez"
                            {...register('project_manager')}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-neutral-200">
                        <button
                            type="button"
                            onClick={() => navigate('/projects')}
                            className="flex-1 btn-secondary"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 btn-accent"
                            disabled={isSubmitting || clients.length === 0}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg
                                        className="animate-spin h-5 w-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Creando...
                                </span>
                            ) : (
                                'Crear Proyecto'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
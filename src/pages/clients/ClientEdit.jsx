import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { clientsAPI } from '../../services/api';
import Toast from '../../components/common/Toast';

export default function ClientEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm();

    // Cargar datos del cliente
    useEffect(() => {
        fetchClient();
    }, [id]);

    const fetchClient = async () => {
        try {
            setLoading(true);
            const client = await clientsAPI.get(id);

            // Llenar el formulario con los datos existentes
            setValue('company_name', client.company_name || '');
            setValue('contact_name', client.contact_name);
            setValue('contact_email', client.contact_email || '');
            setValue('contact_phone', client.contact_phone || '');
            setValue('address', client.address || '');

            setError('');
        } catch (err) {
            setError('Error al cargar cliente');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            setError('');
            await clientsAPI.update(id, data);
            setShowSuccess(true);
            //navigate('/clients');
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al actualizar cliente');
            console.error(err);
        } finally {
            setIsSubmitting(false);
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
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/clients')}
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
                        Volver a Clientes
                    </button>
                    <h1 className="text-3xl font-bold text-primary uppercase tracking-wide">
                        Editar Cliente
                    </h1>
                    <p className="text-neutral-600 mt-1">
                        Actualiza la información del cliente
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
                    {/* Company Name */}
                    <div>
                        <label
                            htmlFor="company_name"
                            className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide"
                        >
                            Nombre de la Empresa
                            <span className="text-neutral-400 normal-case ml-2 text-xs">
                                (Opcional)
                            </span>
                        </label>
                        <input
                            id="company_name"
                            type="text"
                            className="input-field"
                            placeholder="Ej: Constructora ABC"
                            {...register('company_name')}
                        />
                    </div>

                    {/* Contact Name */}
                    <div>
                        <label
                            htmlFor="contact_name"
                            className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide"
                        >
                            Nombre de Contacto
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            id="contact_name"
                            type="text"
                            className="input-field"
                            placeholder="Ej: Juan Pérez"
                            {...register('contact_name', {
                                required: 'El nombre de contacto es requerido',
                            })}
                        />
                        {errors.contact_name && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.contact_name.message}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label
                            htmlFor="contact_email"
                            className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide"
                        >
                            Email
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            id="contact_email"
                            type="email"
                            className="input-field"
                            placeholder="ejemplo@email.com"
                            {...register('contact_email', {
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Email inválido',
                                },
                                required: 'El email es requerido',
                            })}
                        />
                        {errors.contact_email && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.contact_email.message}
                            </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label
                            htmlFor="contact_phone"
                            className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide"
                        >
                            Teléfono
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            id="contact_phone"
                            type="tel"
                            className="input-field"
                            placeholder="(0981) 123-456"
                            {...register('contact_phone', {
                                required: 'El teléfono es requerido',
                            })}
                        />
                        {errors.contact_phone && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.contact_phone.message}
                            </p>
                        )}
                    </div>

                    {/* Address */}
                    <div>
                        <label
                            htmlFor="address"
                            className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide"
                        >
                            Dirección
                            <span className="text-neutral-400 normal-case ml-2 text-xs">
                                (Opcional)
                            </span>
                        </label>
                        <textarea
                            id="address"
                            rows="3"
                            className="input-field"
                            placeholder="Calle, Nro de Casa, Ciudad"
                            {...register('address')}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-neutral-200">
                        <button
                            type="button"
                            onClick={() => navigate('/clients')}
                            className="flex-1 btn-secondary"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 btn-accent"
                            disabled={isSubmitting}
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
                                    Guardando...
                                </span>
                            ) : (
                                'Guardar Cambios'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {showSuccess && (
                <Toast
                    message="Registro modificado correctamente"
                    onClose={() => setShowSuccess(false)}
                />
            )}
        </DashboardLayout>
    );
}
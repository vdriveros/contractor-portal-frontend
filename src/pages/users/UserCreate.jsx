import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { usersAPI } from '../../services/api';

export default function UserCreate() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch
    } = useForm({
        defaultValues: {
            role: 'client'
        }
    });

    const password = watch('password');

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            setError('');

            // Eliminar confirmación de contraseña antes de enviar
            const { confirm_password, ...userData } = data;

            await usersAPI.create(userData);
            navigate('/users');
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al crear usuario');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/users')}
                        className="flex items-center gap-2 text-primary mb-4 font-semibold hover:text-accent-dark"
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
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Volver a Usuarios
                    </button>
                    <h1 className="text-3xl font-bold text-primary uppercase tracking-wide">
                        Crear Nuevo Usuario
                    </h1>
                    <p className="text-neutral-600 mt-1">
                        Completa la información para registrar un nuevo usuario en el sistema
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Form Card */}
                <div className="card">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Username */}
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide"
                                >
                                    Nombre de Usuario
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    className="input-field"
                                    placeholder="Usuario"
                                    {...register('username', { required: 'El nombre de usuario es requerido' })}
                                />
                                {errors.username && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.username.message}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide"
                                >
                                    Email
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    className="input-field"
                                    placeholder="usuario@ejemplo.com"
                                    {...register('email', {
                                        required: 'El email es requerido',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Email inválido',
                                        },
                                    })}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Full Name */}
                            <div>
                                <label
                                    htmlFor="full_name"
                                    className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide"
                                >
                                    Nombre Completo
                                </label>
                                <input
                                    id="full_name"
                                    type="text"
                                    className="input-field"
                                    placeholder="Juan Pérez"
                                    {...register('full_name')}
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label
                                    htmlFor="role"
                                    className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide"
                                >
                                    Rol
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <select
                                    id="role"
                                    className="input-field"
                                    {...register('role', { required: 'El rol es requerido' })}
                                >
                                    <option value="contractor">Contratista (Admin)</option>
                                    {/* <option value="client">Cliente</option> */}
                                </select>
                                {errors.role && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.role.message}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide"
                                >
                                    Contraseña
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    className="input-field"
                                    placeholder="********"
                                    {...register('password', {
                                        required: 'La contraseña es requerida',
                                        minLength: {
                                            value: 6,
                                            message: 'La contraseña debe tener al menos 6 caracteres',
                                        },
                                    })}
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label
                                    htmlFor="confirm_password"
                                    className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide"
                                >
                                    Confirmar Contraseña
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    id="confirm_password"
                                    type="password"
                                    className="input-field"
                                    placeholder="********"
                                    {...register('confirm_password', {
                                        required: 'Debes confirmar la contraseña',
                                        validate: (value) =>
                                            value === password || 'Las contraseñas no coinciden',
                                    })}
                                />
                                {errors.confirm_password && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.confirm_password.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-6 border-t border-neutral-200">
                            <button
                                type="button"
                                onClick={() => navigate('/users')}
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
                                        Creando...
                                    </span>
                                ) : (
                                    'Crear Usuario'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}

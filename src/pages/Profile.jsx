import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    // Form para información del perfil
    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        setValue: setValueProfile,
        formState: { errors: errorsProfile },
    } = useForm();

    // Form para cambio de contraseña
    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        reset: resetPassword,
        formState: { errors: errorsPassword },
    } = useForm();

    // Cargar datos del usuario
    useEffect(() => {
        if (user) {
            setValueProfile('email', user.email);
            setValueProfile('full_name', user.full_name || '');
        }
    }, [user, setValueProfile]);

    // Actualizar perfil
    const onSubmitProfile = async (data) => {
        try {
            setIsSubmitting(true);
            setError('');
            setSuccess('');

            const params = new URLSearchParams();
            if (data.email) params.append('email', data.email);
            if (data.full_name) params.append('full_name', data.full_name);

            await api.put(`/auth/me/profile?${params.toString()}`);

            setSuccess('Perfil actualizado exitosamente');

            // Recargar la página después de 1 segundo para actualizar el usuario
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al actualizar perfil');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Cambiar contraseña
    const onSubmitPassword = async (data) => {
        try {
            setIsSubmitting(true);
            setError('');
            setSuccess('');

            if (data.new_password !== data.confirm_password) {
                setError('Las contraseñas no coinciden');
                return;
            }

            const params = new URLSearchParams();
            params.append('current_password', data.current_password);
            params.append('new_password', data.new_password);

            await api.put(`/auth/me/password?${params.toString()}`);

            setSuccess('Contraseña actualizada exitosamente. Por favor, inicia sesión nuevamente.');
            resetPassword();

            // Cerrar sesión después de 2 segundos
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al cambiar contraseña');
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
                    <h1 className="text-3xl font-bold text-primary uppercase tracking-wide">
                        Mi Perfil
                    </h1>
                    <p className="text-neutral-600 mt-1">
                        Gestiona tu información personal y contraseña
                    </p>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                        <p className="text-green-700">{success}</p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Tabs */}
                <div className="card">
                    <div className="flex border-b-2 border-neutral-200 mb-6">
                        <button
                            onClick={() => {
                                setActiveTab('profile');
                                setError('');
                                setSuccess('');
                            }}
                            className={`px-6 py-3 font-semibold uppercase tracking-wide transition-colors ${activeTab === 'profile'
                                    ? 'border-b-2 border-accent text-primary -mb-0.5'
                                    : 'text-neutral-600 hover:text-primary'
                                }`}
                        >
                            <svg
                                className="w-5 h-5 inline mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                            Información Personal
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('password');
                                setError('');
                                setSuccess('');
                            }}
                            className={`px-6 py-3 font-semibold uppercase tracking-wide transition-colors ${activeTab === 'password'
                                    ? 'border-b-2 border-accent text-primary -mb-0.5'
                                    : 'text-neutral-600 hover:text-primary'
                                }`}
                        >
                            <svg
                                className="w-5 h-5 inline mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                            Cambiar Contraseña
                        </button>
                    </div>

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
                            <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b-2 border-accent pb-2 inline-block">
                                Información del Perfil
                            </h2>

                            {/* Username (readonly) */}
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                                    Nombre de Usuario
                                </label>
                                <input
                                    type="text"
                                    value={user?.username}
                                    disabled
                                    className="input-field bg-neutral-100 cursor-not-allowed"
                                />
                                <p className="mt-1 text-xs text-neutral-500">
                                    El nombre de usuario no se puede cambiar
                                </p>
                            </div>

                            {/* Role (readonly) */}
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                                    Rol
                                </label>
                                <input
                                    type="text"
                                    value={user?.role}
                                    disabled
                                    className="input-field bg-neutral-100 cursor-not-allowed capitalize"
                                />
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
                                    placeholder="tu@email.com"
                                    {...registerProfile('email', {
                                        required: 'El email es requerido',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Email inválido',
                                        },
                                    })}
                                />
                                {errorsProfile.email && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errorsProfile.email.message}
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
                                    <span className="text-neutral-400 normal-case ml-2 text-xs">
                                        (Opcional)
                                    </span>
                                </label>
                                <input
                                    id="full_name"
                                    type="text"
                                    className="input-field"
                                    placeholder="Juan Pérez"
                                    {...registerProfile('full_name')}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-neutral-200">
                                <button
                                    type="button"
                                    onClick={() => navigate('/dashboard')}
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
                    )}

                    {/* Password Tab */}
                    {activeTab === 'password' && (
                        <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
                            <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b-2 border-accent pb-2 inline-block">
                                Cambiar Contraseña
                            </h2>

                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                                <p className="text-sm text-yellow-700">
                                    <strong>Nota:</strong> Después de cambiar tu contraseña, deberás
                                    iniciar sesión nuevamente.
                                </p>
                            </div>

                            {/* Current Password */}
                            <div>
                                <label
                                    htmlFor="current_password"
                                    className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide"
                                >
                                    Contraseña Actual
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    id="current_password"
                                    type="password"
                                    className="input-field"
                                    placeholder="Ingresa tu contraseña actual"
                                    {...registerPassword('current_password', {
                                        required: 'La contraseña actual es requerida',
                                    })}
                                />
                                {errorsPassword.current_password && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errorsPassword.current_password.message}
                                    </p>
                                )}
                            </div>

                            {/* New Password */}
                            <div>
                                <label
                                    htmlFor="new_password"
                                    className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide"
                                >
                                    Nueva Contraseña
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    id="new_password"
                                    type="password"
                                    className="input-field"
                                    placeholder="Mínimo 6 caracteres"
                                    {...registerPassword('new_password', {
                                        required: 'La nueva contraseña es requerida',
                                        minLength: {
                                            value: 6,
                                            message: 'La contraseña debe tener al menos 6 caracteres',
                                        },
                                    })}
                                />
                                {errorsPassword.new_password && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errorsPassword.new_password.message}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label
                                    htmlFor="confirm_password"
                                    className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide"
                                >
                                    Confirmar Nueva Contraseña
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    id="confirm_password"
                                    type="password"
                                    className="input-field"
                                    placeholder="Repite la nueva contraseña"
                                    {...registerPassword('confirm_password', {
                                        required: 'Debes confirmar la nueva contraseña',
                                    })}
                                />
                                {errorsPassword.confirm_password && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errorsPassword.confirm_password.message}
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-neutral-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetPassword();
                                        setError('');
                                        setSuccess('');
                                    }}
                                    className="flex-1 btn-secondary"
                                    disabled={isSubmitting}
                                >
                                    Limpiar
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
                                            Cambiando...
                                        </span>
                                    ) : (
                                        'Cambiar Contraseña'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
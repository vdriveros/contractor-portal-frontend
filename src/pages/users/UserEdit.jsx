import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { usersAPI } from '../../services/api';
import Toast from '../../components/common/Toast';

export default function UserEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('info');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Form para información del usuario
    const {
        register: registerInfo,
        handleSubmit: handleSubmitInfo,
        setValue: setValueInfo,
        formState: { errors: errorsInfo },
    } = useForm();

    // Form para cambio de contraseña
    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        reset: resetPassword,
        formState: { errors: errorsPassword },
        watch: watchPassword,
    } = useForm();

    const newPassword = watchPassword('new_password');

    // Cargar datos del usuario
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const user = await usersAPI.get(id);
                setValueInfo('username', user.username);
                setValueInfo('email', user.email);
                setValueInfo('full_name', user.full_name || '');
                setValueInfo('role', user.role);
                setError('');
            } catch (err) {
                setError('Error al cargar el usuario');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id, setValueInfo]);

    // Actualizar información
    const onSubmitInfo = async (data) => {
        try {
            setIsSubmitting(true);
            setError('');

            await usersAPI.update(id, data);

            setToastMessage('Usuario actualizado exitosamente');
            setShowToast(true);
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al actualizar usuario');
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

            await usersAPI.updatePassword(id, { new_password: data.new_password });

            setToastMessage('Contraseña actualizada exitosamente');
            setShowToast(true);
            resetPassword();
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al cambiar contraseña');
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
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Volver a Usuarios
                    </button>
                    <h1 className="text-3xl font-bold text-primary uppercase tracking-wide">
                        Editar Usuario
                    </h1>
                    <p className="text-neutral-600 mt-1">
                        Gestiona la información y seguridad de la cuenta del usuario
                    </p>
                </div>

                {/* Error Messages */}
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
                                setActiveTab('info');
                                setError('');
                            }}
                            className={`px-6 py-3 font-semibold uppercase tracking-wide transition-colors ${activeTab === 'info'
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
                            Información General
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('password');
                                setError('');
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
                            Seguridad / Contraseña
                        </button>
                    </div>

                    {/* Info Tab */}
                    {activeTab === 'info' && (
                        <form onSubmit={handleSubmitInfo(onSubmitInfo)} className="space-y-6">
                            <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b-2 border-accent pb-2 inline-block">
                                Detalle del Usuario
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Username (readonly) */}
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                                        Nombre de Usuario
                                    </label>
                                    <input
                                        type="text"
                                        {...registerInfo('username')}
                                        disabled
                                        className="input-field bg-neutral-100 cursor-not-allowed uppercase"
                                    />
                                    <p className="mt-1 text-xs text-neutral-500">
                                        El nombre de usuario no se puede cambiar
                                    </p>
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
                                        {...registerInfo('email', {
                                            required: 'El email es requerido',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Email inválido',
                                            },
                                        })}
                                    />
                                    {errorsInfo.email && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errorsInfo.email.message}
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
                                        {...registerInfo('full_name')}
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
                                        {...registerInfo('role', { required: 'El rol es requerido' })}
                                    >
                                        <option value="client">Cliente</option>
                                        <option value="contractor">Contratista (Admin)</option>
                                    </select>
                                    {errorsInfo.role && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errorsInfo.role.message}
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
                                Restablecer Contraseña
                            </h2>

                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                                <p className="text-sm text-yellow-700">
                                    <strong>Atención:</strong> Estás por cambiar la contraseña de otro usuario.
                                    Asegúrate de comunicarle la nueva clave de acceso de forma segura.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                            validate: (value) =>
                                                value === newPassword || 'Las contraseñas no coinciden',
                                        })}
                                    />
                                    {errorsPassword.confirm_password && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errorsPassword.confirm_password.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-6 border-t border-neutral-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetPassword();
                                        setError('');
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
                                        'Actualizar Contraseña'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {showToast && (
                <Toast
                    message={toastMessage}
                    onClose={() => setShowToast(false)}
                />
            )}
        </DashboardLayout>
    );
}

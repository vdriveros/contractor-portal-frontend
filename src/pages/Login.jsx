import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError('');

        const result = await login(data.username, data.password);

        if (result.success) {
            if (result.user?.role === 'client') {
                navigate('/client/dashboard');
            } else {
                navigate('/dashboard');
            }
        } else {
            setError(result.error);
        }

        setIsLoading(false);
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center bg-[#070707] font-['Roboto',_'Arial',_sans-serif] text-white px-6 py-10 overflow-hidden sm:px-8 lg:px-12">
            {/* Fondos base */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,237,0,.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,.05),transparent_30%)]"></div>
            <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#FFED00]/10 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-white/5 blur-3xl"></div>

            <div className="relative z-10 w-full max-w-[420px]">
                <div className="bg-white text-black p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,.28)]">
                    {/* Logo Header */}
                    <div className="mb-10 flex justify-center">
                        <img
                            src="https://www.hormetal.com/wp-content/uploads/2025/03/logo.png"
                            alt="HORMETAL"
                            className="h-12 w-auto sm:h-14"
                        />
                    </div>

                    <div className="mb-6">
                        <h2 className="mt-1 font-['Oswald',_'Arial_Narrow',_sans-serif] text-4xl uppercase leading-none text-black">
                            PORTAL DE CLIENTES
                        </h2>
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/40 pt-4">
                            INICIAR SESIÓN
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label
                                htmlFor="username"
                                className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-black/60"
                            >
                                Usuario o correo
                            </label>
                            <input
                                id="username"
                                type="text"
                                placeholder="cliente@empresa.com"
                                className="w-full rounded-xl border border-black/10 bg-[#FAFAFA] px-4 py-3.5 text-sm text-black outline-none transition focus:border-[#FFED00] focus:ring-4 focus:ring-[#FFED00]/20"
                                {...register('username', {
                                    required: 'Usuario es requerido',
                                })}
                            />
                            {errors.username && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.username.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-black/60"
                            >
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="w-full rounded-xl border border-black/10 bg-[#FAFAFA] px-4 py-3.5 text-sm text-black outline-none transition focus:border-[#FFED00] focus:ring-4 focus:ring-[#FFED00]/20"
                                {...register('password', {
                                    required: 'Contraseña es requerida',
                                })}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="mt-8 flex w-full justify-center rounded-xl bg-[#FFED00] px-5 py-4 font-['Oswald',_'Arial_Narrow',_sans-serif] text-lg font-bold uppercase tracking-wide text-black transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
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
                                    Iniciando sesión...
                                </span>
                            ) : (
                                'Acceder al portal'
                            )}
                        </button>

                        <div className="mt-5">
                            <a href="#" className="text-xs text-black/50 transition hover:text-black">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>
                    </form>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center justify-center space-y-1 text-center pointer-events-none">
                <p className="text-[10px] uppercase tracking-[0.15em] text-white/40">
                    {new Date().getFullYear()} © HORMETAL. TODOS LOS DERECHOS RESERVADOS.
                </p>
            </div>
        </main>
    );
}
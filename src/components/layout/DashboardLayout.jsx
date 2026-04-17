import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, NavLink, Link } from 'react-router-dom';

export default function DashboardLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinkClass = ({ isActive }) =>
        isActive
            ? "text-accent border-b-2 border-accent px-1 pt-1 text-sm font-semibold uppercase tracking-wide"
            : "text-white hover:text-accent hover:border-accent border-b-2 border-transparent px-1 pt-1 text-sm font-semibold uppercase tracking-wide transition-colors";

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Top Navigation */}
            <nav className="bg-primary shadow-lg border-b-2 border-accent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo & Brand */}
                        <div className="flex items-center">
                            <div className="flex-shrink-0 flex items-center">
                                <div className="bg-white px-3 py-2 rounded">
                                    <img
                                        src="https://www.hormetal.com/wp-content/uploads/2025/03/logo.png"
                                        alt="Hormetal"
                                        className="h-8 w-auto"
                                    />
                                </div>
                                <span className="ml-3 text-xl font-bold text-accent uppercase tracking-wide">
                                    Portal
                                </span>
                            </div>

                            {/* Navigation Links */}
                            <div className="hidden md:ml-10 md:flex md:space-x-8">
                                <NavLink to={user?.role === 'client' ? '/client/dashboard' : '/dashboard'}
                                    className={navLinkClass}>
                                    Dashboard
                                </NavLink>
                                {user?.role === 'contractor' && (
                                    <>
                                        <NavLink to="/clients" className={navLinkClass}>Clients</NavLink>
                                        <NavLink to="/projects" className={navLinkClass}>Projects</NavLink>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right side - User menu */}
                        <div className="flex items-center">
                            <div className="relative">
                                {/* User button */}
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center space-x-4 focus:outline-none"
                                >
                                    {/* User info */}
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-semibold text-white uppercase tracking-wide">
                                            {user?.full_name || user?.username}
                                        </p>
                                        <p className="text-xs text-accent capitalize">
                                            {user?.role}
                                        </p>
                                    </div>

                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-primary font-bold uppercase">
                                        {user?.username?.[0].toUpperCase()}
                                    </div>
                                </button>

                                {/* Dropdown menu */}
                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border-2 border-accent">
                                        <Link
                                            to="/profile"
                                            onClick={() => setShowUserMenu(false)}
                                            className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 uppercase tracking-wide font-semibold"
                                        >
                                            <svg
                                                className="w-4 h-4 mr-3 text-accent"
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
                                            Mi Perfil
                                        </Link>
                                        <hr className="my-2 border-neutral-200" />
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 uppercase tracking-wide font-semibold"
                                        >
                                            <svg
                                                className="w-4 h-4 mr-3"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                />
                                            </svg>
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Click outside to close menu */}
            {showUserMenu && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                ></div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
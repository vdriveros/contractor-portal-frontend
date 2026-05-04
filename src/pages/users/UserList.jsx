import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { usersAPI } from '../../services/api';
import Toast from '../../components/common/Toast';

export default function UserList() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showToast, setShowToast] = useState(false);
    const itemsPerPage = 10;

    // Cargar usuarios
    useEffect(() => {
        fetchUsers();
    }, []);

    // Debounce de búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Resetear a la página 1 cuando cambia la búsqueda o los datos
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, users.length]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await usersAPI.list();
            setUsers(data);
            setError('');
        } catch (err) {
            setError('Error al cargar usuarios');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Eliminar usuario
    const handleDelete = async (userId) => {
        try {
            await usersAPI.delete(userId);
            setUsers(users.filter(u => u.id !== userId));
            setDeleteConfirm(null);
            setShowToast(true);
        } catch (err) {
            setError('Error al eliminar usuario');
            console.error(err);
        }
    };

    // Filtrar usuarios
    const filteredUsers = users.filter((user) => {
        const search = debouncedSearchTerm.toLowerCase();
        return (
            (user.username?.toLowerCase().includes(search)) ||
            (user.full_name?.toLowerCase().includes(search)) ||
            (user.email?.toLowerCase().includes(search)) ||
            (user.role?.toLowerCase().includes(search))
        );
    });

    // Paginación
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-primary uppercase tracking-wide">
                            Administración de Usuarios
                        </h1>
                        <p className="text-neutral-600 mt-1">
                            Gestiona el acceso y roles de los usuarios del sistema
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/users/create')}
                        className="btn-accent flex items-center gap-2"
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
                                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                            />
                        </svg>
                        Nuevo Usuario
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                            className="h-5 w-5 text-neutral-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar usuarios por nombre, email o rol..."
                        className="input-field pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Users Grid */}
                {users.length === 0 ? (
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
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>
                        <h3 className="mt-4 text-lg font-semibold text-primary uppercase">
                            No hay usuarios
                        </h3>
                        <p className="mt-2 text-neutral-600">
                            Comienza agregando tu primer usuario
                        </p>
                        <button
                            onClick={() => navigate('/users/create')}
                            className="mt-6 btn-accent inline-flex items-center gap-2"
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
                                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                />
                            </svg>
                            Crear Primer Usuario
                        </button>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="card text-center py-12">
                        <svg
                            className="mx-auto h-12 w-12 text-secondary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <h3 className="mt-4 text-lg font-semibold text-primary uppercase">
                            No se encontraron resultados
                        </h3>
                        <p className="mt-2 text-neutral-600">
                            Prueba con otros términos de búsqueda
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg border border-neutral-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-neutral-200">
                                <thead className="bg-primary">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-accent uppercase tracking-wider">
                                            Usuario / Nombre
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-accent uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-accent uppercase tracking-wider">
                                            Rol
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-accent uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-accent uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200">
                                    {paginatedUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-primary font-bold text-xs mr-3">
                                                        {user.username?.[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-primary uppercase">
                                                            {user.username}
                                                        </span>
                                                        <span className="text-xs text-neutral-600">
                                                            {user.full_name || 'Sin nombre'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                                                    user.role === 'contractor' 
                                                        ? 'bg-primary text-white' 
                                                        : 'bg-accent text-primary'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400 font-mono">
                                                {user.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/users/${user.id}/edit`)}
                                                        className="p-2 text-primary hover:text-accent-dark transition-colors"
                                                        title="Editar"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(user.id)}
                                                        className="p-2 text-red-600 hover:text-red-700 transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination footer */}
                        {totalPages > 1 && (
                            <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
                                <div className="text-sm text-neutral-600">
                                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuarios
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-semibold text-primary hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Anterior
                                    </button>
                                    <div className="flex items-center px-4 text-sm font-bold text-primary">
                                        Página {currentPage} de {totalPages}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-semibold text-primary hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full">
                            <h3 className="text-xl font-bold text-primary uppercase mb-4">
                                Confirmar Eliminación
                            </h3>
                            <p className="text-neutral-600 mb-6">
                                ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold uppercase"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showToast && (
                <Toast 
                    message="Usuario eliminado correctamente" 
                    onClose={() => setShowToast(false)}
                />
            )}
        </DashboardLayout>
    );
}

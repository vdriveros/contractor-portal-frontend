import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI, filesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ClientDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        const clientId = user?.client_profile?.id;
        try {
            setLoading(true);
            const data = await projectsAPI.list(clientId);
            setProjects(data);
            if (data && data.length > 0) {
                const active = data[0];
                setSelectedProject(active);
                fetchFiles(active.id);
            }
            setError('');
        } catch (err) {
            setError('Error al cargar proyectos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchFiles = async (projectId) => {
        try {
            const data = await filesAPI.list(projectId);
            setFiles(data || []);
        } catch (err) {
            console.error('Error fetching files', err);
        }
    };

    const handleProjectSelect = (project) => {
        setSelectedProject(project);
        setIsDropdownOpen(false);
        fetchFiles(project.id);
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'Activo';
            case 'completed': return 'Completado';
            case 'on_hold': return 'En Pausa';
            default: return status || 'N/A';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-hormetal-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hormetal-yellow"></div>
            </div>
        );
    }

    if (error || projects.length === 0) {
        return (
            <div className="min-h-screen bg-hormetal-black text-white font-body p-8 flex flex-col items-center justify-center relative">
                {/* fondos suaves */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,237,0,.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,255,255,.05),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(255,237,0,.06),transparent_24%)]"></div>
                <div className="pointer-events-none absolute -top-20 -left-16 h-80 w-80 rounded-full bg-hormetal-yellow/10 blur-3xl"></div>

                <div className="relative z-10 text-center">
                    <img src="https://www.hormetal.com/wp-content/uploads/2025/03/logo.png" alt="HORMETAL" className="h-16 mx-auto mb-10" />
                    <h2 className="text-3xl font-heading mb-4 text-hormetal-yellow uppercase">Atención</h2>
                    <p className="text-lg text-white/70">{error || 'Tu contratista aún no ha creado proyectos para ti'}</p>
                    <button onClick={logout} className="mt-8 px-6 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition">Cerrar Sesión</button>
                </div>
            </div>
        );
    }

    // Calculations for the dashboard
    const sortedFiles = [...files].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const photos = sortedFiles.filter(f => f.file_type === 'image');
    const videos = sortedFiles.filter(f => f.file_type === 'video');

    const lastFile = sortedFiles[0];
    const lastUploadDate = lastFile ? new Date(lastFile.created_at).toLocaleDateString() : 'N/A';

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const lastUploadedMonth = lastFile
        ? `${monthNames[new Date(lastFile.created_at).getMonth()]} ${new Date(lastFile.created_at).getFullYear()}`
        : 'N/A';

    // Group files by month
    const filesByMonth = {};
    sortedFiles.forEach(file => {
        const d = new Date(file.created_at);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (!filesByMonth[key]) {
            filesByMonth[key] = {
                year: d.getFullYear(),
                month: d.getMonth(),
                monthName: monthNames[d.getMonth()],
                files: [],
                lastUploadDate: file.created_at
            };
        }
        filesByMonth[key].files.push(file);
    });

    const monthsList = Object.values(filesByMonth).sort((b, a) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });

    return (
        <div className="bg-hormetal-black text-white font-body min-h-screen relative overflow-hidden">
            {/* fondos suaves */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,237,0,.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,255,255,.05),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(255,237,0,.06),transparent_24%)]"></div>
            <div className="pointer-events-none absolute -top-20 -left-16 h-80 w-80 rounded-full bg-hormetal-yellow/10 blur-3xl"></div>
            <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-white/5 blur-3xl"></div>

            {/* Header */}
            <header className="relative z-50 border-b border-black/5 bg-white shadow-sm pt-3 pb-3">
                <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-6 sm:gap-8">
                            <img src="https://www.hormetal.com/wp-content/uploads/2025/03/logo.png" alt="HORMETAL" className="h-12 w-auto sm:h-14" />

                            <div className="pt-1">
                                <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-black/40">
                                    Dashboard de obra <span className="mx-1">|</span> Cliente: {user?.client_profile?.company_name || user?.username}
                                </p>

                                {/* Dropdown Selector de Proyectos */}
                                <div className="relative mt-1 group inline-block" onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
                                    <button type="button" className="flex items-center gap-3 font-heading text-[1.75rem] sm:text-[2rem] uppercase leading-none text-black transition hover:text-black/70 cursor-pointer">
                                        <h1 className="pointer-events-none">Proyecto: {selectedProject?.name}</h1>
                                        <svg className={`h-6 w-6 text-black transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* list of projects of the client */}
                                    <div className={`absolute left-0 top-full z-50 w-72 origin-top-left pt-2 transition-all duration-300 ${isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                                        <div className="rounded-xl bg-white shadow-[0_15px_40px_rgba(0,0,0,0.15)] border border-black/5 overflow-hidden">
                                            <div className="py-2 flex flex-col font-body">
                                                <div className="px-5 py-3 border-b border-black/5">
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Mis Proyectos</p>
                                                </div>
                                                {projects.map(p => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => handleProjectSelect(p)}
                                                        className={`flex items-center px-5 py-3 text-sm font-bold uppercase transition text-left ${p.id === selectedProject.id ? 'bg-hormetal-yellow/10 text-black border-l-[3px] border-hormetal-yellow' : 'text-black/60 hover:text-black hover:bg-black/5 border-l-[3px] border-transparent'}`}
                                                    >
                                                        {p.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {/* END list of projects */}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <span className="inline-flex items-center rounded-3xl bg-[#DAEEB1] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#1F3300]">
                                {getStatusText(selectedProject?.status)}
                            </span>

                            <button onClick={logout} className="inline-flex items-center rounded-xl border border-black/15 bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-black/5">
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="relative z-10 mx-auto max-w-7xl space-y-8 px-6 py-8 lg:px-8">
                {/* Hero resumen */}
                <section>
                    <div className="overflow-hidden border border-white/10 bg-white/[0.03] shadow-panel">
                        <div className="grid lg:grid-cols-[1.1fr_.9fr]">
                            <div className="p-6 sm:p-8">
                                <p className="text-[11px] uppercase tracking-[0.28em] text-hormetal-yellow">Seguimiento exclusivo</p>
                                <h2 className="mt-3 font-heading text-4xl uppercase leading-none sm:text-5xl">
                                    Visualizá el avance de tu obra con orden y claridad
                                </h2>
                                <p className="mt-5 max-w-xl text-base leading-7 text-white/72">
                                    En este panel podrá revisar fotografías, videos, etapas ejecutadas, novedades y datos de contacto relacionados a su proyecto, organizados de forma clara y cronológica.
                                </p>

                                <div className="mt-7 flex flex-wrap gap-3">
                                    <a href="#meses" className="inline-flex items-center rounded-xl bg-hormetal-yellow px-5 py-3 font-heading text-lg uppercase tracking-wide text-black transition hover:-translate-y-0.5">
                                        Ver meses
                                    </a>
                                </div>
                            </div>

                            {/* hero image - last image uploaded */}
                            <div className="relative min-h-[260px] border-t border-white/10 lg:border-l lg:border-t-0 flex items-center justify-center bg-black">
                                {photos.length > 0 ? (
                                    <>
                                        <img src={photos[0].presigned_url} alt="Avance de obra" className="absolute inset-0 h-full w-full object-cover opacity-80" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 right-0 p-5">
                                            <p className="text-[11px] uppercase tracking-[0.22em] text-hormetal-yellow">Último registro cargado</p>
                                            <p className="mt-2 text-lg font-medium text-white">{new Date(photos[0].created_at).toLocaleDateString()}</p>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-white/40 uppercase tracking-widest text-sm">Sin imágenes aún</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tarjetas resumen */}
                <section>
                    <div className="mb-5 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.25em] text-white/45">Resumen general</p>
                            <h3 className="mt-2 font-heading text-3xl uppercase leading-none">Estado actual</h3>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <article className="border border-white/10 bg-white/[0.03] p-5 shadow-soft">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Última actualización</p>
                            <h4 className="mt-3 font-heading text-3xl uppercase text-hormetal-yellow">{lastUploadDate}</h4>
                            <p className="mt-2 text-sm text-white/65">Carga más reciente de material y comentarios.</p>
                        </article>

                        <article className="border border-white/10 bg-white/[0.03] p-5 shadow-soft">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Mes actual de avance</p>
                            <h4 className="mt-3 font-heading text-3xl uppercase text-hormetal-yellow">{lastUploadedMonth}</h4>
                            <p className="mt-2 text-sm text-white/65">Etapa visible actualmente en seguimiento.</p>
                        </article>

                        <article className="border border-white/10 bg-white/[0.03] p-5 shadow-soft">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Fotos cargadas</p>
                            <h4 className="mt-3 font-heading text-3xl uppercase text-hormetal-yellow">{photos.length}</h4>
                            <p className="mt-2 text-sm text-white/65">Registros fotográficos acumulados del proyecto.</p>
                        </article>

                        <article className="border border-white/10 bg-white/[0.03] p-5 shadow-soft">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Videos cargados</p>
                            <h4 className="mt-3 font-heading text-3xl uppercase text-hormetal-yellow">{videos.length}</h4>
                            <p className="mt-2 text-sm text-white/65">Material audiovisual disponible para revisión.</p>
                        </article>
                    </div>
                </section>

                {/* Meses */}
                <section id="meses" className="scroll-mt-20">
                    <div className="mb-5 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.25em] text-white/45">Navegación mensual</p>
                            <h3 className="mt-2 font-heading text-3xl uppercase leading-none">Avances por mes</h3>
                        </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                        {monthsList.map((m, idx) => {
                            const coverFile = m.files.find(f => f.file_type === 'image') || m.files[0];
                            const isVideo = coverFile?.file_type === 'video';

                            return (
                                <article key={`${m.year}-${m.month}`} className="overflow-hidden border border-white/10 bg-white/[0.03] shadow-soft">
                                    <div className="relative h-56 overflow-hidden bg-black flex items-center justify-center">
                                        {isVideo ? (
                                            <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline>
                                                <source src={coverFile.presigned_url} type="video/mp4" />
                                            </video>
                                        ) : (
                                            coverFile ? (
                                                <img src={coverFile.presigned_url} alt={`${m.monthName} ${m.year}`} className="absolute inset-0 h-full w-full object-cover transition duration-500 hover:scale-105" />
                                            ) : (
                                                <span className="text-white/30 uppercase text-sm tracking-widest">Sin vista previa</span>
                                            )
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                                        <div className="absolute left-4 top-4 inline-flex rounded-full border border-hormetal-yellow/25 bg-hormetal-yellow/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-hormetal-yellow">
                                            Mes {String(idx + 1).padStart(2, '0')}
                                        </div>
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <h4 className="font-heading text-3xl uppercase leading-none text-white">{m.monthName} {m.year}</h4>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 border-t border-white/10">
                                        <div className="border-r border-white/10 p-4">
                                            <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Archivos</p>
                                            <p className="mt-2 text-lg font-medium text-white">{m.files.length} registros</p>
                                        </div>
                                        <div className="p-4">
                                            <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Última carga</p>
                                            <p className="mt-2 text-lg font-medium text-white">{new Date(m.lastUploadDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <button
                                            onClick={() => navigate(`/client/projects/${selectedProject.id}/month/${m.year}/${m.month + 1}`)}
                                            className="inline-flex w-full items-center justify-center rounded-xl bg-hormetal-yellow px-4 py-3 font-heading text-lg uppercase tracking-wide text-black transition hover:-translate-y-0.5"
                                        >
                                            Ver avance
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                        {monthsList.length === 0 && (
                            <div className="col-span-full py-12 text-center border border-white/10 bg-white/[0.03]">
                                <p className="text-white/50 uppercase tracking-widest text-sm">No hay registros de avance cargados aún</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Contactos */}
                <section>
                    <div className="mb-5">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-white/45">Canales de atención</p>
                        <h3 className="mt-2 font-heading text-3xl uppercase leading-none">Datos de contacto</h3>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="border border-white/10 bg-white/[0.03] p-5 shadow-soft">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Asesor</p>
                            <p className="mt-3 text-xl font-medium text-white">{selectedProject?.advisor || 'N/A'}</p>
                        </div>

                        <div className="border border-white/10 bg-white/[0.03] p-5 shadow-soft">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Responsable de obra</p>
                            <p className="mt-3 text-xl font-medium text-white">{selectedProject?.project_manager || 'N/A'}</p>
                        </div>

                        <div className="border border-white/10 bg-white/[0.03] p-5 shadow-soft">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Teléfono / WhatsApp</p>
                            <p className="mt-3 text-xl font-medium text-white">{selectedProject?.advisor_phone || 'N/A'}</p>
                        </div>

                        <div className="border border-white/10 bg-white/[0.03] p-5 shadow-soft">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Correo Marketing</p>
                            <p className="mt-3 text-[18px] text-white break-all">{selectedProject?.advisor_email || 'N/A'}</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10">
                <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
                    <div className="flex flex-col-reverse md:flex-row md:items-start justify-between gap-8 md:gap-16">
                        <div className="space-y-1.5 flex-none mt-2 md:mt-0">
                            <p className="text-[10px] uppercase tracking-[0.15em] text-white/40">
                                {new Date().getFullYear()} © HORMETAL. TODOS LOS DERECHOS RESERVADOS.
                            </p>

                            <a href="https://www.khipu.com.py/" target="_blank" rel="noopener noreferrer" className="block text-[10px] uppercase tracking-[0.15em] text-white/35 transition hover:text-hormetal-yellow">
                                CRAFTED WITH CARE BY KHIPU
                            </a>
                        </div>

                        <div className="max-w-xl md:text-right">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-hormetal-yellow mb-2 font-bold">
                                Información del contenido
                            </p>
                            <p className="text-[13px] leading-relaxed text-white/50">
                                Una vez finalizada la obra, las imágenes y videos permanecerán disponibles durante un período de 3 meses.
                                Transcurrido ese plazo, el contenido será eliminado del portal, por lo que recomendamos mantener sus
                                descargas actualizadas.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

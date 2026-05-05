import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectsAPI, filesAPI } from '../../services/api';

export default function ClientProjectDetail() {
    const { id, year, month } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [monthFiles, setMonthFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const monthName = monthNames[parseInt(month, 10) - 1] || 'Mes Inválido';

    useEffect(() => {
        fetchProjectData();
    }, [id, year, month]);

    const fetchProjectData = async () => {
        try {
            setLoading(true);
            const [projectData, filesData] = await Promise.all([
                projectsAPI.get(id),
                filesAPI.list(id),
            ]);

            setProject(projectData);

            // Filter files by year and month
            const filteredFiles = (filesData || []).filter(file => {
                const d = new Date(file.created_at);
                return d.getFullYear() === parseInt(year, 10) && (d.getMonth() + 1) === parseInt(month, 10);
            });

            // Sort newest first
            filteredFiles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setMonthFiles(filteredFiles);
            setError('');
        } catch (err) {
            setError('Error al cargar el proyecto');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const imageFiles = monthFiles.filter(f => f.file_type === 'image');
    const videoFiles = monthFiles.filter(f => f.file_type === 'video');
    const allMediaFiles = [...imageFiles, ...videoFiles];

    // Lightbox handlers
    const openLightbox = (file) => {
        const index = allMediaFiles.findIndex(f => f.id === file.id);
        if (index !== -1) {
            setCurrentImageIndex(index);
            setLightboxOpen(true);
        }
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const nextMedia = () => {
        setCurrentImageIndex((prev) =>
            prev === allMediaFiles.length - 1 ? 0 : prev + 1
        );
    };

    const prevMedia = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? allMediaFiles.length - 1 : prev - 1
        );
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!lightboxOpen) return;
            if (e.key === 'ArrowRight') nextMedia();
            if (e.key === 'ArrowLeft') prevMedia();
            if (e.key === 'Escape') closeLightbox();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen, currentImageIndex, allMediaFiles.length]);

    if (loading) {
        return (
            <div className="min-h-screen bg-hormetal-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hormetal-yellow"></div>
            </div>
        );
    }

    if (!project || error) {
        return (
            <div className="min-h-screen bg-hormetal-black text-white font-body p-8 flex flex-col items-center justify-center relative">
                {/* fondos suaves */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,237,0,.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,255,255,.05),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(255,237,0,.06),transparent_24%)]"></div>
                <div className="relative z-10 text-center">
                    <h2 className="text-3xl font-heading mb-4 text-hormetal-yellow uppercase">Atención</h2>
                    <p className="text-lg text-white/70">{error || 'Proyecto no encontrado'}</p>
                    <button onClick={() => navigate('/client/dashboard')} className="mt-8 px-6 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition">
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    const lastUploadDate = monthFiles.length > 0 ? new Date(monthFiles[0].created_at).toLocaleDateString() : 'N/A';
    const lastUploadDay = monthFiles.length > 0 ? String(new Date(monthFiles[0].created_at).getDate()).padStart(2, '0') : '--';
    const lastUploadYear = monthFiles.length > 0 ? new Date(monthFiles[0].created_at).getFullYear() : '--';
    const lastUploadMonthName = monthFiles.length > 0 ? monthNames[new Date(monthFiles[0].created_at).getMonth()].substring(0, 3) : '---';

    const currentMedia = allMediaFiles[currentImageIndex];

    return (
        <div className="bg-hormetal-black text-white font-body min-h-screen relative overflow-hidden">
            {/* fondos suaves */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,237,0,.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,255,255,.05),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(255,237,0,.06),transparent_24%)]"></div>
            <div className="pointer-events-none absolute -top-20 -left-16 h-80 w-80 rounded-full bg-hormetal-yellow/10 blur-3xl"></div>
            <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-white/5 blur-3xl"></div>

            {/* Header */}
            <header className="relative z-10 border-b border-black/5 bg-white shadow-sm pt-3 pb-3">
                <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-6 sm:gap-8">
                            <img src="https://www.hormetal.com/wp-content/uploads/2025/03/logo.png" alt="HORMETAL" className="h-12 w-auto sm:h-14" />

                            <div className="pt-1">
                                <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-black/40">
                                    Vista mensual de obra <span className="mx-1">|</span> Proyecto {project.name}
                                </p>
                                <h1 className="mt-1 font-heading text-[1.75rem] sm:text-[2rem] uppercase leading-none text-black">
                                    {monthName} {year}
                                </h1>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <button onClick={() => navigate('/client/dashboard')} className="inline-flex items-center rounded-xl border border-black/15 bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-black/5">
                                &#60;&#60; Volver al dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="relative z-10 mx-auto max-w-7xl space-y-8 px-6 py-8 lg:px-8">
                {/* Hero del mes */}
                <section>
                    <div className="overflow-hidden border border-white/10 bg-white/[0.03] shadow-panel">
                        <div className="grid lg:grid-cols-[1.05fr_.95fr]">
                            <div className="p-6 sm:p-8">
                                <p className="text-[11px] uppercase tracking-[0.28em] text-hormetal-yellow">Resumen mensual</p>
                                <h2 className="mt-3 font-heading text-4xl uppercase leading-none sm:text-5xl">
                                    Avance consolidado de {monthName.toLowerCase()} {year}
                                </h2>

                                <div className="mt-7 grid gap-4 sm:grid-cols-3">
                                    <article className="border border-white/10 bg-black/30 p-4">
                                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Fecha de carga</p>
                                        <h3 className="mt-2 font-heading text-3xl uppercase text-hormetal-yellow">{lastUploadDay} {lastUploadMonthName}</h3>
                                        <p className="mt-1 text-sm text-white/65">{lastUploadYear}</p>
                                    </article>

                                    <article className="border border-white/10 bg-black/30 p-4">
                                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Fotografías</p>
                                        <h3 className="mt-2 font-heading text-3xl uppercase text-hormetal-yellow">{String(imageFiles.length).padStart(2, '0')}</h3>
                                        <p className="mt-1 text-sm text-white/65">registros cargados</p>
                                    </article>

                                    <article className="border border-white/10 bg-black/30 p-4">
                                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Videos</p>
                                        <h3 className="mt-2 font-heading text-3xl uppercase text-hormetal-yellow">{String(videoFiles.length).padStart(2, '0')}</h3>
                                        <p className="mt-1 text-sm text-white/65">clips disponibles</p>
                                    </article>
                                </div>
                            </div>

                            <div className="relative min-h-[320px] border-t border-white/10 lg:border-l lg:border-t-0 flex items-center justify-center bg-black">
                                {allMediaFiles.length > 0 ? (
                                    <>
                                        {allMediaFiles[0].file_type === 'video' ? (
                                            <video className="absolute inset-0 h-full w-full object-cover opacity-80" autoPlay muted loop playsInline>
                                                <source src={allMediaFiles[0].presigned_url} type="video/mp4" />
                                            </video>
                                        ) : (
                                            <img src={allMediaFiles[0].presigned_url} alt="Destacado" className="absolute inset-0 h-full w-full object-cover opacity-80" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 right-0 p-5">
                                            <p className="text-[11px] uppercase tracking-[0.22em] text-hormetal-yellow">Registro destacado del mes</p>
                                            <p className="mt-2 text-lg font-medium text-white">{new Date(allMediaFiles[0].created_at).toLocaleDateString()}</p>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-white/40 uppercase tracking-widest text-sm">Sin registros del mes</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Navegación interna */}
                <section>
                    <div className="flex flex-wrap gap-3">
                        <a href="#galeria-fotos" className="inline-flex items-center rounded-xl bg-hormetal-yellow px-5 py-3 font-heading text-lg uppercase tracking-wide text-black transition hover:-translate-y-0.5">
                            Fotografías
                        </a>
                        <a href="#galeria-videos" className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-heading text-lg uppercase text-white transition hover:bg-white/10">
                            VIDEOS
                        </a>
                    </div>
                </section>

                {/* Galería de fotografías */}
                <section id="galeria-fotos" className="scroll-mt-24">
                    <div className="mb-5">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-white/45">Registro visual</p>
                        <h3 className="mt-2 font-heading text-3xl uppercase leading-none">Galería de fotografías</h3>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {imageFiles.map((file, idx) => (
                            <article key={file.id} className="overflow-hidden border border-white/10 bg-white/[0.03] shadow-soft">
                                <div
                                    className="relative h-64 overflow-hidden cursor-pointer"
                                    onClick={() => openLightbox(file)}
                                >
                                    <img src={file.presigned_url} alt={file.file_name} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent"></div>
                                </div>
                                <div className="p-4">
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-hormetal-yellow truncate">{new Date(file.created_at).toLocaleDateString()}</p>
                                </div>
                            </article>
                        ))}
                        {imageFiles.length === 0 && (
                            <div className="col-span-full py-12 text-center border border-white/10 bg-white/[0.03]">
                                <p className="text-white/50 uppercase tracking-widest text-sm">No hay fotografías cargadas para este mes</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Galería de videos */}
                <section id="galeria-videos" className="scroll-mt-24">
                    <div className="mb-5">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-white/45">Material audiovisual</p>
                        <h3 className="mt-2 font-heading text-3xl uppercase leading-none">Galería de videos</h3>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                        {videoFiles.map((file, idx) => (
                            <article key={file.id} className="overflow-hidden border border-white/10 bg-white/[0.03] shadow-soft">
                                <div
                                    className="aspect-video bg-black cursor-pointer"
                                    onClick={() => openLightbox(file)}
                                >
                                    <video className="h-full w-full object-cover pointer-events-none" preload="metadata" muted>
                                        <source src={file.presigned_url} type="video/mp4" />
                                    </video>
                                </div>
                                <div className="p-4">
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-hormetal-yellow truncate">{new Date(file.created_at).toLocaleDateString()}</p>
                                </div>
                            </article>
                        ))}
                        {videoFiles.length === 0 && (
                            <div className="col-span-full py-12 text-center border border-white/10 bg-white/[0.03]">
                                <p className="text-white/50 uppercase tracking-widest text-sm">No hay videos cargados para este mes</p>
                            </div>
                        )}
                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10">
                <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-white/40">
                            {new Date().getFullYear()} © HORMETAL. TODOS LOS DERECHOS RESERVADOS.
                        </p>

                        <a href="https://www.khipu.com.py/" target="_blank" rel="noopener noreferrer" className="inline-block text-[10px] uppercase tracking-[0.15em] text-white/35 transition hover:text-hormetal-yellow">
                            CRAFTED WITH CARE BY KHIPU
                        </a>
                    </div>
                </div>
            </footer>

            {/* React Lightbox */}
            {lightboxOpen && currentMedia && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/95 backdrop-blur-sm">
                    <div className="relative w-full max-w-[1200px] max-h-full grid gap-4">
                        <div className="relative border border-white/10 bg-[#050505] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.35)]">

                            {/* Close */}
                            <button onClick={closeLightbox} className="absolute top-4 right-4 w-12 h-12 z-10 border border-white/10 bg-[#0a0a0a]/70 text-white flex items-center justify-center transition-all hover:border-hormetal-yellow/40 hover:text-hormetal-yellow hover:bg-black/80 hover:-translate-y-0.5">
                                ✕
                            </button>

                            {/* Prev */}
                            {allMediaFiles.length > 1 && (
                                <button onClick={prevMedia} className="absolute left-4 top-1/2 -translate-y-1/2 w-[54px] h-[54px] z-10 border border-white/10 bg-[#0a0a0a]/70 text-white flex items-center justify-center transition-all hover:border-hormetal-yellow/40 hover:text-hormetal-yellow hover:bg-black/80 hover:-translate-y-0.5">
                                    ‹
                                </button>
                            )}

                            {/* Next */}
                            {allMediaFiles.length > 1 && (
                                <button onClick={nextMedia} className="absolute right-4 top-1/2 -translate-y-1/2 w-[54px] h-[54px] z-10 border border-white/10 bg-[#0a0a0a]/70 text-white flex items-center justify-center transition-all hover:border-hormetal-yellow/40 hover:text-hormetal-yellow hover:bg-black/80 hover:-translate-y-0.5">
                                    ›
                                </button>
                            )}

                            {/* Media Box */}
                            <div className="w-full h-[min(78vh,820px)] flex items-center justify-center bg-black">
                                {currentMedia.file_type === 'video' ? (
                                    <video src={currentMedia.presigned_url} controls autoPlay playsInline className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <img src={currentMedia.presigned_url} alt={currentMedia.file_name} className="max-w-full max-h-full object-contain" />
                                )}
                            </div>
                        </div>

                        {/* Caption */}
                        <div className="flex flex-wrap gap-2 items-center justify-between text-white/80 text-sm">
                            <div>
                                <strong className="text-hormetal-yellow font-semibold tracking-wider uppercase text-[11px] block mb-1">
                                    {currentMedia.file_name}
                                </strong>
                                <p className="text-white/70">
                                    Subido el {new Date(currentMedia.created_at).toLocaleDateString('es-ES')}
                                </p>
                            </div>
                            <div className="text-white/50 text-xs tracking-widest uppercase">
                                {currentImageIndex + 1} / {allMediaFiles.length}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
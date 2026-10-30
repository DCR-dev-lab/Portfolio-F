import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Github, X } from "lucide-react";
import portfolioPlaceholder from "../../assets/images/portfolio-placeholder.svg";
import ExpandedProjects from "./ExpandedProjects";
import { clamp, computeLayout, GAP, magneticTargets, smooth } from "./magneticProjectUtils";

/**
 * MagneticProjects
 * Adapted from the "Magnetic Carousel" idea: a row of slim image slices. Move the cursor along
 * it and the slices near the pointer swell and fill with colour like a wave; click one to open
 * it as a detail card (the others blur back). Sizes adapt to the container width and project
 * count; on phones it falls back to the vertical accordion (ExpandedProjects).
 */
const CH = 340; // closed height
const HH = 420; // height at full hover
const OH = 480; // open height
const NARROW = 720; // below this width: accordion instead

const hasUrl = (u) => Boolean(u) && u !== "#";

const MagneticProjects = ({ projects = [] }) => {
    const n = projects.length;
    const wrapRef = useRef(null);
    const openRef = useRef(null);
    const rectLeftRef = useRef(0);
    const [W, setW] = useState(0);
    const [factors, setFactors] = useState(() => projects.map(() => 0));
    const [open, setOpen] = useState(null);
    const [closing, setClosing] = useState(false);

    const target = useRef(projects.map(() => 0));
    const cur = useRef(projects.map(() => 0));
    const loop = useRef(0);
    const closeTimer = useRef(0);

    const narrow = W > 0 && W < NARROW;
    const L = computeLayout(W || 1000, Math.max(n, 1));

    const updateBounds = useCallback(() => {
        const el = wrapRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        rectLeftRef.current = rect.left;
        setW(Math.round(rect.width));
    }, []);

    // measure the container
    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => updateBounds());
        ro.observe(el);
        updateBounds();
        window.addEventListener("resize", updateBounds, { passive: true });
        window.addEventListener("scroll", updateBounds, { passive: true });
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", updateBounds);
            window.removeEventListener("scroll", updateBounds);
        };
    }, [updateBounds]);

    // reset when the number of projects changes
    useEffect(() => {
        target.current = Array.from({ length: n }, () => 0);
        cur.current = Array.from({ length: n }, () => 0);
        setFactors(Array.from({ length: n }, () => 0));
        setOpen(null);
    }, [n]);

    useEffect(
        () => () => {
            cancelAnimationFrame(loop.current);
            clearTimeout(closeTimer.current);
        },
        []
    );

    // ease the slice sizes toward their targets (only runs while something is moving)
    const run = () => {
        if (loop.current) return;
        const step = () => {
            let moving = false;
            const c = cur.current;
            const t = target.current;
            for (let i = 0; i < c.length; i++) {
                const d = (t[i] ?? 0) - c[i];
                if (Math.abs(d) > 0.001) {
                    c[i] += d * 0.22;
                    moving = true;
                } else c[i] = t[i] ?? 0;
            }
            setFactors([...c]);
            loop.current = moving ? requestAnimationFrame(step) : 0;
        };
        loop.current = requestAnimationFrame(step);
    };

    const onMove = (e) => {
        if (open !== null || narrow || e.pointerType === "touch") return;
        const left = rectLeftRef.current || (wrapRef.current ? wrapRef.current.getBoundingClientRect().left : 0);
        target.current = magneticTargets(e.clientX - left, W, n, L);
        run();
    };

    const onCardMove = (e) => {
        if (e.pointerType && e.pointerType !== "mouse") return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);
        e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
        e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
    };

    const onCardLeave = (e) => {
        e.currentTarget.style.setProperty("--mouse-x", "50%");
        e.currentTarget.style.setProperty("--mouse-y", "100%");
    };

    const relax = () => {
        if (open !== null) return;
        target.current = Array.from({ length: n }, () => 0);
        run();
    };
    const pull = (i) => {
        // keyboard focus pulls slice i like a cursor would
        if (open !== null) return;
        target.current = projects.map((_, j) => smooth(Math.max(0, 1 - (Math.abs(j - i) * (L.cw + GAP)) / L.influence)));
        run();
    };

    // Escape closes; clicking empty space (not a card) closes
    useEffect(() => {
        if (open === null) return;
        const close = () => {
            target.current = Array.from({ length: n }, () => 0);
            cur.current = Array.from({ length: n }, () => 0);
            setFactors(Array.from({ length: n }, () => 0));
            setClosing(true);
            clearTimeout(closeTimer.current);
            closeTimer.current = setTimeout(() => setClosing(false), 520);
            setOpen(null);
        };
        const onKey = (e) => e.key === "Escape" && close();
        const onDown = (e) => {
            if (!e.target.closest || !e.target.closest("[data-magnetic-card]")) close();
        };
        window.addEventListener("keydown", onKey);
        document.addEventListener("pointerdown", onDown);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.removeEventListener("pointerdown", onDown);
        };
    }, [open, n]);

    if (!n) return null;

    const sizeFor = (i) => {
        if (open !== null) return i === open ? { w: L.ow, h: OH } : { w: L.cwOpen, h: CH };
        const f = factors[i] ?? 0;
        return { w: L.cw + (L.hw - L.cw) * f, h: CH + (HH - CH) * f };
    };

    const animating = open !== null || closing;
    const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
    const trans = animating
        ? `width .5s ${ease}, height .5s ${ease}, filter .5s ${ease}, opacity .5s ${ease}`
        : "none";

    return (
        <div ref={wrapRef} data-no-shatter data-magnetic-area className="w-full">
            {narrow ? (
                <ExpandedProjects projects={projects} />
            ) : (
                <div
                    onPointerEnter={updateBounds}
                    onPointerMove={onMove}
                    onPointerLeave={relax}
                    data-magnetic-area
                    className="relative flex items-center justify-center"
                    style={{ height: OH + 40, gap: GAP, visibility: W ? "visible" : "hidden" }}
                >
                    {projects.map((p, i) => {
                        const { w, h } = sizeFor(i);
                        const f = open === null ? factors[i] ?? 0 : 0;
                        const isOpen = open === i;
                        const dimmed = open !== null && !isOpen;
                        const index = String(i + 1).padStart(2, "0");
                        const imageSrc = p.imageUrl || portfolioPlaceholder;
                        return (
                            <article
                                key={p._id ?? i}
                                ref={isOpen ? openRef : null}
                                data-magnetic-card
                                data-magnetic-open={isOpen}
                                onPointerMove={onCardMove}
                                onPointerLeave={onCardLeave}
                                className="relative flex-none overflow-hidden rounded-2xl border border-stone-800/80 bg-stone-950"
                                style={{
                                    width: w,
                                    height: h,
                                    transition: trans,
                                    willChange: "width, height",
                                    zIndex: isOpen ? 3 : 2,
                                    filter: dimmed ? "blur(2px)" : "none",
                                    opacity: dimmed ? 0.6 : 1,
                                    boxShadow: isOpen
                                        ? "0 20px 50px -10px rgba(0,0,0,0.8), 0 0 35px rgba(220,38,38,0.25)"
                                        : f > 0.05
                                          ? `0 12px 30px -5px rgba(0,0,0,0.6), 0 0 24px rgba(220,38,38,${f * 0.3})`
                                          : undefined,
                                }}
                            >
                                {imageSrc ? (
                                    <img
                                        src={imageSrc}
                                        alt=""
                                        decoding="async"
                                        draggable={false}
                                        className="absolute inset-0 h-full w-full object-cover will-change-[transform,filter]"
                                        style={{
                                            filter: isOpen
                                                ? "grayscale(0) brightness(0.7)"
                                                : `grayscale(${1 - f}) brightness(${0.4 + 0.4 * f})`,
                                            transform: isOpen ? "scale(1) translateZ(0)" : `scale(${1.1 - f * 0.05}) translateZ(0)`,
                                            transition: animating ? "filter .5s, transform .5s" : "none",
                                        }}
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-stone-950" />
                                )}
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/45 to-transparent" />

                                {/* Ambient bottom warmth */}
                                <div
                                    className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                                    style={{
                                        opacity: isOpen ? 0.8 : f * 0.8,
                                        background: "radial-gradient(ellipse at 50% 115%, rgba(220,38,38,0.22), transparent 65%)",
                                    }}
                                />

                                {/* Magnetic Liquid Pull Glow: centers directly on cursor coordinates */}
                                <div
                                    className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                                    style={{
                                        opacity: isOpen ? 1 : f > 0.04 ? Math.min(1, f * 1.35) : 0,
                                        background: "radial-gradient(320px circle at var(--mouse-x, 50%) var(--mouse-y, 100%), rgba(239,68,68,0.25), rgba(220,38,38,0.06) 45%, transparent 75%)",
                                    }}
                                />

                                {/* Dynamic Magnetic Border Spotlight (1px perimeter highlight nearest to cursor) */}
                                <div
                                    className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
                                    style={{
                                        opacity: isOpen ? 0.95 : f > 0.04 ? Math.min(1, f * 1.5) : 0,
                                        padding: "1px",
                                        background: "radial-gradient(240px circle at var(--mouse-x, 50%) var(--mouse-y, 100%), rgba(239,68,68,0.65), rgba(220,38,38,0.2) 45%, transparent 70%)",
                                        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                        WebkitMaskComposite: "xor",
                                        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                        maskComposite: "exclude",
                                    }}
                                />

                                <span className="absolute left-3.5 top-3.5 font-mono text-[11px] text-stone-300/80">{index}</span>

                                {/* labels: vertical when slim, horizontal when swollen */}
                                {!isOpen && (
                                    <>
                                        <span
                                            className="absolute bottom-5 left-1/2 -translate-x-1/2 rotate-180 whitespace-nowrap text-base font-semibold tracking-tight text-stone-100 [writing-mode:vertical-rl]"
                                            style={{ opacity: clamp(1 - f * 2.2, 0, 1) }}
                                        >
                                            {p.title}
                                        </span>
                                        <span
                                            className="absolute inset-x-4 bottom-5 truncate text-sm font-semibold text-stone-100"
                                            style={{ opacity: clamp((f - 0.4) / 0.4, 0, 1) }}
                                        >
                                            {p.title}
                                        </span>
                                    </>
                                )}

                                {/* the whole slice is one real button while closed */}
                                {!isOpen && (
                                    <button
                                        type="button"
                                        aria-expanded={false}
                                        aria-label={`Open ${p.title}`}
                                        onClick={() => setOpen(i)}
                                        onFocus={() => pull(i)}
                                        onBlur={relax}
                                        className="absolute inset-0 z-10 cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
                                    />
                                )}

                                {/* details (only interactive while open) */}
                                <div
                                    className={`absolute inset-x-0 bottom-0 z-20 p-7 transition-all duration-500 ${
                                        isOpen ? "translate-y-0 opacity-100 delay-300" : "pointer-events-none translate-y-4 opacity-0"
                                    }`}
                                    aria-hidden={!isOpen}
                                >
                                    {p.type && (
                                        <div className="mb-3 flex items-center gap-2">
                                            <span className="h-px w-6 bg-red-500" />
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-red-400">{p.type}</span>
                                        </div>
                                    )}
                                    <h3 className="text-2xl font-bold leading-tight text-[#faf8f5]">{p.title}</h3>
                                    {p.shortDescription && (
                                        <p className="mt-2 max-w-lg text-sm leading-relaxed text-stone-300">{p.shortDescription}</p>
                                    )}
                                    {p.technologies?.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-1.5">
                                            {p.technologies.slice(0, 6).map((t) => (
                                                <span key={t} className="rounded-md border border-stone-700/70 bg-stone-900/80 px-2.5 py-0.5 font-mono text-[11px] text-stone-300">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {(hasUrl(p.projectUrl) || hasUrl(p.githubUrl)) && (
                                        <div className="mt-5 flex flex-wrap gap-2.5">
                                            {hasUrl(p.projectUrl) && (
                                                <a
                                                    href={p.projectUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    tabIndex={isOpen ? 0 : -1}
                                                    className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-5 py-2 text-xs font-semibold text-white shadow-sm shadow-red-900/40 transition hover:bg-red-500 active:scale-95"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    Live Demo
                                                </a>
                                            )}
                                            {hasUrl(p.githubUrl) && (
                                                <a
                                                    href={p.githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    tabIndex={isOpen ? 0 : -1}
                                                    className="inline-flex items-center gap-1.5 rounded-full border border-stone-700 bg-stone-900/70 px-5 py-2 text-xs font-medium text-stone-200 transition hover:border-red-500/50 hover:text-white"
                                                >
                                                    <Github className="h-3.5 w-3.5" />
                                                    Source
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {isOpen && (
                                    <button
                                        type="button"
                                        aria-label={`Close ${p.title}`}
                                        onClick={close}
                                        className="absolute right-3.5 top-3.5 z-30 flex h-8 w-8 items-center justify-center rounded-full border border-stone-700 bg-stone-900/80 text-stone-300 transition hover:border-red-500/50 hover:text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MagneticProjects;

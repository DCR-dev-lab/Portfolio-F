/**
 * ProjectPreviewCard
 * Shared floating hover/touch-lock preview card used by both TunnelGallery and InfiniteCanvas.
 * Uses direct DOM refs for 60fps pointer tracking without triggering React re-renders.
 */
const ProjectPreviewCard = ({ cardRef, typeRef, labelRef, descRef, hintRef, className = "" }) => (
    <div
        ref={cardRef}
        aria-hidden="true"
        className={`pointer-events-none absolute top-0 left-0 z-20 w-[min(75vw,17rem)] flex flex-col gap-1 px-4 py-3 rounded-2xl bg-stone-900/95 text-cream border border-red-500/60 shadow-lg shadow-black/80 backdrop-blur-md opacity-0 transition-opacity duration-150 ${className}`}
    >
        <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse motion-reduce:animate-none shrink-0" />
            <span ref={typeRef} className="text-[10px] font-mono font-medium uppercase tracking-wider text-red-400 truncate" />
        </div>
        <span ref={labelRef} className="text-sm font-sans font-semibold leading-snug text-cream" />
        <p ref={descRef} className="text-[11px] font-sans leading-relaxed text-stone-400 line-clamp-2" />
        <span ref={hintRef} className="mt-0.5 text-[11px] font-mono text-red-300" />
    </div>
);

const setRefText = (ref, text) => {
    const node = ref?.current;
    if (!node) return;
    node.textContent = text;
    node.style.display = text ? "" : "none";
};

/** Populates the preview card DOM nodes for a hovered/locked project. */
export function updatePreviewCardText({ typeRef, labelRef, descRef, hintRef }, project, hintText = "") {
    if (!project) return;
    setRefText(labelRef, project.title || "Untitled project");
    setRefText(typeRef, project.type || "");
    setRefText(descRef, project.shortDescription || project.description || "");
    setRefText(hintRef, hintText);
}

/** Applies the flip/scale transform without overwriting mobile clamping. */
export function applyPreviewCardTransform(el, scale = 1) {
    if (!el) return;
    if (el.dataset.mobile === "1") {
        el.style.transform = `scale(${scale})`;
        return;
    }
    const flipX = el.dataset.flipX === "1";
    const flipY = el.dataset.flipY === "1";
    el.style.transform = `translate(${flipX ? "calc(-100% - 14px)" : "14px"}, ${flipY ? "20px" : "calc(-100% - 12px)"}) scale(${scale})`;
}

/** Positions the preview card relative to a container, clamping cleanly on narrow screens. */
export function positionPreviewCard(el, container, clientX, clientY, scale = 1) {
    if (!el || !container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const sx = container.clientWidth / rect.width;
    const sy = container.clientHeight / rect.height;

    if (rect.width < 640) {
        const cardW = Math.min(rect.width * 0.82, 272);
        const clampedX = Math.max(12, Math.min(rect.width - cardW - 12, (clientX - rect.left) * sx - cardW / 2));
        const clampedY = Math.min(rect.height - 195, Math.max(72, (clientY - rect.top) * sy - 130));
        el.style.left = `${clampedX}px`;
        el.style.top = `${clampedY}px`;
        el.dataset.mobile = "1";
    } else {
        el.dataset.mobile = "0";
        el.style.left = `${(clientX - rect.left) * sx}px`;
        el.style.top = `${(clientY - rect.top) * sy}px`;
        el.dataset.flipX = rect.width - (clientX - rect.left) < 300 ? "1" : "0";
        el.dataset.flipY = clientY - rect.top < 160 ? "1" : "0";
    }
    applyPreviewCardTransform(el, scale);
}

export default ProjectPreviewCard;

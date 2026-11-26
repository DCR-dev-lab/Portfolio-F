import { useState, useRef } from "react";
import {
    Upload,
    Link as LinkIcon,
    X,
    Plus,
    Loader2,
    ArrowLeft,
    ArrowRight,
    Star,
    Images,
} from "lucide-react";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CONFIGURED = Boolean(CLOUD_NAME && UPLOAD_PRESET);

/**
 * MultiImageUploadField — manage multiple gallery images for a project.
 * Supports multi-file Cloudinary upload, pasting URLs, reordering, and promoting to cover.
 */
const MultiImageUploadField = ({
    value = [],
    onChange,
    onSetAsCover,
    label = "Gallery images",
    maxImages = 15,
}) => {
    const [urlInput, setUrlInput] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState("");
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);

    const images = Array.isArray(value) ? value : [];
    const remainingSlots = Math.max(0, maxImages - images.length);

    const handleAddUrl = () => {
        const trimmed = urlInput.trim();
        if (!trimmed) return;
        setError("");

        if (
            !trimmed.startsWith("https://") &&
            !trimmed.startsWith("http://") &&
            !(trimmed.startsWith("/") && !trimmed.startsWith("//"))
        ) {
            setError("Enter a valid http://, https://, or relative / image URL.");
            return;
        }
        if (images.includes(trimmed)) {
            setError("This image is already in the gallery.");
            return;
        }
        if (remainingSlots <= 0) {
            setError(`Maximum of ${maxImages} gallery images reached.`);
            return;
        }

        onChange([...images, trimmed]);
        setUrlInput("");
    };

    const handleFilesSelected = async (e) => {
        const files = Array.from(e.target.files || []);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (!files.length) return;

        if (!CLOUDINARY_CONFIGURED) {
            setError(
                "Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file."
            );
            return;
        }

        const batch = files.slice(0, remainingSlots);
        if (batch.length < files.length) {
            setError(`Only ${remainingSlots} slot(s) remaining (max ${maxImages}).`);
        } else {
            setError("");
        }

        if (batch.length === 0) return;

        setUploading(true);
        setUploadProgress(`Uploading ${batch.length} image${batch.length > 1 ? "s" : ""}…`);

        try {
            const uploadedUrls = await Promise.all(
                batch.map(async (file) => {
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("upload_preset", UPLOAD_PRESET);

                    const res = await fetch(
                        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                        { method: "POST", body: formData }
                    );
                    if (!res.ok) throw new Error(`Failed to upload ${file.name}`);
                    const data = await res.json();
                    return data.secure_url;
                })
            );

            const merged = [...images];
            for (const url of uploadedUrls) {
                if (url && !merged.includes(url)) merged.push(url);
            }
            onChange(merged);
        } catch (err) {
            setError(err.message || "One or more uploads failed.");
        } finally {
            setUploading(false);
            setUploadProgress("");
        }
    };

    const moveImage = (idx, dir) => {
        const target = idx + dir;
        if (target < 0 || target >= images.length) return;
        const next = [...images];
        const [item] = next.splice(idx, 1);
        next.splice(target, 0, item);
        onChange(next);
    };

    const removeImage = (idx) => {
        onChange(images.filter((_, i) => i !== idx));
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-stone-400">
                    {label} <span className="text-stone-600">(optional, {images.length}/{maxImages})</span>
                </label>
            </div>

            {/* Multi-file upload + URL add row */}
            <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">
                        <LinkIcon size={14} />
                    </span>
                    <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddUrl();
                            }
                        }}
                        placeholder="Paste image URL and click Add"
                        disabled={remainingSlots === 0 || uploading}
                        className="w-full rounded-lg border border-stone-700/70 bg-stone-900 py-2 pl-9 pr-3 text-sm text-cream placeholder-stone-600 outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson disabled:opacity-50"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleAddUrl}
                    disabled={!urlInput.trim() || remainingSlots === 0 || uploading}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-stone-700/70 bg-stone-800 px-3.5 py-2 text-xs font-medium text-cream transition-colors hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Plus size={14} /> Add URL
                </button>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={remainingSlots === 0 || uploading}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-stone-700/70 bg-stone-900 px-3.5 py-2 text-xs font-medium text-stone-300 transition-colors hover:border-stone-600 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {uploading ? (
                        <Loader2 size={14} className="animate-spin motion-reduce:animate-none" />
                    ) : (
                        <Upload size={14} />
                    )}
                    {uploading ? uploadProgress : "Upload files"}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFilesSelected}
                />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            {/* Gallery preview grid */}
            {images.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {images.map((url, idx) => (
                        <div
                            key={`${url}-${idx}`}
                            className="group relative flex flex-col overflow-hidden rounded-lg border border-stone-800 bg-stone-950"
                        >
                            <div className="aspect-video w-full overflow-hidden bg-stone-900">
                                <img
                                    src={url}
                                    alt={`Gallery ${idx + 1}`}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="flex items-center justify-between gap-1 border-t border-stone-800/80 px-2 py-1.5">
                                <div className="flex items-center gap-0.5">
                                    <button
                                        type="button"
                                        disabled={idx === 0}
                                        onClick={() => moveImage(idx, -1)}
                                        aria-label="Move image left"
                                        className="rounded p-1 text-stone-400 transition-colors hover:bg-stone-800 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson disabled:opacity-30"
                                    >
                                        <ArrowLeft size={12} />
                                    </button>
                                    <button
                                        type="button"
                                        disabled={idx === images.length - 1}
                                        onClick={() => moveImage(idx, 1)}
                                        aria-label="Move image right"
                                        className="rounded p-1 text-stone-400 transition-colors hover:bg-stone-800 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson disabled:opacity-30"
                                    >
                                        <ArrowRight size={12} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    {onSetAsCover && (
                                        <button
                                            type="button"
                                            onClick={() => onSetAsCover(url)}
                                            title="Set as cover image"
                                            aria-label="Set as cover image"
                                            className="rounded p-1 text-stone-400 transition-colors hover:bg-stone-800 hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                                        >
                                            <Star size={12} />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        aria-label="Remove gallery image"
                                        className="rounded p-1 text-stone-400 transition-colors hover:bg-red-950/50 hover:text-red-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-stone-800 px-3.5 py-3 text-xs text-stone-500">
                    <Images size={14} className="shrink-0 text-stone-600" />
                    <span>No gallery screenshots added yet. Add URLs or select multiple files above.</span>
                </div>
            )}
        </div>
    );
};

export default MultiImageUploadField;

import { useState, useRef } from "react";
import {
  Upload,
  Link as LinkIcon,
  X,
  Image,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { sanitizeImageUrl } from "../../utils/security";

/**
 * ImageUploadField — dual-mode image input.
 * Mode 1: paste a URL directly
 * Mode 2: upload a file to Cloudinary (unsigned upload)
 *
 * To activate Cloudinary upload, set these two env vars in your .env:
 *   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *   VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset_name
 *
 * Props:
 *   value       {string}   Current image URL value
 *   onChange    {function} Called with the new URL string
 *   label       {string}   Field label
 *   required    {boolean}
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CONFIGURED = Boolean(CLOUD_NAME && UPLOAD_PRESET);

const ImageUploadField = ({
  value,
  onChange,
  label = "Image",
  required = false,
}) => {
  const [mode, setMode] = useState("url"); // "url" | "upload"
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!CLOUDINARY_CONFIGURED) {
      setUploadError(
        "Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file.",
      );
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadError(
        "Only image files (PNG, JPG, WebP, SVG, GIF) are supported.",
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image size must be less than 10MB.");
      return;
    }

    setUploading(true);
    setUploadError("");
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );

      if (!res.ok)
        throw new Error("Upload failed. Check your Cloudinary credentials.");
      const data = await res.json();

      onChange(data.secure_url);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      setUploadError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {/* Label + mode toggle */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-stone-400">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        <div className="flex rounded-md border border-stone-700/60 text-xs">
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`flex items-center gap-1.5 rounded-l-md px-2.5 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson ${
              mode === "url"
                ? "bg-stone-700 text-cream"
                : "text-stone-500 hover:text-stone-300"
            }`}
          >
            <LinkIcon size={11} /> URL
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex items-center gap-1.5 rounded-r-md px-2.5 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson ${
              mode === "upload"
                ? "bg-stone-700 text-cream"
                : "text-stone-500 hover:text-stone-300"
            }`}
          >
            <Upload size={11} /> Upload
          </button>
        </div>
      </div>

      {/* URL mode */}
      {mode === "url" && (
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">
            <LinkIcon size={14} />
          </span>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            required={required}
            className="w-full rounded-lg border border-stone-700/70 bg-stone-900 py-2.5 pl-9 pr-3.5 text-sm text-cream placeholder-stone-600 outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
          />
        </div>
      )}

      {/* Upload mode */}
      {mode === "upload" && (
        <div>
          {!CLOUDINARY_CONFIGURED && (
            <div className="mb-2 rounded-lg border border-amber-800/50 bg-amber-950/30 px-3 py-2 text-xs text-amber-400">
              Set <code className="font-mono">VITE_CLOUDINARY_CLOUD_NAME</code> and{" "}
              <code className="font-mono">VITE_CLOUDINARY_UPLOAD_PRESET</code> in
              your <code className="font-mono">.env</code> to enable uploads.
            </div>
          )}

          {/* Drop zone */}
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
              uploading
                ? "border-stone-700 opacity-70"
                : "border-stone-700/60 hover:border-stone-600 hover:bg-stone-900/60"
            }`}
          >
            {uploading ? (
              <>
                <Loader2
                  size={22}
                  className="animate-spin motion-reduce:animate-none text-stone-500"
                />
                <p className="text-xs text-stone-500">
                  Uploading to Cloudinary…
                </p>
              </>
            ) : uploadSuccess ? (
              <>
                <CheckCircle2 size={22} className="text-emerald-400" />
                <p className="text-xs text-emerald-400">
                  Uploaded successfully!
                </p>
              </>
            ) : (
              <>
                <Image size={22} className="text-stone-500" />
                <p className="text-xs text-stone-400">
                  Click to select an image file
                </p>
                <p className="text-xs text-stone-600">
                  PNG, JPG, WEBP, GIF · max 10 MB
                </p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Error */}
      {uploadError && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <X size={12} /> {uploadError}
        </p>
      )}

      {/* Preview */}
      {sanitizeImageUrl(value) && (
        <div className="flex items-center gap-2 rounded-lg border border-stone-800/60 bg-stone-900/40 p-2">
          <img
            src={sanitizeImageUrl(value)}
            alt="Preview"
            className="h-10 w-16 rounded object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <p className="flex-1 truncate text-xs text-stone-500">{value}</p>
          <button
            type="button"
            onClick={() => onChange("")}
            className="shrink-0 text-stone-600 hover:text-red-400"
            aria-label="Clear image"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploadField;

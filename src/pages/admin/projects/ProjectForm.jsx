import { useState, useMemo } from "react";
import api from "../../../services/api";
import MDEditor from "@uiw/react-md-editor";
import ImageUploadField from "../../../components/ui/ImageUploadField";
import MultiImageUploadField from "../../../components/ui/MultiImageUploadField";
import { SAFE_MD_PREVIEW_OPTIONS } from "../../../utils/security";
import { useUnsavedChanges } from "../../../context/UnsavedChangesContext";
import { FieldLabel, DarkInput, DarkSelect, Section } from "../../../components/ui/FormPrimitives";
import { toast } from "sonner";
import {
    Save,
    X,
    AlertCircle,
    Link as LinkIcon,
    Github,
    FileText,
    Hash,
    Layers,
    Star,
    Eye,
    EyeOff,
} from "lucide-react";

const CATEGORY_OPTIONS = ["", "Frontend", "Backend", "Full Stack", "Mobile", "Design", "DevOps", "Other"];
const STATUS_OPTIONS = ["", "Live", "In Progress", "Archived", "Private"];
const TYPE_OPTIONS = ["", "Personal", "Client", "Open Source", "Academic", "Side Project"];

const ProjectForm = ({ project, onSuccess, onCancel }) => {
    const isEdit = Boolean(project?._id);

    const initialSnapshot = useMemo(
        () => ({
            title: project?.title || "",
            shortDescription: project?.shortDescription || "",
            longDescription: project?.longDescription || "",
            imageUrl: project?.imageUrl || "",
            images: Array.isArray(project?.images) ? project.images : [],
            projectUrl: project?.projectUrl || "",
            technologies: Array.isArray(project?.technologies) ? project.technologies.join(", ") : "",
            githubUrl: project?.githubUrl || "",
            category: project?.category || "",
            status: project?.status || "",
            type: project?.type || "",
            featured: Boolean(project?.featured),
            order: String(project?.order ?? 0),
            isPublished: project?.isPublished ?? true,
        }),
        [project]
    );

    const [title, setTitle] = useState(initialSnapshot.title);
    const [shortDescription, setShortDescription] = useState(initialSnapshot.shortDescription);
    const [longDescription, setLongDescription] = useState(initialSnapshot.longDescription);
    const [imageUrl, setImageUrl] = useState(initialSnapshot.imageUrl);
    const [images, setImages] = useState(initialSnapshot.images);
    const [projectUrl, setProjectUrl] = useState(initialSnapshot.projectUrl);
    const [technologies, setTechnologies] = useState(initialSnapshot.technologies);
    const [githubUrl, setGithubUrl] = useState(initialSnapshot.githubUrl);
    const [category, setCategory] = useState(initialSnapshot.category);
    const [status, setStatus] = useState(initialSnapshot.status);
    const [type, setType] = useState(initialSnapshot.type);
    const [featured, setFeatured] = useState(initialSnapshot.featured);
    const [order, setOrder] = useState(initialSnapshot.order);
    const [isPublished, setIsPublished] = useState(initialSnapshot.isPublished);
    const [disabled, setDisabled] = useState(false);
    const [error, setError] = useState("");

    const isDirty = useMemo(
        () =>
            title !== initialSnapshot.title ||
            shortDescription !== initialSnapshot.shortDescription ||
            longDescription !== initialSnapshot.longDescription ||
            imageUrl !== initialSnapshot.imageUrl ||
            JSON.stringify(images) !== JSON.stringify(initialSnapshot.images) ||
            projectUrl !== initialSnapshot.projectUrl ||
            technologies !== initialSnapshot.technologies ||
            githubUrl !== initialSnapshot.githubUrl ||
            category !== initialSnapshot.category ||
            status !== initialSnapshot.status ||
            type !== initialSnapshot.type ||
            featured !== initialSnapshot.featured ||
            String(order) !== initialSnapshot.order ||
            isPublished !== initialSnapshot.isPublished,
        [
            title, shortDescription, longDescription, imageUrl, images, projectUrl,
            technologies, githubUrl, category, status, type, featured, order, isPublished, initialSnapshot,
        ]
    );

    const { confirmNavigation } = useUnsavedChanges(isDirty);

    const submit = async (e) => {
        e.preventDefault();
        setDisabled(true);
        setError("");

        const parsedOrder = Number(order);
        const payload = {
            title,
            shortDescription,
            longDescription,
            imageUrl,
            images,
            projectUrl,
            technologies: technologies.split(",").map((tech) => tech.trim()).filter(Boolean),
            githubUrl,
            category: category || undefined,
            status: status || undefined,
            type: type || undefined,
            featured,
            order: Number.isFinite(parsedOrder) ? parsedOrder : 0,
            isPublished,
        };

        try {
            if (isEdit) {
                await api.put(`/admin/dashboard/projects/${project._id}`, payload);
            } else {
                await api.post("/admin/dashboard/projects", payload);
            }
            toast.success(isEdit ? "Project updated successfully." : "Project created successfully.");
            onSuccess();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                (isEdit ? "Failed to update project." : "Failed to add project.")
            );
        } finally {
            setDisabled(false);
        }
    };

    return (
        <form onSubmit={submit}>
            {/* Page header */}
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-cream">
                        {isEdit ? "Edit Project" : "Add Project"}
                    </h1>
                    <p className="mt-1.5 text-sm text-stone-400">
                        {isEdit
                            ? "Update the content shown for this project."
                            : "Create a new project entry for the portfolio."}
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    {error}
                </div>
            )}

            <div className="space-y-5">
                {/* Core Details */}
                <Section title="Core Details">
                    <div>
                        <FieldLabel>Project Title</FieldLabel>
                        <DarkInput icon={Layers} placeholder="e.g. SaaS Dashboard" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div>
                        <FieldLabel>Short Description <span className="normal-case text-stone-600">(shown on cards)</span></FieldLabel>
                        <DarkInput icon={FileText} placeholder="A short summary shown on cards" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required />
                    </div>
                    <div>
                        <FieldLabel>Long Description</FieldLabel>
                        <div data-color-mode="dark">
                            <MDEditor
                                value={longDescription}
                                onChange={(val) => setLongDescription(val || "")}
                                height={220}
                                preview="edit"
                                previewOptions={SAFE_MD_PREVIEW_OPTIONS}
                                className="!border-stone-700/70 !bg-stone-900"
                            />
                        </div>
                    </div>
                    <div>
                        <FieldLabel>Technologies <span className="normal-case text-stone-600">(comma-separated)</span></FieldLabel>
                        <DarkInput icon={Hash} placeholder="React, Node.js, MongoDB" value={technologies} onChange={(e) => setTechnologies(e.target.value)} required />
                    </div>
                </Section>

                {/* Links & Media */}
                <Section title="Links & Media">
                    <ImageUploadField
                        label="Cover Image"
                        value={imageUrl}
                        onChange={setImageUrl}
                        required
                    />
                    <MultiImageUploadField
                        label="Project Gallery"
                        value={images}
                        onChange={setImages}
                        onSetAsCover={(url) => {
                            if (imageUrl && imageUrl !== url && !images.includes(imageUrl)) {
                                setImages((prev) => [...prev.filter((i) => i !== url), imageUrl]);
                            } else {
                                setImages((prev) => prev.filter((i) => i !== url));
                            }
                            setImageUrl(url);
                            toast.success("Cover image updated.");
                        }}
                    />
                    <div>
                        <FieldLabel>Live Project URL</FieldLabel>
                        <DarkInput icon={LinkIcon} placeholder="https://example.com" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} required />
                    </div>
                    <div>
                        <FieldLabel>GitHub URL <span className="normal-case text-stone-600">(optional)</span></FieldLabel>
                        <DarkInput icon={Github} placeholder="https://github.com/username/repository" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
                    </div>
                </Section>

                {/* Classification */}
                <Section title="Classification">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <FieldLabel>Category</FieldLabel>
                            <DarkSelect value={category} onChange={(e) => setCategory(e.target.value)}>
                                {CATEGORY_OPTIONS.map((o) => (
                                    <option key={o} value={o}>{o || "Select category"}</option>
                                ))}
                            </DarkSelect>
                        </div>
                        <div>
                            <FieldLabel>Status</FieldLabel>
                            <DarkSelect value={status} onChange={(e) => setStatus(e.target.value)}>
                                {STATUS_OPTIONS.map((o) => (
                                    <option key={o} value={o}>{o || "Select status"}</option>
                                ))}
                            </DarkSelect>
                        </div>
                        <div>
                            <FieldLabel>Type</FieldLabel>
                            <DarkSelect value={type} onChange={(e) => setType(e.target.value)}>
                                {TYPE_OPTIONS.map((o) => (
                                    <option key={o} value={o}>{o || "Select type"}</option>
                                ))}
                            </DarkSelect>
                        </div>
                    </div>
                </Section>

                {/* Hierarchy & Display */}
                <Section title="Hierarchy & Display">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <FieldLabel>Display order <span className="text-stone-600">(1 = first, 0 = auto)</span></FieldLabel>
                            <DarkInput
                                icon={Hash}
                                type="number"
                                min={0}
                                placeholder="0"
                                value={order}
                                onChange={(e) => setOrder(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col justify-end">
                            <button
                                type="button"
                                role="switch"
                                aria-checked={featured}
                                onClick={() => setFeatured((prev) => !prev)}
                                className={`flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80 ${
                                    featured
                                        ? "border-amber-600/60 bg-amber-950/30 text-amber-300"
                                        : "border-stone-700/70 bg-stone-900 text-stone-400 hover:border-stone-600 hover:text-cream"
                                }`}
                            >
                                <span className="flex items-center gap-2 font-medium">
                                    <Star size={15} className={featured ? "fill-amber-400 text-amber-400" : "text-stone-500"} />
                                    Featured
                                </span>
                                <span className={`text-xs font-semibold ${featured ? "text-amber-300" : "text-stone-500"}`}>
                                    {featured ? "Pinned" : "Standard"}
                                </span>
                            </button>
                        </div>
                        <div className="flex flex-col justify-end">
                            <button
                                type="button"
                                role="switch"
                                aria-checked={isPublished}
                                onClick={() => setIsPublished((prev) => !prev)}
                                className={`flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80 ${
                                    isPublished
                                        ? "border-emerald-700/60 bg-emerald-950/30 text-emerald-300"
                                        : "border-stone-700/70 bg-stone-900 text-stone-400 hover:border-stone-600 hover:text-cream"
                                }`}
                            >
                                <span className="flex items-center gap-2 font-medium">
                                    {isPublished ? <Eye size={15} /> : <EyeOff size={15} className="text-stone-500" />}
                                    Visibility
                                </span>
                                <span className={`text-xs font-semibold ${isPublished ? "text-emerald-300" : "text-stone-400"}`}>
                                    {isPublished ? "Published" : "Draft"}
                                </span>
                            </button>
                        </div>
                    </div>
                </Section>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-1">
                    <button
                        disabled={disabled}
                        className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] duration-200 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson ${
                            disabled
                                ? "cursor-not-allowed bg-crimson/40"
                                : "bg-crimson hover:bg-red-700 active:scale-[0.98] motion-reduce:active:scale-100"
                        }`}
                    >
                        <Save size={15} />
                        {disabled ? "Saving…" : isEdit ? "Save Changes" : "Save Project"}
                    </button>
                    <button
                        type="button"
                        onClick={() => confirmNavigation(onCancel)}
                        className="flex items-center gap-2 rounded-lg border border-stone-700/70 px-5 py-2.5 text-sm font-medium text-stone-400 transition-colors hover:border-stone-600 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80"
                    >
                        <X size={14} />
                        Cancel
                    </button>
                </div>
            </div>
        </form>
    );
};

export default ProjectForm;

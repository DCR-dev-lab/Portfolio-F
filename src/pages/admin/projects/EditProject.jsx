import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import ProjectForm from "./ProjectForm";
import usePageSEO from "../../../hooks/usePageSEO";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";

const EditProject = () => {
    usePageSEO({
        title: "Edit Project | Mod Studio",
        description: "Edit portfolio project details.",
        noindex: true,
    });

    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/admin/dashboard/projects/${id}`);
                setProject(res.data);
            } catch (err) {
                setError(err.response?.data?.message || "Project could not be found.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProject();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-stone-500">
                <Loader2 size={28} className="animate-spin motion-reduce:animate-none text-crimson" />
                <p className="text-sm">Loading project details…</p>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-8 text-center">
                <AlertCircle size={32} className="mx-auto mb-3 text-red-400" />
                <h2 className="text-lg font-semibold text-cream">Failed to Load Project</h2>
                <p className="mt-1 text-sm text-stone-400">{error || "Project record not found."}</p>
                <button
                    onClick={() => navigate("/mod/projects")}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-stone-800 px-4 py-2 text-sm text-cream transition-colors hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80"
                >
                    <ArrowLeft size={14} /> Back to Projects
                </button>
            </div>
        );
    }

    return (
        <ProjectForm
            project={project}
            onSuccess={() => navigate("/mod/projects")}
            onCancel={() => navigate("/mod/projects")}
        />
    );
};

export default EditProject;

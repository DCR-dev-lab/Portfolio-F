import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import SkillForm from "./SkillForm";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";

const EditSkill = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [skill, setSkill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSkill = async () => {
            try {
                setLoading(true);
                const res = await api.get("/admin/dashboard/skills");
                const found = res.data.find((s) => s._id === id);
                if (!found) {
                    setError("Skill record not found.");
                } else {
                    setSkill(found);
                }
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load skill details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchSkill();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-stone-500">
                <Loader2 size={28} className="animate-spin motion-reduce:animate-none text-crimson" />
                <p className="text-sm">Loading skill details…</p>
            </div>
        );
    }

    if (error || !skill) {
        return (
            <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-8 text-center">
                <AlertCircle size={32} className="mx-auto mb-3 text-red-400" />
                <h2 className="text-lg font-semibold text-cream">Failed to Load Skill</h2>
                <p className="mt-1 text-sm text-stone-400">{error || "Skill record not found."}</p>
                <button
                    onClick={() => navigate("/mod/skills")}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-stone-800 px-4 py-2 text-sm text-cream transition-colors hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80"
                >
                    <ArrowLeft size={14} /> Back to Skills
                </button>
            </div>
        );
    }

    return (
        <SkillForm
            skill={skill}
            onSuccess={() => navigate("/mod/skills")}
            onCancel={() => navigate("/mod/skills")}
        />
    );
};

export default EditSkill;

import { useEffect, useState } from "react";
import api from "../../../services/api";
import ProjectList from "./ProjectList";
import { Loader2 } from "lucide-react";

const ManageProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        try {
            const res = await api.get("/admin/dashboard/projects");
            setProjects(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-stone-500">
                <Loader2 size={28} className="animate-spin motion-reduce:animate-none text-crimson" />
                <p className="text-sm">Loading projects…</p>
            </div>
        );
    }

    return (
        <div>
            <ProjectList
                projects={projects}
                onProjectsChange={setProjects}
                onDelete={fetchProjects}
                onRefresh={fetchProjects}
            />
        </div>
    );
};

export default ManageProjects;

import { useEffect, useState } from "react";
import api from "../../../services/api";
import SkillList from "./SkillList";
import usePageSEO from "../../../hooks/usePageSEO";
import { Loader2 } from "lucide-react";

const ManageSkills = () => {
    usePageSEO({
        title: "Skills | Mod Studio",
        description: "Manage portfolio skills.",
        noindex: true,
    });

    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSkills = async () => {
        try {
            const res = await api.get("/admin/dashboard/skills");
            setSkills(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-stone-500">
                <Loader2 size={28} className="animate-spin motion-reduce:animate-none text-crimson" />
                <p className="text-sm">Loading skills…</p>
            </div>
        );
    }

    return (
        <div>
            <SkillList
                skills={skills}
                onDelete={fetchSkills}
            />
        </div>
    );
};

export default ManageSkills;

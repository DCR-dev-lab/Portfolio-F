import { useEffect, useState } from "react";
import api from "../../../services/api";

import SkillList from "./SkillList";
import AddSkill from "./AddSkill";
import EditSkill from "./EditSkill";

const ManageSkills = () => {
    const [skills, setSkills] = useState([]);
    const [mode, setMode] = useState("list"); // list | add | edit
    const [selectedSkill, setSelectedSkill] = useState(null);
    const fetchSkills = async () => {
        const res = await api.get("/admin/dashboard/skills");
        setSkills(res.data);
    }
    useEffect(() => {
        fetchSkills();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            {mode === "list" && (
                <SkillList
                    skills={skills}
                    onAdd={() => setMode("add")}
                    onEdit={(skill) => {    
                        setSelectedSkill(skill);
                        setMode("edit");
                    }
                    }
                    onDelete={fetchSkills}
                />
            )}  
            {mode === "add" && (
                <AddSkill
                    onSuccess={() => {
                        fetchSkills();
                        setMode("list");
                    }}
                    onCancel={() => setMode("list")}
                />
            )}
            {mode === "edit" && (
                <EditSkill
                    skill={selectedSkill}
                    onSuccess={() => {  
                        fetchSkills();
                        setMode("list");
                    }}
                    onCancel={() => setMode("list")}
                />
            )}
        </div>
    );
}
export default ManageSkills;
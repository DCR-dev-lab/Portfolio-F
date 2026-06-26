import { useEffect, useState } from "react";
import api from "../../../services/api";

import ProjectList from "./ProjectList";
import AddProject from "./AddProject";
import EditProject from "./EditProject";

const ManageProjects = () => {
    const [projects, setProjects] = useState([]);
    const [mode, setMode] = useState("list"); // list | add | edit
    const [selectedProject, setSelectedProject] = useState(null);

    const fetchProjects = async () => {
        const res = await api.get("/admin/dashboard/projects");
        setProjects(res.data);
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            {mode === "list" && (
                <ProjectList
                    projects={projects}
                    onAdd={() => setMode("add")}
                    onEdit={(project) => {
                        setSelectedProject(project);
                        setMode("edit");
                    }}
                    onDelete={fetchProjects}
                />
            )}

            {mode === "add" && (
                <AddProject
                    onSuccess={() => {
                        fetchProjects();
                        setMode("list");
                    }}
                    onCancel={() => setMode("list")}
                />
            )}

            {mode === "edit" && (
                <EditProject
                    project={selectedProject}
                    onSuccess={() => {
                        fetchProjects();
                        setMode("list");
                    }}
                    onCancel={() => setMode("list")}
                />
            )}
        </div>
    );
};

export default ManageProjects;

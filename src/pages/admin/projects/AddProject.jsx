import { useNavigate } from "react-router-dom";
import ProjectForm from "./ProjectForm";
import usePageSEO from "../../../hooks/usePageSEO";

const AddProject = () => {
    usePageSEO({
        title: "Add Project | Mod Studio",
        description: "Create a new portfolio project.",
        noindex: true,
    });

    const navigate = useNavigate();

    return (
        <ProjectForm
            onSuccess={() => navigate("/mod/projects")}
            onCancel={() => navigate("/mod/projects")}
        />
    );
};

export default AddProject;

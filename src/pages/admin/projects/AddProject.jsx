import { useNavigate } from "react-router-dom";
import ProjectForm from "./ProjectForm";

const AddProject = () => {
    const navigate = useNavigate();

    return (
        <ProjectForm
            onSuccess={() => navigate("/mod/projects")}
            onCancel={() => navigate("/mod/projects")}
        />
    );
};

export default AddProject;

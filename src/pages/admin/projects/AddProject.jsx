import ProjectForm from "./ProjectForm";

const AddProject = ({ onSuccess, onCancel }) => {
    return <ProjectForm onSuccess={onSuccess} onCancel={onCancel} />;
};

export default AddProject;

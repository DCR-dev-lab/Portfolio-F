import ProjectForm from "./ProjectForm";

const EditProject = ({ project, onSuccess, onCancel }) => {
    return <ProjectForm project={project} onSuccess={onSuccess} onCancel={onCancel} />;
};

export default EditProject;

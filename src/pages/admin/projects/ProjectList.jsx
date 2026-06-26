import api from "../../../services/api";
import ProjectCard from "../../../components/cards/ProjectCard";

const ProjectList = ({ projects, onAdd, onEdit, onDelete }) => {
    const onProjectDelete = async (p) => {
        await api.delete(`/admin/dashboard/projects/${p._id}`);
        onDelete();
    };

    return (
        <>
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                    <p className="mt-1 text-gray-600">
                        Manage the projects shown on the portfolio pages.
                    </p>
                </div>
                <button
                    onClick={onAdd}
                    className="cursor-pointer rounded bg-blue-500 px-4 py-2 font-medium text-white transition hover:bg-blue-600"
                >
                    Add Project
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="rounded bg-white p-8 text-center shadow">
                    <p className="text-lg font-semibold text-gray-900">No projects yet</p>
                    <p className="mt-1 text-gray-600">Add your first project to populate the portfolio.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {projects.map((p, i) => (
                        <ProjectCard
                            key={p._id}
                            project={p}
                            isAdmin
                            onEdit={onEdit}
                            onDelete={() => onProjectDelete(p)}
                            index={i}
                        />
                    ))}
                </div>
            )}
        </>
    );
};

export default ProjectList;

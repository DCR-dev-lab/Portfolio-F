import api from "../../../services/api";
import { SkillCard } from "../../../components/cards/SkillCard";

const SkillList = ({ skills, onAdd, onEdit, onDelete }) => {
    const onSkillDelete = async (s) => {
        await api.delete(`/admin/dashboard/skills/${s._id}`);
        onDelete();
    };

    return (
        <>
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Skills</h1>
                    <p className="mt-1 text-gray-600">
                        Maintain the skills and categories displayed across the portfolio.
                    </p>
                </div>
                <button
                    onClick={onAdd}
                    className="cursor-pointer rounded bg-blue-500 px-4 py-2 font-medium text-white transition hover:bg-blue-600"
                >
                    Add Skill
                </button>
            </div>

            {skills.length === 0 ? (
                <div className="rounded bg-white p-8 text-center shadow">
                    <p className="text-lg font-semibold text-gray-900">No skills yet</p>
                    <p className="mt-1 text-gray-600">Add your first skill to populate the portfolio.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {skills.map((skill) => (
                        <SkillCard
                            key={skill._id}
                            skill={skill}
                            isAdmin
                            onEdit={onEdit}
                            onDelete={() => onSkillDelete(skill)}
                        />
                    ))}
                </div>
            )}

        </>
    );
};
export default SkillList;

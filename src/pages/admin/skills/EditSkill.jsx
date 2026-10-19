import SkillForm from "./SkillForm";

const EditSkill = ({ skill, onSuccess, onCancel }) => {
    return <SkillForm skill={skill} onSuccess={onSuccess} onCancel={onCancel} />;
};

export default EditSkill;

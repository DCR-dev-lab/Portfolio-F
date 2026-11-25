import { useNavigate } from "react-router-dom";
import SkillForm from "./SkillForm";

const AddSkill = () => {
    const navigate = useNavigate();

    return (
        <SkillForm
            onSuccess={() => navigate("/mod/skills")}
            onCancel={() => navigate("/mod/skills")}
        />
    );
};

export default AddSkill;

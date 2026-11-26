import { useNavigate } from "react-router-dom";
import SkillForm from "./SkillForm";
import usePageSEO from "../../../hooks/usePageSEO";

const AddSkill = () => {
    usePageSEO({
        title: "Add Skill | Mod Studio",
        description: "Create a new portfolio skill.",
        noindex: true,
    });

    const navigate = useNavigate();

    return (
        <SkillForm
            onSuccess={() => navigate("/mod/skills")}
            onCancel={() => navigate("/mod/skills")}
        />
    );
};

export default AddSkill;

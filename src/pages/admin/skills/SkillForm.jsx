import { useState, useMemo } from "react";
import api from "../../../services/api";
import Input from "../../../components/ui/Input";

const CATEGORY_OPTIONS = ["Frontend", "Backend", "DevOps", "Database"];

const SkillForm = ({ skill, onSuccess, onCancel }) => {
    const isEdit = Boolean(skill?._id);

    const initialData = useMemo(() => {
        if (!skill) return { category: "", customCategory: "" };
        const isCustom = skill.category && !CATEGORY_OPTIONS.includes(skill.category);
        return {
            category: isCustom ? "Other" : (skill.category || ""),
            customCategory: isCustom ? skill.category : ""
        };
    }, [skill]);

    const [name, setName] = useState(skill?.name || "");
    const [proficiency, setProficiency] = useState(skill?.proficiency ?? "");
    const [category, setCategory] = useState(initialData.category);
    const [customCategory, setCustomCategory] = useState(initialData.customCategory);
    const [iconKeyword, setIconKeyword] = useState(skill?.iconKeyword || "");
    const [disabled, setDisabled] = useState(false);
    const [error, setError] = useState(null);

    const submit = async (e) => {
        e.preventDefault();
        setDisabled(true);
        setError(null);

        const finalCategory = category === "Other" ? customCategory : category;
        const parsedProficiency = Number(proficiency);

        if (!Number.isFinite(parsedProficiency) || parsedProficiency < 0 || parsedProficiency > 100) {
            setError("Proficiency must be a number between 0 and 100.");
            setDisabled(false);
            return;
        }

        const payload = {
            name,
            proficiency: parsedProficiency,
            category: finalCategory,
            iconKeyword
        };

        try {
            if (isEdit) {
                await api.put(`/admin/dashboard/skills/${skill._id}`, payload);
            } else {
                await api.post("/admin/dashboard/skills", payload);
            }
            onSuccess();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                (isEdit ? "Failed to update skill." : "Failed to add skill.")
            );
        } finally {
            setDisabled(false);
        }
    };

    return (
        <form onSubmit={submit} className="rounded bg-white p-6 shadow">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {isEdit ? "Edit Skill" : "Add Skill"}
                </h2>
                <p className="mt-1 text-gray-600">
                    {isEdit
                        ? "Update the content shown for this skill."
                        : "Create a new skill entry for the portfolio."}
                </p>
            </div>

            <Input
                label="Skill Name"
                name="skillName"
                placeholder="e.g. React"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />

            <Input
                label="Proficiency"
                name="proficiency"
                placeholder="0 - 100"
                value={proficiency}
                onChange={(e) => setProficiency(e.target.value)}
                required
            />

            <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
            <select
                className="mb-4 w-full rounded border px-3 py-2 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
            >
                <option value="" disabled>Select Category</option>
                {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="Other">Other</option>
            </select>

            {category === "Other" && (
                <div className="mb-4">
                    <Input
                        label="Specify Custom Category"
                        name="customCategory"
                        placeholder="Enter category name"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        required
                    />
                </div>
            )}

            <Input
                label="Icon Keyword"
                name="iconKeyword"
                placeholder="e.g. Code2, Sparkles, Database, Server"
                value={iconKeyword}
                onChange={(e) => setIconKeyword(e.target.value)}
            />

            {error && (
                <div className="mb-4 rounded border border-red-200 bg-red-100 p-3 text-red-700">
                    {error}
                </div>
            )}

            <div className="flex gap-3">
                <button
                    disabled={disabled}
                    className={`rounded px-4 py-2 font-medium text-white ${
                        disabled ? "cursor-not-allowed bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
                    }`}
                >
                    {disabled ? "Saving..." : isEdit ? "Save Changes" : "Save Skill"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded bg-gray-200 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-300"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default SkillForm;

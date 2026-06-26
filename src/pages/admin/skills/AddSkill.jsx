import { useState } from "react";
import api from "../../../services/api";
import Input from "../../../components/ui/Input";

const AddSkill = ({ onSuccess, onCancel }) => {
    const [name, setName] = useState("");
    const [proficiency, setProficiency] = useState("");
    const [category, setCategory] = useState("");
    const [iconKeyword, setIconKeyword] = useState("");
    const [customCategory, setCustomCategory] = useState("");
    const [disabled, setDisabled] = useState(false);
    const [error, setError] = useState(null);

    const submit = async (e) => {
        e.preventDefault();
        setDisabled(true);
        setError(null);

        // Determine which category value to send
        const finalCategory = category === "Other" ? customCategory : category;

        const parsedProficiency = Number(proficiency);

        if (!Number.isFinite(parsedProficiency) || parsedProficiency < 0 || parsedProficiency > 100) {
            setError("Proficiency must be a number between 0 and 100.");
            setDisabled(false);
            return;
        }

        try {
            await api.post("/admin/dashboard/skills", {
                name,
                proficiency: parsedProficiency,
                category: finalCategory,
                iconKeyword
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred");
        } finally {
            setDisabled(false);
        }
    };

    return (
        <form onSubmit={submit} className="rounded bg-white p-6 shadow">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Skill</h2>
                <p className="mt-1 text-gray-600">Create a new skill entry for the portfolio.</p>
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
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="DevOps">DevOps</option>
                <option value="Database">Database</option>
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
                    className={`rounded px-4 py-2 font-medium text-white ${disabled ? 'cursor-not-allowed bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'}`}
                >
                    {disabled ? "Saving..." : "Save Skill"}
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

export default AddSkill;

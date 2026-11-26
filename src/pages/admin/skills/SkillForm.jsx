import { useState, useMemo } from "react";
import api from "../../../services/api";
import { toast } from "sonner";
import { useUnsavedChanges } from "../../../context/UnsavedChangesContext";
import { FieldLabel, DarkInput, DarkSelect, Section } from "../../../components/ui/FormPrimitives";
import {
    Save,
    X,
    AlertCircle,
    Hash,
    Tag,
    Layers,
    Sparkles,
} from "lucide-react";

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

    const initialName = skill?.name || "";
    const initialProficiency = String(skill?.proficiency ?? "");
    const initialIconKeyword = skill?.iconKeyword || "";

    const [name, setName] = useState(initialName);
    const [proficiency, setProficiency] = useState(initialProficiency);
    const [category, setCategory] = useState(initialData.category);
    const [customCategory, setCustomCategory] = useState(initialData.customCategory);
    const [iconKeyword, setIconKeyword] = useState(initialIconKeyword);
    const [disabled, setDisabled] = useState(false);
    const [error, setError] = useState(null);

    const isDirty = useMemo(
        () =>
            name !== initialName ||
            String(proficiency) !== initialProficiency ||
            category !== initialData.category ||
            customCategory !== initialData.customCategory ||
            iconKeyword !== initialIconKeyword,
        [name, proficiency, category, customCategory, iconKeyword, initialName, initialProficiency, initialData, initialIconKeyword]
    );

    const { confirmNavigation } = useUnsavedChanges(isDirty);

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
            toast.success(isEdit ? "Skill updated successfully." : "Skill created successfully.");
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
        <form onSubmit={submit}>
            {/* Page header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-cream">
                    {isEdit ? "Edit Skill" : "Add Skill"}
                </h1>
                <p className="mt-1.5 text-sm text-stone-400">
                    {isEdit
                        ? "Update the content shown for this skill."
                        : "Create a new skill entry for the portfolio."}
                </p>
            </div>

            {error && (
                <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    {error}
                </div>
            )}

            <div className="space-y-5">
                {/* Skill Details */}
                <Section title="Skill Details">
                    <div>
                        <FieldLabel>Skill Name</FieldLabel>
                        <DarkInput icon={Layers} placeholder="e.g. React" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    <div>
                        <FieldLabel>Proficiency <span className="text-stone-600">(0 to 100)</span></FieldLabel>
                        <div className="space-y-2">
                            <DarkInput icon={Hash} type="number" min={0} max={100} placeholder="0 to 100" value={proficiency} onChange={(e) => setProficiency(e.target.value)} required />
                            {/* Visual bar */}
                            {proficiency !== "" && (
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-800">
                                    <div
                                        className="h-full w-full origin-left rounded-full bg-crimson transition-transform duration-300 motion-reduce:transition-none"
                                        style={{ transform: `scaleX(${Math.min(100, Math.max(0, Number(proficiency))) / 100})` }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <FieldLabel>Category</FieldLabel>
                        <DarkSelect value={category} onChange={(e) => setCategory(e.target.value)} required>
                            <option value="" disabled>Select Category</option>
                            {CATEGORY_OPTIONS.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                            <option value="Other">Other…</option>
                        </DarkSelect>
                    </div>

                    {category === "Other" && (
                        <div>
                            <FieldLabel>Custom Category Name</FieldLabel>
                            <DarkInput icon={Tag} placeholder="Enter category name" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} required />
                        </div>
                    )}

                    <div>
                        <FieldLabel>Icon Keyword <span className="normal-case text-stone-600">(optional)</span></FieldLabel>
                        <DarkInput icon={Sparkles} placeholder="e.g. Code2, Sparkles, Database, Server" value={iconKeyword} onChange={(e) => setIconKeyword(e.target.value)} />
                        <p className="mt-1.5 text-xs text-stone-600">
                            Lucide icon name used in skill cards. Leave blank for default category icon.
                        </p>
                    </div>
                </Section>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-1">
                    <button
                        disabled={disabled}
                        className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] duration-200 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson ${
                            disabled
                                ? "cursor-not-allowed bg-crimson/40"
                                : "bg-crimson hover:bg-red-700 active:scale-[0.98] motion-reduce:active:scale-100"
                        }`}
                    >
                        <Save size={15} />
                        {disabled ? "Saving…" : isEdit ? "Save Changes" : "Save Skill"}
                    </button>
                    <button
                        type="button"
                        onClick={() => confirmNavigation(onCancel)}
                        className="flex items-center gap-2 rounded-lg border border-stone-700/70 px-5 py-2.5 text-sm font-medium text-stone-400 transition-colors hover:border-stone-600 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80"
                    >
                        <X size={14} />
                        Cancel
                    </button>
                </div>
            </div>
        </form>
    );
};

export default SkillForm;

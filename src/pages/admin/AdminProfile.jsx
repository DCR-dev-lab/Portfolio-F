import { useEffect, useState, useMemo } from "react";
import api from "../../services/api";
import { toast } from "sonner";
import ImageUploadField from "../../components/ui/ImageUploadField";
import usePageSEO from "../../hooks/usePageSEO";
import { useUnsavedChanges } from "../../context/UnsavedChangesContext";
import { FieldLabel, DarkInput, DarkTextarea, Section } from "../../components/ui/FormPrimitives";
import {
    UserCircle,
    Save,
    AlertCircle,
    Globe,
    Github,
    Linkedin,
    Twitter,
    Instagram,
    Phone,
    MapPin,
    Mail,
    FileText,
    Hash,
} from "lucide-react";

const EMPTY_FORM = {
    fullName: "",
    title: "",
    shortIntro: "",
    aboutMe: "",
    email: "",
    phone: "",
    location: "",
    github: "",
    linkedin: "",
    twitter: "",
    instagram: "",
    resumeUrl: "",
    profilePictureUrl: "",
    isAvailable: true,
    availabilityText: "Available for new projects",
    homeProjectsCount: 7,
    homeSkillsPerCategory: 8,
};

/* ───────────────────────────────────────────────────────────── */
const AdminProfile = () => {
    usePageSEO({
        title: "Edit Profile | Mod Studio",
        description: "Manage portfolio profile settings.",
        noindex: true,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [disabled, setDisabled] = useState(false);

    const [form, setForm] = useState(EMPTY_FORM);
    const [initialForm, setInitialForm] = useState(EMPTY_FORM);

    const isDirty = useMemo(
        () => !loading && JSON.stringify(form) !== JSON.stringify(initialForm),
        [loading, form, initialForm]
    );
    useUnsavedChanges(isDirty);

    // fetch profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/admin/profile");
                if (res.data) {
                    const loaded = {
                        fullName: (res.data.fullName || "").trim(),
                        title: (res.data.title || "").trim(),
                        shortIntro: (res.data.shortIntro || "").trim(),
                        aboutMe: (res.data.aboutMe || "").trim(),
                        email: (res.data.email || "").trim(),
                        phone: (res.data.phone || "").trim(),
                        location: (res.data.location || "").trim(),
                        github: (res.data.socialLinks?.github || "").trim(),
                        linkedin: (res.data.socialLinks?.linkedin || "").trim(),
                        twitter: (res.data.socialLinks?.twitter || "").trim(),
                        instagram: (res.data.socialLinks?.instagram || "").trim(),
                        resumeUrl: (res.data.resumeUrl || "").trim(),
                        profilePictureUrl: (res.data.profilePictureUrl || "").trim(),
                        isAvailable: res.data.isAvailable ?? true,
                        availabilityText: (res.data.availabilityText || "Available for new projects").trim(),
                        homeProjectsCount: res.data.homeProjectsCount ?? 7,
                        homeSkillsPerCategory: res.data.homeSkillsPerCategory ?? 8,
                    };
                    setForm(loaded);
                    setInitialForm(loaded);
                }
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setDisabled(true);

        try {
            await api.put("/admin/profile", {
                fullName: form.fullName,
                title: form.title,
                shortIntro: form.shortIntro,
                aboutMe: form.aboutMe,
                email: form.email,
                phone: form.phone,
                location: form.location,
                resumeUrl: form.resumeUrl,
                profilePictureUrl: form.profilePictureUrl,
                isAvailable: Boolean(form.isAvailable),
                availabilityText: (form.availabilityText || "").trim() || (form.isAvailable ? "Available for new projects" : "Currently unavailable"),
                homeProjectsCount: Number(form.homeProjectsCount),
                homeSkillsPerCategory: Number(form.homeSkillsPerCategory),
                socialLinks: {
                    github: form.github,
                    linkedin: form.linkedin,
                    twitter: form.twitter,
                    instagram: form.instagram,
                },
            });

            setInitialForm(form);
            toast.success("Profile updated successfully.");
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update profile.";
            toast.error(msg);
        } finally {
            setDisabled(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20 text-stone-500 text-sm">
            Loading profile…
        </div>
    );

    return (
        <div>
            {/* Page header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-cream">Edit Profile</h1>
                <p className="mt-1.5 text-sm text-stone-400">
                    Update the public profile details used across the portfolio.
                </p>
            </div>

            {error && (
                <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                    <AlertCircle size={14} className="shrink-0" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Identity */}
                <Section title="Identity">
                    <div>
                        <FieldLabel>Full Name</FieldLabel>
                        <DarkInput icon={UserCircle} name="fullName" placeholder="e.g. John Doe" value={form.fullName} onChange={handleChange} required />
                    </div>
                    <div>
                        <FieldLabel>Title / Role</FieldLabel>
                        <DarkInput icon={Globe} name="title" placeholder="e.g. Senior Full Stack Engineer" value={form.title} onChange={handleChange} required />
                    </div>
                    <div>
                        <FieldLabel>Short Intro <span className="normal-case text-stone-600">(max 200 chars)</span></FieldLabel>
                        <DarkInput name="shortIntro" placeholder="e.g. Building high-performance web applications." value={form.shortIntro} onChange={handleChange} required maxLength={200} />
                        <p className="mt-1 text-right text-xs text-stone-600">{form.shortIntro.length}/200</p>
                    </div>
                    <div>
                        <FieldLabel>About Me <span className="text-stone-600">(plain text display statement)</span></FieldLabel>
                        <DarkTextarea
                            name="aboutMe"
                            rows={4}
                            placeholder="Write your About display statement..."
                            value={form.aboutMe}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </Section>

                {/* Contact */}
                <Section title="Contact">
                    <div>
                        <FieldLabel>Email</FieldLabel>
                        <DarkInput icon={Mail} type="email" name="email" placeholder="e.g. contact@yourdomain.com" value={form.email} onChange={handleChange} required />
                    </div>
                    <div>
                        <FieldLabel>Phone</FieldLabel>
                        <DarkInput icon={Phone} name="phone" placeholder="e.g. +1 (555) 000-0000" value={form.phone} onChange={handleChange} required />
                    </div>
                    <div>
                        <FieldLabel>Location</FieldLabel>
                        <DarkInput icon={MapPin} name="location" placeholder="e.g. San Francisco, CA" value={form.location} onChange={handleChange} required />
                    </div>
                </Section>

                {/* Social Links */}
                <Section title="Social Links">
                    <div>
                        <FieldLabel>GitHub</FieldLabel>
                        <DarkInput icon={Github} name="github" placeholder="https://github.com/username" value={form.github} onChange={handleChange} />
                    </div>
                    <div>
                        <FieldLabel>LinkedIn</FieldLabel>
                        <DarkInput icon={Linkedin} name="linkedin" placeholder="https://linkedin.com/in/username" value={form.linkedin} onChange={handleChange} />
                    </div>
                    <div>
                        <FieldLabel>Twitter / X</FieldLabel>
                        <DarkInput icon={Twitter} name="twitter" placeholder="https://twitter.com/username" value={form.twitter} onChange={handleChange} />
                    </div>
                    <div>
                        <FieldLabel>Instagram</FieldLabel>
                        <DarkInput icon={Instagram} name="instagram" placeholder="https://instagram.com/username" value={form.instagram} onChange={handleChange} />
                    </div>
                </Section>

                {/* Media & Assets */}
                <Section title="Media & Assets">
                    <div>
                        <FieldLabel>Resume URL</FieldLabel>
                        <DarkInput icon={FileText} name="resumeUrl" placeholder="https://drive.google.com/.../resume.pdf" value={form.resumeUrl} onChange={handleChange} required />
                    </div>
                    <div>
                        <ImageUploadField
                            label="Profile Picture"
                            value={form.profilePictureUrl}
                            onChange={(url) => setForm((prev) => ({ ...prev, profilePictureUrl: url }))}
                            required
                        />
                    </div>
                </Section>

                {/* Display Settings */}
                <Section title="Display Settings">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
                        <div className="flex items-center justify-between rounded-lg border border-stone-800 bg-stone-900/50 px-4 py-3">
                            <div>
                                <p className="text-sm font-medium text-stone-200">Available for work</p>
                                <p className="text-xs text-stone-500">Controls the live pulse dot on Hero</p>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={form.isAvailable}
                                onClick={() => setForm((prev) => ({ ...prev, isAvailable: !prev.isAvailable }))}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson ${
                                    form.isAvailable ? "bg-crimson" : "bg-stone-700"
                                }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                                        form.isAvailable ? "translate-x-5" : "translate-x-0"
                                    }`}
                                />
                            </button>
                        </div>
                        <div>
                            <FieldLabel>Availability pill text</FieldLabel>
                            <DarkInput
                                icon={Globe}
                                name="availabilityText"
                                placeholder="e.g. Available for new projects"
                                maxLength={80}
                                value={form.availabilityText}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <FieldLabel>Projects shown on homepage</FieldLabel>
                            <DarkInput icon={Hash} type="number" name="homeProjectsCount" min={1} max={20} value={form.homeProjectsCount} onChange={handleChange} />
                        </div>
                        <div>
                            <FieldLabel>Skills per category on homepage</FieldLabel>
                            <DarkInput icon={Hash} type="number" name="homeSkillsPerCategory" min={1} max={20} value={form.homeSkillsPerCategory} onChange={handleChange} />
                        </div>
                    </div>
                </Section>

                {/* Submit */}
                <div className="flex items-center gap-4 pt-1">
                    <button
                        disabled={disabled}
                        type="submit"
                        className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] duration-200 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson ${
                            disabled
                                ? "cursor-not-allowed bg-crimson/40"
                                : "bg-crimson hover:bg-red-700 active:scale-[0.98] motion-reduce:active:scale-100"
                        }`}
                    >
                        <Save size={15} />
                        {disabled ? "Saving…" : "Save Profile"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminProfile;
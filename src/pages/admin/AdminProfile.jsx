import { useEffect, useState } from "react";
import api from "../../services/api";
import Input from "../../components/ui/Input";

const AdminProfile = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saveError, setSaveError] = useState("");
    const [saveMessage, setSaveMessage] = useState("");
    const [disabled, setDisabled] = useState(false);

    const [form, setForm] = useState({
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
    });

    // fetch profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/admin/profile");
                if (res.data) {
                    // Using .trim() ensures that strings containing only spaces 
                    // turn back into truly empty strings (""), exposing your placeholders.
                    setForm({
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
                    });
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
        setSaveError("");
        setSaveMessage("");

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
                socialLinks: {
                    github: form.github,
                    linkedin: form.linkedin,
                    twitter: form.twitter,
                    instagram: form.instagram,
                },
            });

            setSaveMessage("Profile updated successfully.");
        } catch (err) {
            setSaveError(err.response?.data?.message || "Failed to update profile.");
        } finally {
            setDisabled(false);
        }
    };

    if (loading) return <p className="p-8">Loading profile...</p>;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
                <p className="mt-1 text-gray-600">
                    Update the public profile details used across the portfolio.
                </p>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded shadow-md"
            >
                {saveMessage && (
                    <div className="mb-4 rounded bg-green-100 p-3 text-green-700">
                        {saveMessage}
                    </div>
                )}
                
                {saveError && (
                    <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
                        {saveError}
                    </div>
                )}

                <Input
                    label="Full Name"
                    name="fullName"
                    placeholder="e.g. John Doe"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Title"
                    name="title"
                    placeholder="e.g. Senior Full Stack Engineer"
                    value={form.title}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Short Intro"
                    name="shortIntro"
                    placeholder="e.g. Building high-performance web applications."
                    value={form.shortIntro}
                    onChange={handleChange}
                    required
                />

                <label className="mb-2 block font-medium text-gray-700">About Me</label>
                <textarea
                    name="aboutMe"
                    placeholder="Write a brief overview about your background and skills..."
                    className="mb-3 w-full rounded border px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={form.aboutMe}
                    onChange={handleChange}
                    required
                />

                <Input
                    label="Email"
                    name="email"
                    placeholder="e.g. contact@yourdomain.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Phone"
                    name="phone"
                    placeholder="e.g. +1 (555) 000-0000"
                    value={form.phone}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Location"
                    name="location"
                    placeholder="e.g. San Francisco, CA"
                    value={form.location}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="GitHub"
                    name="github"
                    placeholder="e.g. https://github.com/username"
                    value={form.github}
                    onChange={handleChange}
                />
                <Input
                    label="LinkedIn"
                    name="linkedin"
                    placeholder="e.g. https://linkedin.com/in/username"
                    value={form.linkedin}
                    onChange={handleChange}
                />
                <Input
                    label="Twitter"
                    name="twitter"
                    placeholder="e.g. https://twitter.com/username"
                    value={form.twitter}
                    onChange={handleChange}
                />
                <Input
                    label="Instagram"
                    name="instagram"
                    placeholder="e.g. https://instagram.com/username"
                    value={form.instagram}
                    onChange={handleChange}
                />
                <Input
                    label="Resume URL"
                    name="resumeUrl"
                    placeholder="e.g. https://drive.google.com/.../resume.pdf"
                    value={form.resumeUrl}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Profile Picture URL"
                    name="profilePictureUrl"
                    placeholder="e.g. https://yourhost.com/avatar.jpg"
                    value={form.profilePictureUrl}
                    onChange={handleChange}
                    required
                />

                <button
                    disabled={disabled}
                    className={`rounded px-4 py-2 font-medium text-white transition-colors ${
                        disabled ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                    }`}
                >
                    {disabled ? "Saving..." : "Save Profile"}
                </button>
            </form>
        </div>
    );
};

export default AdminProfile;
import { useState } from "react";
import api from "../../../services/api";
import Input from "../../../components/ui/Input";

const EditProject = ({ project, onSuccess, onCancel }) => {
    const [title, setTitle] = useState(project.title);
    const [shortDescription, setShortDescription] = useState(project.shortDescription);
    const [longDescription, setLongDescription] = useState(project.longDescription);
    const [imageUrl, setImageUrl] = useState(project.imageUrl);
    const [projectUrl, setProjectUrl] = useState(project.projectUrl);
    const [technologies, setTechnologies] = useState(project.technologies.join(", "));
    const [githubUrl, setGithubUrl] = useState(project.githubUrl);
    const [disabled, setDisabled] = useState(false);
    const [error, setError] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        setDisabled(true);
        setError("");

        try {
            await api.put(`/admin/dashboard/projects/${project._id}`, {
                title,
                shortDescription,
                longDescription,
                imageUrl,
                projectUrl,
                technologies: technologies.split(",").map((tech) => tech.trim()).filter(Boolean),
                githubUrl
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to update project.");
        } finally {
            setDisabled(false);
        }
    };

    return (
        <form onSubmit={submit} className="rounded bg-white p-6 shadow">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Project</h2>
                <p className="mt-1 text-gray-600">Update the content shown for this project.</p>
            </div>

            {error && (
                <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
                    {error}
                </div>
            )}

            <Input
                label="Project Title"
                name = "projectTitle"
                placeholder="e.g. SaaS Dashboard"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />

            <Input
                label="Short Description"
                name="shortDescription"
                placeholder="A short summary shown on cards"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                required
            />

            <label className="mb-2 block font-medium text-gray-700">Long Description</label>
            <textarea
                className="mb-4 w-full rounded border px-3 py-2 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Describe the project in more detail"
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                required
            />

            <Input  
                label="Image URL"
                name="imageUrl"
                placeholder="https://example.com/project-cover.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
            />
            <Input
                label="Project URL"
                name="projectUrl"
                placeholder="https://example.com"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                required
            />
            <Input
                label="Technologies"
                name="technologies"
                placeholder="React, Node.js, MongoDB"
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
                required
            />
            <Input
                label="GitHub URL"
                name="githubUrl"
                placeholder="https://github.com/username/repository"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
            />


            <div className="flex gap-3">
                <button
                    disabled={disabled}
                    className={`cursor-pointer rounded px-4 py-2 font-medium text-white ${disabled ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"}`}
                >
                    {disabled ? "Saving..." : "Save Changes"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="cursor-pointer rounded bg-gray-200 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-300"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default EditProject;

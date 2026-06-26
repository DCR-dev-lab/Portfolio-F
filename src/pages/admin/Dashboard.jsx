import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        Cookies.remove("adminToken");
        navigate("/admin/login");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="mt-1 text-gray-600">
                        Manage portfolio content, profile details, and public-facing updates.
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="rounded bg-red-500 px-4 py-2 font-medium text-white transition hover:bg-red-600"
                >
                    Logout
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    onClick={() => navigate("/admin/projects")}
                    className="cursor-pointer rounded bg-white p-6 shadow transition hover:shadow-lg"
                >
                    <h2 className="text-xl font-semibold mb-2 text-gray-900">Manage Projects</h2>
                    <p className="text-gray-600">
                        Add, edit, and remove portfolio projects.
                    </p>
                </div>

                <div
                    onClick={() => navigate("/admin/skills")}
                    className="cursor-pointer rounded bg-white p-6 shadow transition hover:shadow-lg"
                >
                    <h2 className="text-xl font-semibold mb-2 text-gray-900">Manage Skills</h2>
                    <p className="text-gray-600">
                        Update skill names, categories, and proficiency levels.
                    </p>
                </div>

                <div
                    onClick={() => navigate("/admin/profile")}
                    className="cursor-pointer rounded bg-white p-6 shadow transition hover:shadow-lg"
                >
                    <h2 className="text-xl font-semibold mb-2 text-gray-900 ">Edit Profile</h2>
                    <p className="text-gray-600">
                        Maintain hero content, contact info, and social links.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

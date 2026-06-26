import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"
import Cookies from "js-cookie"

const AdminLogin = () => {
    const [key, setKey] = useState("")
    const [error, setError] = useState("")
    const [disabled, setDisabled] = useState(false)
    const navigate = useNavigate()
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setDisabled(true)
            const response = await api.post("/admin/login", { key })
            Cookies.set("adminToken", response.data.token, { expires: 1 })
            setKey("")
            setError("")
            navigate("/admin/dashboard")
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
            console.error(err)
        }
        setDisabled(false)
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">
                        {error}
                    </div>
                )}
                <div className="mb-4">
                    <label
                        htmlFor="adminKey"
                        className="block text-gray-700 mb-2"
                    >
                        Admin Key
                    </label>
                    <input
                        type="password"
                        id="adminKey"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        className="w-full px-3 py-2 border rounded bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                    />
                </div>
                <button
                    disabled={disabled}
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
                >
                    Login
                </button>
            </form>
        </div>
    )
}
export default AdminLogin
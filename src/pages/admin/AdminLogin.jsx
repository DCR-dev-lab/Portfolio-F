import { useState, useEffect } from "react"
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"
import api from "../../services/api"
import Cookies from "js-cookie"
import usePageSEO from "../../hooks/usePageSEO"
import { getSafeModRedirect } from "../../utils/security"
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react"

const AdminLogin = () => {
    usePageSEO({
        title: "Moderator Access",
        description: "Restricted moderation access point.",
        noindex: true,
    });

    const [key, setKey] = useState("")
    const [showKey, setShowKey] = useState(false)
    const [error, setError] = useState("")
    const [disabled, setDisabled] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()

    useEffect(() => {
        if (Cookies.get("adminToken")) {
            const stateTarget = location.state?.from?.pathname
                ? `${location.state.from.pathname}${location.state.from.search || ""}`
                : null
            navigate(getSafeModRedirect(stateTarget || searchParams.get("redirect")), { replace: true })
        }
    }, [navigate, location, searchParams])

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setDisabled(true)
            const response = await api.post("/admin/login", { key })
            Cookies.set("adminToken", response.data.token, {
                expires: 1 / 48, // 30 minutes matching backend JWT validity
                secure: window.location.protocol === "https:",
                sameSite: "strict",
            })
            setKey("")
            setError("")
            
            // Return memory: state.from (ProtectedRoute) or ?redirect= (401/403 expiry), validated via getSafeModRedirect
            const stateTarget = location.state?.from?.pathname
                ? `${location.state.from.pathname}${location.state.from.search || ""}`
                : null
            const destination = getSafeModRedirect(stateTarget || searchParams.get("redirect"))
            navigate(destination, { replace: true })
        } catch (err) {
            setError(err.response?.data?.message || "Invalid access key. Try again.");
            console.error(err)
        }
        setDisabled(false)
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-obsidian px-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
            {/* Ambient glow */}
            <div className="bg-radial-top pointer-events-none fixed inset-0" />

            <div className="relative w-full max-w-sm">
                {/* Icon badge */}
                <div className="mb-6 flex flex-col items-center gap-3 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-stone-800 bg-stone-900">
                        <ShieldCheck size={22} className="text-crimson" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-cream">Mod Access</h1>
                        <p className="mt-1 text-sm text-stone-500">Enter your key to enter the studio</p>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-xl border border-stone-800/80 bg-stone-950 p-7"
                >
                    {error && (
                        <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                            <Lock size={14} className="mt-0.5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="mb-5">
                        <label htmlFor="adminKey" className="mb-1.5 block text-xs font-medium text-stone-400">
                            Secret key
                        </label>
                        <div className="relative">
                            <input
                                type={showKey ? "text" : "password"}
                                id="adminKey"
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full rounded-lg border border-stone-700/70 bg-stone-900 py-2.5 pl-3.5 pr-10 text-sm text-cream placeholder-stone-600 outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-stone-500 hover:text-stone-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                                tabIndex={-1}
                                aria-label={showKey ? "Hide key" : "Show key"}
                            >
                                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    <button
                        disabled={disabled}
                        type="submit"
                        className={`w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-[background-color,transform] duration-200 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson ${
                            disabled
                                ? "cursor-not-allowed bg-crimson/40"
                                : "bg-crimson hover:bg-red-700 active:scale-[0.98] motion-reduce:active:scale-100"
                        }`}
                    >
                        {disabled ? "Authenticating…" : "Access Dashboard"}
                    </button>
                </form>

                <p className="mt-5 text-center text-xs text-stone-600">
                    Restricted area · Unauthorised access is prohibited
                </p>
            </div>
        </div>
    )
}

export default AdminLogin
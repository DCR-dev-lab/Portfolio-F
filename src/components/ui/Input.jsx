const Input = ({ label, error, ...props }) => {
    return (
        <div className="mb-4">
            {label && (
                <label className="block text-gray-700 mb-1">
                    {label}
                </label>
            )}

            <input
                {...props}
                // Added "text-gray-800 placeholder-gray-400" to guarantee visibility
                className="w-full px-3 py-2 border rounded bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            {error && (
                <p className="text-red-500 text-sm mt-1">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;
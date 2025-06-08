export default function Input({ label, ...props }) {
    return (
        <div className="mb-4">
            <input
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                placeholder={label}
                {...props}
            />
        </div>
    );
}

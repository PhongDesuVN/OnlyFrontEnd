export default function PhoneInput({ value, onChange }) {
    return (
        <div className="mb-4 flex items-center border border-gray-300 rounded">
            <span className="px-3">🇻🇳 +84</span>
            <input
                className="flex-1 p-3 focus:outline-none"
                type="tel"
                placeholder="Nhập số điện thoại"
                value={value}
                onChange={onChange}
            />
        </div>
    );
}

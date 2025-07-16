import { Loader, AlertCircle } from "lucide-react";
import PropTypes from "prop-types";

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <Loader className="animate-spin mr-2" size={20} />
    <span>Đang tải dữ liệu...</span>
  </div>
);

export const ErrorMessage = ({ error, onRetry }) => (
  <div className="flex items-center justify-center py-8 text-red-600">
    <AlertCircle className="mr-2" size={20} />
    <span>{error}</span>
    <button
      onClick={onRetry}
      className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
    >
      Thử lại
    </button>
  </div>
);

ErrorMessage.propTypes = {
  error: PropTypes.string,
  onRetry: PropTypes.func.isRequired,
};
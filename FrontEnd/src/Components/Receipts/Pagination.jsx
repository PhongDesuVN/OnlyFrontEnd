import React from "react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="w-full flex justify-center items-center gap-3 py-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'}`}
        title="Trang trước"
      >
        Trước
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${currentPage === page ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          title={`Trang ${page}`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'}`}
        title="Trang sau"
      >
        Sau
      </button>
      <span className="text-sm text-gray-600 font-medium ml-2">
        Trang {currentPage} / {totalPages}
      </span>
    </div>
  );
} 
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages === 0) return null;

  const pages = [...Array(totalPages)].map((_, i) => i + 1);

  return (
    <div className="flex justify-center mt-4 flex-wrap gap-2">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-40"
      >
        Prev
      </button>

      {pages.map((num) => (
        <button
          key={num}
          onClick={() => onPageChange(num)}
          className={`px-3 py-1 rounded ${
            currentPage === num
              ? "bg-blue-600 text-white"
              : "bg-gray-300 text-gray-800 hover:bg-gray-400"
          }`}
        >
          {num}
        </button>
      ))}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;

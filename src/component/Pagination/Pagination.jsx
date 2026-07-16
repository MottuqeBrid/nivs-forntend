import {
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";

const PER_PAGE_OPTIONS = [8, 12, 16, 24];

const Pagination = ({ page, perPage, total, onPageChange, onPerPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      <div className="flex items-center gap-2 text-sm text-base-content/60">
        <span>
          Showing {from}–{to} of {total}
        </span>
        <select
          className="select select-bordered select-sm"
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
        >
          {PER_PAGE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
      </div>

      {totalPages > 1 && (
        <div className="join">
          <button
            className="join-item btn btn-sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <HiChevronLeft className="text-lg" />
          </button>
          {pages.map((p) => (
            <button
              key={p}
              className={`join-item btn btn-sm ${p === page ? "btn-active" : ""}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="join-item btn btn-sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <HiChevronRight className="text-lg" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;

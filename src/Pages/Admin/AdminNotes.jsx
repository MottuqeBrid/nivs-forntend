import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  HiDocumentText,
  HiSearch,
  HiX,
  HiUser,
  HiCalendar,
} from "react-icons/hi";
import useAxios from "../../hooks/useAxios";

const AdminNotes = () => {
  const app = useAxios();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewNote, setViewNote] = useState(null);

  const fetchNotes = useCallback(async () => {
    try {
      const { data } = await app.get("admin/all-notes");
      if (data.success) setNotes(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [app]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const filtered = notes.filter((n) => {
    const q = search.toLowerCase();
    return (
      !q ||
      n.title?.toLowerCase().includes(q) ||
      n.content?.toLowerCase().includes(q) ||
      n.user?.name?.toLowerCase().includes(q) ||
      n.user?.email?.toLowerCase().includes(q)
    );
  });

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card bg-base-200 shadow">
              <div className="card-body p-4 gap-2">
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-3 w-1/2 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HiDocumentText className="text-primary" />
            All Notes
          </h1>
          <p className="text-base-content/60 mt-1">
            {notes.length} note{notes.length !== 1 && "s"} across all users
          </p>
        </div>
        <div className="input input-bordered flex items-center gap-2 w-full sm:w-80 focus-within:ring-2 focus-within:ring-primary">
          <HiSearch className="text-lg opacity-60 shrink-0" />
          <input
            type="text"
            placeholder="Search notes..."
            className="bg-transparent outline-none w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="btn btn-ghost btn-xs"
            >
              <HiX />
            </button>
          )}
        </div>
      </div>

      {/* Empty */}
      {notes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <HiDocumentText className="text-7xl text-base-content/20" />
          <h3 className="text-xl font-semibold">No notes yet</h3>
          <p className="text-base-content/50 max-w-sm">
            Notes created by users will appear here.
          </p>
        </div>
      )}

      {/* No results */}
      {notes.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <HiSearch className="text-5xl text-base-content/20" />
          <p className="text-base-content/60">No notes match your search.</p>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((note) => (
            <div
              key={note._id}
              className={`card shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer ${note.isDeleted ? "bg-base-200/50 opacity-60" : "bg-base-200"}`}
              onClick={() => setViewNote(note)}
            >
              <div className="card-body p-5">
                <div className="flex items-center justify-between">
                  <h3 className="card-title text-sm truncate">
                    {note.title || "Untitled"}
                  </h3>
                  {note.isDeleted && (
                    <span className="badge badge-error badge-xs">Deleted</span>
                  )}
                </div>
                <p className="text-sm text-base-content/60 line-clamp-3">
                  {note.content || "No content"}
                </p>
                {note.user && (
                  <p className="text-xs text-base-content/50 flex items-center gap-1 mt-2">
                    <HiUser className="text-xs shrink-0" />
                    {note.user.name || note.user.email}
                  </p>
                )}
                <div className="text-xs text-base-content/40 mt-1 flex items-center gap-1">
                  <HiCalendar className="text-xs" />
                  {formatDateTime(note.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Note Modal */}
      {viewNote && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl bg-base-200 max-h-[90vh]">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setViewNote(null)}
            >
              <HiX />
            </button>
            <h3 className="font-bold text-lg mb-1">
              {viewNote.title || "Untitled"}
            </h3>
            <div className="flex items-center gap-3 text-xs text-base-content/40 mb-4">
              {viewNote.user && (
                <span className="flex items-center gap-1">
                  <HiUser className="text-xs" />
                  {viewNote.user.name || viewNote.user.email}
                </span>
              )}
              <span className="flex items-center gap-1">
                <HiCalendar className="text-xs" />
                {formatDateTime(viewNote.createdAt)}
              </span>
              {viewNote.updatedAt !== viewNote.createdAt && (
                <span>Updated {formatDateTime(viewNote.updatedAt)}</span>
              )}
            </div>
            <p className="text-base-content whitespace-pre-wrap">
              {viewNote.content}
            </p>
            <div className="modal-action">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setViewNote(null)}
              >
                Close
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop bg-black/50"
            onClick={() => setViewNote(null)}
          />
        </dialog>
      )}
    </div>
  );
};

export default AdminNotes;

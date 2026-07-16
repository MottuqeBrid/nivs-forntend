import { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router";
import { toast } from "react-toastify";
import {
  HiDocumentText,
  HiPlus,
  HiPencil,
  HiTrash,
  HiX,
  HiOutlineExclamationCircle,
  HiSearch,
  HiCalendar,
} from "react-icons/hi";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import NoteEditor from "../../component/NoteEditor/NoteEditor";
import Pagination from "../../component/Pagination/Pagination";

const EMPTY_FORM = { title: "", content: "" };

const Notes = () => {
  const { user, loading: authLoading } = useAuth();
  const app = useAxios();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [submitting, setSubmitting] = useState(false);
  const [viewNote, setViewNote] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);

  const fetchNotes = useCallback(async () => {
    try {
      const { data } = await app.get("notes");
      if (data.success) setNotes(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [app]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotes();
  }, [fetchNotes]);

  const filtered = notes.filter((n) => {
    const q = search.toLowerCase();
    return (
      !q ||
      n.title?.toLowerCase().includes(q) ||
      n.content?.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "name-asc")
      return (a.title || "").localeCompare(b.title || "");
    if (sort === "name-desc")
      return (b.title || "").localeCompare(a.title || "");
    if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };
  const handlePerPage = (val) => {
    setPerPage(val);
    setPage(1);
  };

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (note) => {
    setEditId(note._id);
    setForm({ title: note.title || "", content: note.content || "" });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.content.trim()) return toast.error("Content is required");

    setSubmitting(true);
    try {
      if (editId) {
        const { data } = await app.patch(`notes/${editId}`, {
          title: form.title.trim(),
          content: form.content,
        });
        if (data.success) {
          setNotes((prev) =>
            prev.map((n) => (n._id === editId ? data.data : n)),
          );
          toast.success("Note updated");
        }
      } else {
        const { data } = await app.post("notes", {
          title: form.title.trim(),
          content: form.content,
        });
        if (data.success) {
          setNotes((prev) => [data.data, ...prev]);
          toast.success("Note created");
        }
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { data } = await app.delete(`notes/${deleteTarget._id}`);
      if (data.success) {
        setNotes((prev) => prev.filter((n) => n._id !== deleteTarget._id));
        toast.success("Note deleted");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleteTarget(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!user && !authLoading) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <div className="py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="skeleton h-8 w-40" />
          <div className="skeleton h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card bg-base-200 shadow">
              <div className="card-body gap-2">
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-6 w-20 mt-2" />
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
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="text-base-content/60 mt-1">
            {notes.length} note{notes.length !== 1 && "s"} in your collection
          </p>
        </div>
        <button
          className="btn btn-primary gap-2 rounded-lg"
          onClick={openCreate}
        >
          <HiPlus className="text-xl" />
          New Note
        </button>
      </div>

      {/* Search */}
      {notes.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="input input-bordered flex items-center gap-2 flex-1 max-w-sm focus-within:ring-2 focus-within:ring-primary">
            <HiSearch className="text-lg opacity-60 shrink-0" />
            <input
              type="text"
              placeholder="Search notes..."
              className="bg-transparent outline-none w-full"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => handleSearch("")}
                className="btn btn-ghost btn-xs"
              >
                <HiX />
              </button>
            )}
          </div>

          <select
            className="select select-bordered select-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name-asc">Title A–Z</option>
            <option value="name-desc">Title Z–A</option>
          </select>
        </div>
      )}

      {/* Empty */}
      {notes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <HiDocumentText className="text-7xl text-base-content/20" />
          <h3 className="text-xl font-semibold">No notes yet</h3>
          <p className="text-base-content/50 max-w-sm">
            Start writing by creating your first note.
          </p>
          <button
            className="btn btn-primary gap-2 rounded-lg"
            onClick={openCreate}
          >
            <HiPlus className="text-xl" />
            Create First Note
          </button>
        </div>
      )}

      {/* No results */}
      {notes.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <HiSearch className="text-5xl text-base-content/20" />
          <p className="text-base-content/60">No notes match your search.</p>
        </div>
      )}

      {/* Notes Grid */}
      {paginated.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((note) => (
            <div
              key={note._id}
              className="card bg-base-200 shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer"
              onClick={() => setViewNote(note)}
            >
              <div className="card-body p-5">
                <h3 className="card-title text-base truncate">
                  {note.title || "Untitled"}
                </h3>
                <p className="text-sm text-base-content/60 line-clamp-3">
                  {note.content || "No content"}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-base-content/40 flex items-center gap-1">
                    <HiCalendar className="text-xs" />
                    {formatDate(note.createdAt)}
                  </span>
                  <div
                    className="flex gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="btn btn-ghost btn-xs gap-1"
                      onClick={() => openEdit(note)}
                    >
                      <HiPencil className="text-sm" />
                    </button>
                    <button
                      className="btn btn-ghost btn-xs gap-1 text-error"
                      onClick={() => setDeleteTarget(note)}
                    >
                      <HiTrash className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <Pagination
          page={page}
          perPage={perPage}
          total={filtered.length}
          onPageChange={setPage}
          onPerPageChange={handlePerPage}
        />
      )}

      {/* Create / Edit Modal */}
      <dialog className={`modal ${modalOpen ? "modal-open" : ""}`}>
        <div className="modal-box max-w-3xl bg-base-200 max-h-[90vh]">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={closeModal}
          >
            <HiX />
          </button>
          <h3 className="font-bold text-lg mb-4">
            {editId ? "Edit Note" : "New Note"}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Title</span>
              </label>
              <input
                type="text"
                placeholder="Note title"
                className="input input-bordered w-full"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                autoFocus
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Content</span>
              </label>
              <NoteEditor
                content={form.content}
                onChange={(html) => setForm((f) => ({ ...f, content: html }))}
                placeholder="Start writing..."
              />
            </div>
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : editId ? (
                  "Save Changes"
                ) : (
                  "Create Note"
                )}
              </button>
            </div>
          </form>
        </div>
        <div className="modal-backdrop bg-black/50" onClick={closeModal} />
      </dialog>

      {/* View Note Modal */}
      <dialog className={`modal ${viewNote ? "modal-open" : ""}`}>
        <div className="modal-box max-w-3xl bg-base-200 max-h-[90vh]">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => setViewNote(null)}
          >
            <HiX />
          </button>
          <h3 className="font-bold text-lg mb-1">{viewNote?.title}</h3>
          <p className="text-xs text-base-content/40 mb-4 flex items-center gap-1">
            <HiCalendar className="text-xs" />
            Created {formatDate(viewNote?.createdAt)}
            {viewNote?.updatedAt !== viewNote?.createdAt &&
              ` · Updated ${formatDate(viewNote?.updatedAt)}`}
          </p>
          <p className="text-base-content whitespace-pre-wrap">
            {viewNote?.content}
          </p>
          <div className="modal-action">
            <button
              className="btn btn-ghost btn-sm gap-1"
              onClick={() => {
                setViewNote(null);
                openEdit(viewNote);
              }}
            >
              <HiPencil className="text-sm" />
              Edit
            </button>
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

      {/* Delete Confirmation Modal */}
      <dialog className={`modal ${deleteTarget ? "modal-open" : ""}`}>
        <div className="modal-box max-w-sm bg-base-200">
          <div className="flex flex-col items-center gap-3 text-center">
            <HiOutlineExclamationCircle className="text-5xl text-error" />
            <h3 className="font-bold text-lg">Delete Note?</h3>
            <p className="text-base-content/60">
              <span className="font-semibold">
                {deleteTarget?.title || "Untitled"}
              </span>{" "}
              will be permanently removed.
            </p>
          </div>
          <div className="modal-action justify-center gap-3">
            <button
              className="btn btn-ghost"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button
              className="btn btn-error text-white gap-2"
              onClick={confirmDelete}
            >
              <HiTrash className="text-lg" />
              Delete
            </button>
          </div>
        </div>
        <div
          className="modal-backdrop bg-black/50"
          onClick={() => setDeleteTarget(null)}
        />
      </dialog>
    </div>
  );
};

export default Notes;

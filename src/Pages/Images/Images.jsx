import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Navigate } from "react-router";
import { toast } from "react-toastify";
import { TagsInput } from "@mantine/core";
import {
  HiPlus,
  HiPhotograph,
  HiPencil,
  HiTrash,
  HiX,
  HiEye,
  HiTag,
  HiSearch,
  HiOutlineExclamationCircle,
  HiUpload,
  HiLink,
} from "react-icons/hi";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import { uploadToStorage } from "../../lib/upload";
import Pagination from "../../component/Pagination/Pagination";

const EMPTY_FORM = { name: "", alt: "", tags: [] };
const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const Images = () => {
  const { user, loading: authLoading } = useAuth();
  const app = useAxios();

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterTag, setFilterTag] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);

  // Upload state
  const [inputMode, setInputMode] = useState("file");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  // ── Fetch images ──
  const fetchImages = useCallback(async () => {
    try {
      const { data } = await app.get("images");
      if (data.success) setImages(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load images");
    } finally {
      setLoading(false);
    }
  }, [app]);

  useEffect(() => {
    const fun = async () => {
      fetchImages();
    };
    fun();
  }, [fetchImages]);

  // ── Derived data ──
  const allTags = useMemo(
    () => [...new Set(images.flatMap((img) => img.tags || []))],
    [images],
  );

  const filtered = images.filter((img) => {
    const matchTag = !filterTag || (img.tags || []).includes(filterTag);
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      img.name?.toLowerCase().includes(q) ||
      img.alt?.toLowerCase().includes(q) ||
      (img.tags || []).some((t) => t.toLowerCase().includes(q));
    return matchTag && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "name-asc") return (a.name || "").localeCompare(b.name || "");
    if (sort === "name-desc") return (b.name || "").localeCompare(a.name || "");
    if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  // reset page when filters change
  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };
  const handleFilterTag = (val) => {
    setFilterTag(val);
    setPage(1);
  };
  const handlePerPage = (val) => {
    setPerPage(val);
    setPage(1);
  };

  // ── Modal helpers ──
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFile(null);
    setFilePreview("");
    setUrlInput("");
    setInputMode("file");
  };

  const openCreate = () => {
    setEditId(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (img) => {
    setEditId(img._id);
    setForm({
      name: img.name || "",
      alt: img.alt || "",
      tags: img.tags || [],
    });
    setUrlInput(img.url || "");
    setFile(null);
    setFilePreview("");
    setInputMode("url");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
    resetForm();
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // ── File handling ──
  const validateFile = (f) => {
    if (!ALLOWED.includes(f.type)) {
      toast.error("Only JPEG, PNG, GIF, WebP, SVG allowed");
      return false;
    }
    return true;
  };

  const handleFile = (f) => {
    if (!f || !validateFile(f)) return;
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setFilePreview(reader.result);
    reader.readAsDataURL(f);
    setInputMode("file");
    if (!form.name) {
      const name = f.name.replace(/\.[^.]+$/, "");
      setForm((prev) => ({ ...prev, name }));
    }
  };

  const onFileInput = (e) => handleFile(e.target.files?.[0]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const clearFile = () => {
    setFile(null);
    setFilePreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

  // ── Submit (create / update) ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setUploadProgress(0);

    try {
      let imageUrl = urlInput.trim();

      if (inputMode === "file" && file) {
        toast.info("Uploading image...");
        imageUrl = await uploadToStorage(app, file, setUploadProgress);
      }

      if (!imageUrl) {
        toast.error("Please upload a file or provide an image URL");
        setSubmitting(false);
        return;
      }

      const payload = {
        url: imageUrl,
        name: form.name.trim(),
        alt: form.alt.trim(),
        tags: form.tags,
      };

      if (editId) {
        const { data } = await app.patch(`images/${editId}`, payload);
        if (data.success) {
          setImages((prev) =>
            prev.map((img) => (img._id === editId ? data.data : img)),
          );
          toast.success("Image updated");
        }
      } else {
        const { data } = await app.post("images", payload);
        if (data.success) {
          setImages((prev) => [data.data, ...prev]);
          toast.success("Image added");
        }
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  // ── Delete ──
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { data } = await app.delete(`images/${deleteTarget._id}`);
      if (data.success) {
        setImages((prev) => prev.filter((img) => img._id !== deleteTarget._id));
        toast.success("Image deleted");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleteTarget(null);
    }
  };

  // ── Skeleton ──
  if (loading) {
    return (
      <div className="py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="skeleton h-8 w-40" />
          <div className="skeleton h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card bg-base-200 shadow">
              <div className="skeleton h-48 rounded-t-xl" />
              <div className="card-body p-4 gap-2">
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Not logged in ──
  if (!user && !authLoading) return <Navigate to="/login" replace />;

  return (
    <div className="py-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Images</h1>
          <p className="text-base-content/60 mt-1">
            {images.length} image{images.length !== 1 && "s"} in your collection
          </p>
        </div>
        <button
          className="btn btn-primary gap-2 rounded-lg"
          onClick={openCreate}
        >
          <HiPlus className="text-xl" />
          Add Image
        </button>
      </div>

      {/* ── Filters ── */}
      {images.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="input input-bordered flex items-center gap-2 flex-1 max-w-sm focus-within:ring-2 focus-within:ring-primary">
            <HiSearch className="text-lg opacity-60 shrink-0" />
            <input
              type="text"
              placeholder="Search images..."
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
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
          </select>

          {allTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <HiTag className="text-lg opacity-60 shrink-0" />
              <button
                className={`badge badge-lg cursor-pointer transition-all ${
                  !filterTag
                    ? "badge-primary"
                    : "badge-ghost hover:badge-outline"
                }`}
                onClick={() => handleFilterTag("")}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  className={`badge badge-lg cursor-pointer transition-all ${
                    filterTag === tag
                      ? "badge-primary"
                      : "badge-ghost hover:badge-outline"
                  }`}
                  onClick={() => handleFilterTag(filterTag === tag ? "" : tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Empty state ── */}
      {images.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <HiPhotograph className="text-7xl text-base-content/20" />
          <h3 className="text-xl font-semibold">No images yet</h3>
          <p className="text-base-content/50 max-w-sm">
            Start building your collection by adding your first image.
          </p>
          <button
            className="btn btn-primary gap-2 rounded-lg"
            onClick={openCreate}
          >
            <HiPlus className="text-xl" />
            Add First Image
          </button>
        </div>
      )}

      {/* ── No results ── */}
      {images.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <HiSearch className="text-5xl text-base-content/20" />
          <p className="text-base-content/60">No images match your search.</p>
        </div>
      )}

      {/* ── Image Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginated.map((img) => (
          <div
            key={img._id}
            className="card bg-base-200 shadow-md hover:shadow-xl transition-all duration-300 group"
          >
            <figure className="relative h-48 overflow-hidden bg-base-300">
              <img
                src={img.url}
                alt={img.alt || img.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="w-full h-full items-center justify-center bg-base-300 hidden">
                <HiPhotograph className="text-4xl text-base-content/20" />
              </div>

              <button
                className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
                onClick={() => setPreviewImg(img)}
                aria-label="Preview image"
              >
                <HiEye className="text-3xl text-white drop-shadow-lg" />
              </button>
            </figure>

            <div className="card-body p-4">
              <h3 className="card-title text-sm truncate">
                {img.name || "Untitled"}
              </h3>
              {img.alt && (
                <p className="text-xs text-base-content/50 truncate">
                  {img.alt}
                </p>
              )}
              {img.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {img.tags.map((tag) => (
                    <span key={tag} className="badge badge-outline badge-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="card-actions justify-end mt-2">
                <button
                  className="btn btn-ghost btn-xs gap-1"
                  onClick={() => openEdit(img)}
                >
                  <HiPencil className="text-sm" />
                  Edit
                </button>
                <button
                  className="btn btn-ghost btn-xs gap-1 text-error"
                  onClick={() => setDeleteTarget(img)}
                >
                  <HiTrash className="text-sm" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length > 0 && (
        <Pagination
          page={page}
          perPage={perPage}
          total={filtered.length}
          onPageChange={setPage}
          onPerPageChange={handlePerPage}
        />
      )}

      {/* ══════════════════════════════════════════════════
          Create / Edit Modal
         ══════════════════════════════════════════════════ */}
      <dialog className={`modal ${modalOpen ? "modal-open" : ""}`}>
        <div className="modal-box max-w-lg bg-base-200">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={closeModal}
          >
            <HiX />
          </button>
          <h3 className="font-bold text-lg mb-4">
            {editId ? "Edit Image" : "Add Image"}
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* ── Source mode toggle (only on create) ── */}
            {!editId && (
              <div className="flex gap-2 bg-base-300 rounded-lg p-1">
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                    inputMode === "file"
                      ? "bg-primary text-primary-content shadow"
                      : "hover:bg-base-200"
                  }`}
                  onClick={() => setInputMode("file")}
                >
                  <HiUpload className="text-lg" />
                  Upload File
                </button>
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                    inputMode === "url"
                      ? "bg-primary text-primary-content shadow"
                      : "hover:bg-base-200"
                  }`}
                  onClick={() => setInputMode("url")}
                >
                  <HiLink className="text-lg" />
                  Paste URL
                </button>
              </div>
            )}

            {/* ── File upload zone ── */}
            {inputMode === "file" && (
              <div className="form-control">
                {filePreview ? (
                  <>
                    <div className="relative rounded-xl overflow-hidden bg-base-300">
                      <img
                        src={filePreview}
                        alt="Selected"
                        className="w-full h-48 object-contain"
                      />
                      {!submitting && (
                        <button
                          type="button"
                          className="btn btn-circle btn-sm btn-error absolute top-2 right-2"
                          onClick={clearFile}
                        >
                          <HiX className="text-lg" />
                        </button>
                      )}
                      {submitting && uploadProgress > 0 && (
                        <div className="absolute top-2 right-2 bg-base-200/90 rounded-lg px-2 py-1 text-xs font-medium">
                          {uploadProgress}%
                        </div>
                      )}
                      <div className="p-2 text-xs text-base-content/60 truncate">
                        {file?.name} ({(file?.size / 1024).toFixed(0)} KB)
                      </div>
                    </div>
                    {submitting && uploadProgress > 0 && (
                      <progress
                        className="progress progress-primary w-full mt-2"
                        value={uploadProgress}
                        max="100"
                      />
                    )}
                  </>
                ) : (
                  <div
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all ${
                      dragging
                        ? "border-primary bg-primary/10"
                        : "border-base-300 hover:border-primary/50 hover:bg-base-300/50"
                    }`}
                  >
                    <HiUpload
                      className={`text-4xl transition-colors ${
                        dragging ? "text-primary" : "text-base-content/30"
                      }`}
                    />
                    <div className="text-center">
                      <p className="font-medium">
                        {dragging ? "Drop here" : "Click or drag to upload"}
                      </p>
                      <p className="text-xs text-base-content/50 mt-1">
                        JPEG, PNG, GIF, WebP, SVG
                      </p>
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept={ALLOWED.join(",")}
                      className="hidden"
                      onChange={onFileInput}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── URL input ── */}
            {inputMode === "url" && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Image URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="input input-bordered w-full"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  required={inputMode === "url"}
                />
              </div>
            )}

            {/* ── URL preview ── */}
            {inputMode === "url" && urlInput && (
              <div className="rounded-xl overflow-hidden bg-base-300 h-40">
                <img
                  src={urlInput}
                  alt="Preview"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}

            {/* ── Name ── */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Name</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="My awesome image"
                className="input input-bordered w-full"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            {/* ── Alt text ── */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Alt Text</span>
              </label>
              <input
                type="text"
                name="alt"
                placeholder="Description for accessibility"
                className="input input-bordered w-full"
                value={form.alt}
                onChange={handleChange}
              />
            </div>

            {/* ── Tags ── */}
            <TagsInput
              label="Tags"
              placeholder="Type and press Enter"
              data={allTags}
              value={form.tags}
              onChange={(val) => setForm((f) => ({ ...f, tags: val }))}
              splitChars={[","]}
              clearable
              comboboxProps={{ withinPortal: false }}
            />

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
                disabled={
                  submitting || (inputMode === "file" && !file && !editId)
                }
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : editId ? (
                  "Save Changes"
                ) : (
                  "Add Image"
                )}
              </button>
            </div>
          </form>
        </div>
        <div className="modal-backdrop bg-black/50" onClick={closeModal} />
      </dialog>

      {/* ══════════════════════════════════════════════════
          Delete Confirmation Modal
         ══════════════════════════════════════════════════ */}
      <dialog className={`modal ${deleteTarget ? "modal-open" : ""}`}>
        <div className="modal-box max-w-sm bg-base-200">
          <div className="flex flex-col items-center gap-3 text-center">
            <HiOutlineExclamationCircle className="text-5xl text-error" />
            <h3 className="font-bold text-lg">Delete Image?</h3>
            <p className="text-base-content/60">
              <span className="font-semibold">
                {deleteTarget?.name || "Untitled"}
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

      {/* ══════════════════════════════════════════════════
          Lightbox
         ══════════════════════════════════════════════════ */}
      {previewImg && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-4xl p-2 bg-base-100">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 z-10"
              onClick={() => setPreviewImg(null)}
            >
              <HiX className="text-xl" />
            </button>
            <figure className="rounded-xl overflow-hidden">
              <img
                src={previewImg.url}
                alt={previewImg.alt || previewImg.name}
                className="w-full max-h-[75vh] object-contain"
              />
            </figure>
            <div className="mt-3 px-2">
              <h4 className="font-bold">{previewImg.name || "Untitled"}</h4>
              {previewImg.alt && (
                <p className="text-sm text-base-content/60 mt-1">
                  {previewImg.alt}
                </p>
              )}
              {previewImg.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {previewImg.tags.map((tag) => (
                    <span key={tag} className="badge badge-primary badge-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div
            className="modal-backdrop bg-black/70"
            onClick={() => setPreviewImg(null)}
          />
        </dialog>
      )}
    </div>
  );
};

export default Images;

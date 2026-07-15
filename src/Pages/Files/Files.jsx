import { useState, useEffect, useCallback, useRef } from "react";
import { Navigate } from "react-router";
import { toast } from "react-toastify";
import {
  HiPlus,
  HiDocument,
  HiPencil,
  HiTrash,
  HiX,
  HiTag,
  HiSearch,
  HiOutlineExclamationCircle,
  HiUpload,
  HiLink,
  HiDownload,
  HiEye,
  HiDocumentText,
  HiPhotograph,
  HiVideoCamera,
  HiMusicNote,
  HiCode,
  HiArchive,
} from "react-icons/hi";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import { uploadToStorage } from "../../lib/upload";

const EMPTY_FORM = { name: "", tags: "" };
const ALLOWED = [
  "application/pdf",
  "text/plain",
  "text/csv",
  "text/html",
  "text/css",
  "text/javascript",
  "application/json",
  "application/javascript",
  "application/xml",
  "application/zip",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  "application/gzip",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
];

const getFileIcon = (name, type) => {
  const ext = name?.split(".").pop()?.toLowerCase() || "";
  if (
    type?.startsWith("image/") ||
    ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(ext)
  )
    return HiPhotograph;
  if (
    type?.startsWith("video/") ||
    ["mp4", "webm", "mov", "avi", "mkv"].includes(ext)
  )
    return HiVideoCamera;
  if (
    type?.startsWith("audio/") ||
    ["mp3", "wav", "ogg", "flac", "aac"].includes(ext)
  )
    return HiMusicNote;
  if (["pdf"].includes(ext)) return HiDocumentText;
  if (
    [
      "js",
      "jsx",
      "ts",
      "tsx",
      "html",
      "css",
      "py",
      "java",
      "cpp",
      "c",
      "go",
      "rs",
      "php",
      "rb",
      "sh",
      "json",
      "xml",
      "yaml",
      "yml",
      "toml",
    ].includes(ext)
  )
    return HiCode;
  if (["zip", "rar", "7z", "gz", "tar", "bz2"].includes(ext)) return HiArchive;
  return HiDocument;
};

const getFileColor = (name, type) => {
  const ext = name?.split(".").pop()?.toLowerCase() || "";
  if (
    type?.startsWith("image/") ||
    ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)
  )
    return "text-success";
  if (type?.startsWith("video/") || ["mp4", "webm", "mov"].includes(ext))
    return "text-error";
  if (type?.startsWith("audio/") || ["mp3", "wav", "ogg"].includes(ext))
    return "text-secondary";
  if (["pdf"].includes(ext)) return "text-error";
  if (["js", "jsx", "ts", "tsx"].includes(ext)) return "text-warning";
  if (["py", "java", "cpp", "go", "rs"].includes(ext)) return "text-info";
  if (["zip", "rar", "7z", "gz"].includes(ext)) return "text-accent";
  return "text-base-content/60";
};

const formatSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isPreviewable = (name, type) => {
  const ext = name?.split(".").pop()?.toLowerCase() || "";
  if (type?.startsWith("image/")) return true;
  if (type?.startsWith("video/")) return true;
  if (["pdf"].includes(ext)) return true;
  if (
    type?.startsWith("text/") ||
    [
      "json",
      "js",
      "jsx",
      "ts",
      "tsx",
      "html",
      "css",
      "py",
      "java",
      "cpp",
      "xml",
      "yaml",
      "yml",
      "md",
      "sh",
      "sql",
      "csv",
      "log",
      "env",
      "gitignore",
      "toml",
      "cfg",
      "ini",
      "txt",
    ].includes(ext)
  )
    return true;
  return false;
};

const Files = () => {
  const { user } = useAuth();
  const app = useAxios();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterTag, setFilterTag] = useState("");
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Upload state
  const [inputMode, setInputMode] = useState("file");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  // ── Fetch files ──
  const fetchFiles = useCallback(async () => {
    try {
      const { data } = await app.get("files");
      if (data.success) setFiles(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load files");
    } finally {
      setLoading(false);
    }
  }, [app]);

  useEffect(() => {
    const fun = () => {
      fetchFiles();
    };
    fun();
  }, [fetchFiles]);

  // ── Derived data ──
  const allTags = [...new Set(files.flatMap((f) => f.tags || []))];

  const filtered = files.filter((f) => {
    const matchTag = !filterTag || (f.tags || []).includes(filterTag);
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      f.name?.toLowerCase().includes(q) ||
      (f.tags || []).some((t) => t.toLowerCase().includes(q));
    return matchTag && matchSearch;
  });

  // ── Modal helpers ──
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFile(null);
    setFileName("");
    setUrlInput("");
    setInputMode("file");
  };

  const openCreate = () => {
    setEditId(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (f) => {
    setEditId(f._id);
    setForm({ name: f.name || "", tags: (f.tags || []).join(", ") });
    setUrlInput(f.url || "");
    setFile(null);
    setFileName("");
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
    if (!ALLOWED.includes(f.type) && !f.type.startsWith("text/")) {
      toast.error("File type not supported");
      return false;
    }
    return true;
  };

  const handleFile = (f) => {
    if (!f || !validateFile(f)) return;
    setFile(f);
    setFileName(f.name);
    setInputMode("file");
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
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setUploadProgress(0);

    try {
      let fileUrl = urlInput.trim();

      if (inputMode === "file" && file) {
        toast.info("Uploading file...");
        fileUrl = await uploadToStorage(app, file, setUploadProgress, "file");
      }

      if (!fileUrl) {
        toast.error("Please upload a file or provide a URL");
        setSubmitting(false);
        return;
      }

      const payload = {
        url: fileUrl,
        name: form.name.trim() || file?.name || fileName || "Untitled",
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (editId) {
        const { data } = await app.patch(`files/${editId}`, payload);
        if (data.success) {
          setFiles((prev) =>
            prev.map((f) => (f._id === editId ? data.data : f)),
          );
          toast.success("File updated");
        }
      } else {
        const { data } = await app.post("files", payload);
        if (data.success) {
          setFiles((prev) => [data.data, ...prev]);
          toast.success("File added");
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
      const { data } = await app.delete(`files/${deleteTarget._id}`);
      if (data.success) {
        setFiles((prev) => prev.filter((f) => f._id !== deleteTarget._id));
        toast.success("File deleted");
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
              <div className="skeleton h-32 rounded-t-xl" />
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
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="py-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Files</h1>
          <p className="text-base-content/60 mt-1">
            {files.length} file{files.length !== 1 && "s"} in your collection
          </p>
        </div>
        <button
          className="btn btn-primary gap-2 rounded-lg"
          onClick={openCreate}
        >
          <HiPlus className="text-xl" />
          Add File
        </button>
      </div>

      {/* ── Filters ── */}
      {files.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="input input-bordered flex items-center gap-2 flex-1 max-w-sm focus-within:ring-2 focus-within:ring-primary">
            <HiSearch className="text-lg opacity-60 shrink-0" />
            <input
              type="text"
              placeholder="Search files..."
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

          {allTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <HiTag className="text-lg opacity-60 shrink-0" />
              <button
                className={`badge badge-lg cursor-pointer transition-all ${
                  !filterTag
                    ? "badge-primary"
                    : "badge-ghost hover:badge-outline"
                }`}
                onClick={() => setFilterTag("")}
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
                  onClick={() => setFilterTag(filterTag === tag ? "" : tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Empty state ── */}
      {files.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <HiDocument className="text-7xl text-base-content/20" />
          <h3 className="text-xl font-semibold">No files yet</h3>
          <p className="text-base-content/50 max-w-sm">
            Start building your collection by adding your first file.
          </p>
          <button
            className="btn btn-primary gap-2 rounded-lg"
            onClick={openCreate}
          >
            <HiPlus className="text-xl" />
            Add First File
          </button>
        </div>
      )}

      {/* ── No results ── */}
      {files.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <HiSearch className="text-5xl text-base-content/20" />
          <p className="text-base-content/60">No files match your search.</p>
        </div>
      )}

      {/* ── File Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((f) => {
          const Icon = getFileIcon(f.name);
          const color = getFileColor(f.name);

          return (
            <div
              key={f._id}
              className="card bg-base-200 shadow-md hover:shadow-xl transition-all duration-300 group"
            >
              {/* File icon area */}
              <figure className="relative h-32 overflow-hidden bg-base-300 flex items-center justify-center">
                <Icon className={`text-5xl ${color}`} />

                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {isPreviewable(f.name) && (
                    <button
                      className="btn btn-circle btn-sm bg-base-200/90 hover:bg-base-100"
                      onClick={() => setPreviewFile(f)}
                      aria-label="Preview"
                    >
                      <HiEye className="text-lg" />
                    </button>
                  )}
                  <a
                    href={f.url}
                    download={f.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-circle btn-sm bg-base-200/90 hover:bg-base-100"
                    aria-label="Download"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <HiDownload className="text-lg" />
                  </a>
                </div>
              </figure>

              <div className="card-body p-4">
                <h3 className="card-title text-sm truncate">
                  {f.name || "Untitled"}
                </h3>
                {f.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {f.tags.map((tag) => (
                      <span key={tag} className="badge badge-outline badge-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="card-actions justify-end mt-2">
                  <button
                    className="btn btn-ghost btn-xs gap-1"
                    onClick={() => openEdit(f)}
                  >
                    <HiPencil className="text-sm" />
                    Edit
                  </button>
                  <button
                    className="btn btn-ghost btn-xs gap-1 text-error"
                    onClick={() => setDeleteTarget(f)}
                  >
                    <HiTrash className="text-sm" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
            {editId ? "Edit File" : "Add File"}
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* ── Source mode toggle ── */}
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
                {fileName ? (
                  <>
                    <div className="relative rounded-xl bg-base-300 p-4 flex items-center gap-3">
                      {(() => {
                        const Icon = getFileIcon(fileName);
                        const color = getFileColor(fileName);
                        return (
                          <Icon className={`text-3xl shrink-0 ${color}`} />
                        );
                      })()}
                      <div className="flex-1 truncate">
                        <p className="font-medium truncate">{fileName}</p>
                        <p className="text-xs text-base-content/50">
                          {formatSize(file?.size)}
                        </p>
                      </div>
                      {submitting && uploadProgress > 0 && (
                        <span className="text-sm font-medium text-primary">
                          {uploadProgress}%
                        </span>
                      )}
                      {!submitting && (
                        <button
                          type="button"
                          className="btn btn-circle btn-sm btn-error"
                          onClick={clearFile}
                        >
                          <HiX className="text-lg" />
                        </button>
                      )}
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
                        PDF, DOCX, XLSX, TXT, ZIP, images, videos, and more
                      </p>
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
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
                  <span className="label-text font-medium">File URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/document.pdf"
                  className="input input-bordered w-full"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  required={inputMode === "url"}
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
                placeholder="My document"
                className="input input-bordered w-full"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            {/* ── Tags ── */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Tags</span>
                <span className="label-text-alt text-base-content/50">
                  comma separated
                </span>
              </label>
              <input
                type="text"
                name="tags"
                placeholder="work, project, docs"
                className="input input-bordered w-full"
                value={form.tags}
                onChange={handleChange}
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
                disabled={
                  submitting || (inputMode === "file" && !file && !editId)
                }
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : editId ? (
                  "Save Changes"
                ) : (
                  "Add File"
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
            <h3 className="font-bold text-lg">Delete File?</h3>
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
          File Preview Modal
         ══════════════════════════════════════════════════ */}
      {previewFile && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-4xl p-2 bg-base-100">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 z-10"
              onClick={() => setPreviewFile(null)}
            >
              <HiX className="text-xl" />
            </button>

            {(() => {
              const ext =
                previewFile.name?.split(".").pop()?.toLowerCase() || "";
              // const type = previewFile.url;

              // Image preview
              if (
                previewFile.url.match(
                  /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?|$)/i,
                )
              ) {
                return (
                  <figure className="rounded-xl overflow-hidden">
                    <img
                      src={previewFile.url}
                      alt={previewFile.name}
                      className="w-full max-h-[70vh] object-contain"
                    />
                  </figure>
                );
              }

              // Video preview
              if (previewFile.url.match(/\.(mp4|webm|ogg|mov|avi)(\?|$)/i)) {
                return (
                  <video
                    src={previewFile.url}
                    className="w-full rounded-xl"
                    controls
                    autoPlay
                  />
                );
              }

              // PDF preview
              if (ext === "pdf") {
                return (
                  <iframe
                    src={previewFile.url}
                    className="w-full h-[75vh] rounded-xl"
                    title={previewFile.name}
                  />
                );
              }

              // Text / code preview
              return (
                <div className="overflow-auto max-h-[75vh]">
                  <pre className="text-sm p-4 bg-base-300 rounded-xl overflow-auto">
                    <code>Loading preview not available. </code>
                  </pre>
                  <div className="flex justify-center mt-4">
                    <a
                      href={previewFile.url}
                      download={previewFile.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary gap-2"
                    >
                      <HiDownload className="text-lg" />
                      Download to View
                    </a>
                  </div>
                </div>
              );
            })()}

            <div className="mt-3 px-2">
              <h4 className="font-bold">{previewFile.name || "Untitled"}</h4>
              {previewFile.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {previewFile.tags.map((tag) => (
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
            onClick={() => setPreviewFile(null)}
          />
        </dialog>
      )}
    </div>
  );
};

export default Files;

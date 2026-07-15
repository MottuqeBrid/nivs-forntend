import { useState, useEffect, useCallback, useRef } from "react";
import { Navigate } from "react-router";
import { toast } from "react-toastify";
import {
  HiPlus,
  HiVideoCamera,
  HiPencil,
  HiTrash,
  HiX,
  HiPlay,
  HiTag,
  HiSearch,
  HiOutlineExclamationCircle,
  HiUpload,
  HiLink,
} from "react-icons/hi";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import { uploadToStorage } from "../../lib/upload";

const EMPTY_FORM = { name: "", tags: "" };
const ALLOWED = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-msvideo",
];

const extractEmbedUrl = (url) => {
  if (!url) return null;
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
};

const isDirectVideo = (url) => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|avi)(\?|$)/i.test(url);
};

const Videos = () => {
  const { user } = useAuth();
  const app = useAxios();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [playerVideo, setPlayerVideo] = useState(null);
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

  // ── Fetch videos ──
  const fetchVideos = useCallback(async () => {
    try {
      const { data } = await app.get("videos");
      if (data.success) setVideos(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load videos");
    } finally {
      setLoading(false);
    }
  }, [app]);

  useEffect(() => {
    const fun = async () => {
      await fetchVideos();
    };
    fun();
  }, [fetchVideos]);

  // ── Derived data ──
  const allTags = [...new Set(videos.flatMap((v) => v.tags || []))];

  const filtered = videos.filter((v) => {
    const matchTag = !filterTag || (v.tags || []).includes(filterTag);
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      v.name?.toLowerCase().includes(q) ||
      (v.tags || []).some((t) => t.toLowerCase().includes(q));
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

  const openEdit = (v) => {
    setEditId(v._id);
    setForm({ name: v.name || "", tags: (v.tags || []).join(", ") });
    setUrlInput(v.url || "");
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
    if (!ALLOWED.includes(f.type)) {
      toast.error("Only MP4, WebM, OGG, MOV, AVI allowed");
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
      let videoUrl = urlInput.trim();

      if (inputMode === "file" && file) {
        toast.info("Uploading video...");
        videoUrl = await uploadToStorage(app, file, setUploadProgress);
      }

      if (!videoUrl) {
        toast.error("Please upload a file or provide a video URL");
        setSubmitting(false);
        return;
      }

      const payload = {
        url: videoUrl,
        name: form.name.trim(),
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (editId) {
        const { data } = await app.patch(`videos/${editId}`, payload);
        if (data.success) {
          setVideos((prev) =>
            prev.map((v) => (v._id === editId ? data.data : v)),
          );
          toast.success("Video updated");
        }
      } else {
        const { data } = await app.post("videos", payload);
        if (data.success) {
          setVideos((prev) => [data.data, ...prev]);
          toast.success("Video added");
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
      const { data } = await app.delete(`videos/${deleteTarget._id}`);
      if (data.success) {
        setVideos((prev) => prev.filter((v) => v._id !== deleteTarget._id));
        toast.success("Video deleted");
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
          <h1 className="text-3xl font-bold">Videos</h1>
          <p className="text-base-content/60 mt-1">
            {videos.length} video{videos.length !== 1 && "s"} in your collection
          </p>
        </div>
        <button
          className="btn btn-primary gap-2 rounded-lg"
          onClick={openCreate}
        >
          <HiPlus className="text-xl" />
          Add Video
        </button>
      </div>

      {/* ── Filters ── */}
      {videos.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="input input-bordered flex items-center gap-2 flex-1 max-w-sm focus-within:ring-2 focus-within:ring-primary">
            <HiSearch className="text-lg opacity-60 shrink-0" />
            <input
              type="text"
              placeholder="Search videos..."
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
      {videos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <HiVideoCamera className="text-7xl text-base-content/20" />
          <h3 className="text-xl font-semibold">No videos yet</h3>
          <p className="text-base-content/50 max-w-sm">
            Start building your collection by adding your first video.
          </p>
          <button
            className="btn btn-primary gap-2 rounded-lg"
            onClick={openCreate}
          >
            <HiPlus className="text-xl" />
            Add First Video
          </button>
        </div>
      )}

      {/* ── No results ── */}
      {videos.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <HiSearch className="text-5xl text-base-content/20" />
          <p className="text-base-content/60">No videos match your search.</p>
        </div>
      )}

      {/* ── Video Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((v) => {
          const embedUrl = extractEmbedUrl(v.url);
          const direct = isDirectVideo(v.url);

          return (
            <div
              key={v._id}
              className="card bg-base-200 shadow-md hover:shadow-xl transition-all duration-300 group"
            >
              <figure className="relative h-48 overflow-hidden bg-base-300">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title={v.name}
                  />
                ) : direct ? (
                  <video
                    src={v.url}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    muted
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <HiVideoCamera className="text-4xl text-base-content/20" />
                  </div>
                )}

                <button
                  className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
                  onClick={() => setPlayerVideo(v)}
                  aria-label="Play video"
                >
                  <div className="bg-primary/90 rounded-full p-4 shadow-lg">
                    <HiPlay className="text-2xl text-primary-content ml-0.5" />
                  </div>
                </button>
              </figure>

              <div className="card-body p-4">
                <h3 className="card-title text-sm truncate">
                  {v.name || "Untitled"}
                </h3>
                {v.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {v.tags.map((tag) => (
                      <span key={tag} className="badge badge-outline badge-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="card-actions justify-end mt-2">
                  <button
                    className="btn btn-ghost btn-xs gap-1"
                    onClick={() => openEdit(v)}
                  >
                    <HiPencil className="text-sm" />
                    Edit
                  </button>
                  <button
                    className="btn btn-ghost btn-xs gap-1 text-error"
                    onClick={() => setDeleteTarget(v)}
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
            {editId ? "Edit Video" : "Add Video"}
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
                      <HiVideoCamera className="text-3xl text-primary shrink-0" />
                      <div className="flex-1 truncate">
                        <p className="font-medium truncate">{fileName}</p>
                        <p className="text-xs text-base-content/50">
                          {(file?.size / (1024 * 1024)).toFixed(1)} MB
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
                        MP4, WebM, OGG, MOV, AVI
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
                  <span className="label-text font-medium">Video URL</span>
                </label>
                <input
                  type="url"
                  placeholder="YouTube, Vimeo, or direct video URL"
                  className="input input-bordered w-full"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  required={inputMode === "url"}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Supports YouTube, Vimeo, and direct video links
                  </span>
                </label>
              </div>
            )}

            {/* ── URL preview ── */}
            {inputMode === "url" && urlInput && (
              <div className="rounded-xl overflow-hidden bg-base-300 h-48">
                {extractEmbedUrl(urlInput) ? (
                  <iframe
                    src={extractEmbedUrl(urlInput)}
                    className="w-full h-full"
                    allowFullScreen
                    title="Preview"
                  />
                ) : (
                  <video
                    src={urlInput}
                    className="w-full h-full object-contain"
                    controls
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
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
                placeholder="My awesome video"
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
                placeholder="tutorial, coding, react"
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
                  "Add Video"
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
            <h3 className="font-bold text-lg">Delete Video?</h3>
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
          Video Player Modal
         ══════════════════════════════════════════════════ */}
      {playerVideo && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-4xl p-2 bg-base-100">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 z-10"
              onClick={() => setPlayerVideo(null)}
            >
              <HiX className="text-xl" />
            </button>

            {extractEmbedUrl(playerVideo.url) ? (
              <iframe
                src={extractEmbedUrl(playerVideo.url)}
                className="w-full aspect-video rounded-xl"
                allowFullScreen
                title={playerVideo.name}
              />
            ) : (
              <video
                src={playerVideo.url}
                className="w-full rounded-xl"
                controls
                autoPlay
              />
            )}

            <div className="mt-3 px-2">
              <h4 className="font-bold">{playerVideo.name || "Untitled"}</h4>
              {playerVideo.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {playerVideo.tags.map((tag) => (
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
            onClick={() => setPlayerVideo(null)}
          />
        </dialog>
      )}
    </div>
  );
};

export default Videos;

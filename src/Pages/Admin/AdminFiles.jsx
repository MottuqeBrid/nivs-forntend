import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  HiDocument,
  HiSearch,
  HiX,
  HiEye,
  HiUser,
  HiDownload,
  HiPhotograph,
  HiCode,
  HiArchive,
  HiVolumeUp,
  HiVideoCamera,
} from "react-icons/hi";
import useAxios from "../../hooks/useAxios";
import Pagination from "../../component/Pagination/Pagination";

const getFileIcon = (name) => {
  const ext = name?.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
    return HiPhotograph;
  if (["js", "ts", "jsx", "tsx", "py", "java", "cpp", "c", "html", "css"].includes(ext))
    return HiCode;
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return HiArchive;
  if (["mp3", "wav", "ogg", "flac"].includes(ext)) return HiVolumeUp;
  if (["mp4", "webm", "avi", "mov"].includes(ext)) return HiVideoCamera;
  return HiDocument;
};

const getFileColor = (name) => {
  const ext = name?.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
    return "text-success";
  if (["js", "ts", "jsx", "tsx", "py", "java", "cpp", "c", "html", "css"].includes(ext))
    return "text-warning";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "text-secondary";
  if (["mp3", "wav", "ogg", "flac"].includes(ext)) return "text-accent";
  if (["mp4", "webm", "avi", "mov"].includes(ext)) return "text-error";
  return "text-base-content/40";
};

const AdminFiles = () => {
  const app = useAxios();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [preview, setPreview] = useState(null);

  const fetchFiles = useCallback(async () => {
    try {
      const { data } = await app.get("admin/all-files");
      if (data.success) setFiles(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load files");
    } finally {
      setLoading(false);
    }
  }, [app]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const filtered = files.filter((f) => {
    const q = search.toLowerCase();
    return (
      !q ||
      f.name?.toLowerCase().includes(q) ||
      f.url?.toLowerCase().includes(q) ||
      f.user?.name?.toLowerCase().includes(q) ||
      f.user?.email?.toLowerCase().includes(q) ||
      (f.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "name-asc") return (a.name || "").localeCompare(b.name || "");
    if (sort === "name-desc") return (b.name || "").localeCompare(a.name || "");
    if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const paginated = sorted.slice((page - 1) * perPage, page * perPage);
  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handlePerPage = (val) => { setPerPage(val); setPage(1); };

  if (loading) {
    return (
      <div className="py-8">
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card bg-base-200 shadow">
              <div className="skeleton h-48 rounded-t-xl" />
              <div className="card-body p-4 gap-2">
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-4 w-1/2" />
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
            <HiDocument className="text-primary" />
            All Files
          </h1>
          <p className="text-base-content/60 mt-1">
            {files.length} file{files.length !== 1 && "s"} across all users
          </p>
        </div>
        <div className="input input-bordered flex items-center gap-2 w-full sm:w-80 focus-within:ring-2 focus-within:ring-primary">
          <HiSearch className="text-lg opacity-60 shrink-0" />
          <input
            type="text"
            placeholder="Search files..."
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
      </div>

      {/* Empty */}
      {files.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <HiDocument className="text-7xl text-base-content/20" />
          <h3 className="text-xl font-semibold">No files yet</h3>
          <p className="text-base-content/50 max-w-sm">
            Files uploaded by users will appear here.
          </p>
        </div>
      )}

      {/* No results */}
      {files.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <HiSearch className="text-5xl text-base-content/20" />
          <p className="text-base-content/60">No files match your search.</p>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map((file) => {
            const FileIcon = getFileIcon(file.name);
            const iconColor = getFileColor(file.name);
            const ext = file.name?.split(".").pop()?.toLowerCase() || "";

            return (
              <div
                key={file._id}
                className={`card shadow-md hover:shadow-xl transition-all duration-300 group ${file.isDeleted ? "bg-base-200/50 opacity-60" : "bg-base-200"}`}
              >
                <figure className="relative h-48 overflow-hidden bg-base-300 flex items-center justify-center">
                  {ext.match(/^(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : ext.match(/^(mp4|webm|ogg)$/i) ? (
                    <video
                      src={file.url}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                  ) : ext === "pdf" ? (
                    <iframe
                      src={file.url}
                      className="w-full h-full"
                      title={file.name}
                    />
                  ) : (
                    <FileIcon className={`text-6xl ${iconColor}`} />
                  )}
                  {file.isDeleted && (
                    <div className="absolute top-2 left-2 badge badge-error badge-sm shadow z-10">
                      Deleted
                    </div>
                  )}
                  <button
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
                    onClick={() => setPreview({ file, ext })}
                  >
                    <HiEye className="text-3xl text-white drop-shadow-lg" />
                  </button>
                </figure>

                <div className="card-body p-4">
                  <h3 className="card-title text-sm truncate">
                    {file.name || "Unnamed"}
                  </h3>
                  {file.user && (
                    <p className="text-xs text-base-content/50 flex items-center gap-1 truncate">
                      <HiUser className="text-xs shrink-0" />
                      {file.user.name || file.user.email}
                    </p>
                  )}
                  {file.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {file.tags.map((tag) => (
                        <span key={tag} className="badge badge-outline badge-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="card-actions justify-end mt-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-xs gap-1"
                    >
                      <HiDownload className="text-sm" />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <Pagination
          page={page}
          perPage={perPage}
          total={filtered.length}
          onPageChange={setPage}
          onPerPageChange={handlePerPage}
        />
      )}

      {/* Preview Modal */}
      {preview && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-4xl p-2 bg-base-100">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 z-10"
              onClick={() => setPreview(null)}
            >
              <HiX className="text-xl" />
            </button>
            {preview.ext.match(/^(jpg|jpeg|png|gif|webp|svg)$/i) ? (
              <figure className="rounded-xl overflow-hidden">
                <img
                  src={preview.file.url}
                  alt={preview.file.name}
                  className="w-full max-h-[75vh] object-contain"
                />
              </figure>
            ) : preview.ext.match(/^(mp4|webm|ogg)$/i) ? (
              <div className="rounded-xl overflow-hidden">
                <video
                  src={preview.file.url}
                  controls
                  className="w-full max-h-[75vh]"
                />
              </div>
            ) : preview.ext === "pdf" ? (
              <div className="rounded-xl overflow-hidden">
                <iframe
                  src={preview.file.url}
                  className="w-full aspect-video"
                  title={preview.file.name}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                {(() => {
                  const Icon = getFileIcon(preview.file.name);
                  const color = getFileColor(preview.file.name);
                  return <Icon className={`text-7xl ${color}`} />;
                })()}
                <p className="text-base-content/60">
                  Preview not available for this file type.
                </p>
                <a
                  href={preview.file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary gap-2"
                >
                  <HiDownload className="text-lg" />
                  Download
                </a>
              </div>
            )}
            <div className="mt-3 px-2">
              <h4 className="font-bold">{preview.file.name || "Unnamed"}</h4>
              {preview.file.user && (
                <p className="text-sm text-base-content/60 mt-1">
                  Uploaded by{" "}
                  {preview.file.user.name || preview.file.user.email}
                </p>
              )}
            </div>
          </div>
          <div
            className="modal-backdrop bg-black/70"
            onClick={() => setPreview(null)}
          />
        </dialog>
      )}
    </div>
  );
};

export default AdminFiles;

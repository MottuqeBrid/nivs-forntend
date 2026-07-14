import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  HiCloudUpload,
  HiSearch,
  HiEye,
  HiX,
  HiPhotograph,
  HiVideoCamera,
  HiDocument,
  HiDownload,
  HiCalendar,
} from "react-icons/hi";
import useAxios from "../../hooks/useAxios";

const AdminUploads = () => {
  const app = useAxios();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(null);

  const fetchUploads = useCallback(async () => {
    try {
      const { data } = await app.get("admin/uploads");
      if (data.success) setUploads(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load uploads");
    } finally {
      setLoading(false);
    }
  }, [app]);

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads]);

  const filtered = uploads.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.originalName?.toLowerCase().includes(q) ||
      u.url?.toLowerCase().includes(q) ||
      u.user?.name?.toLowerCase().includes(q) ||
      u.user?.email?.toLowerCase().includes(q)
    );
  });

  const getTypeIcon = (type) => {
    if (!type || type.length === 0) return HiDocument;
    const t = type[0]?.toLowerCase() || "";
    if (t.includes("image")) return HiPhotograph;
    if (t.includes("video")) return HiVideoCamera;
    return HiDocument;
  };

  const getTypeColor = (type) => {
    if (!type || type.length === 0) return "text-base-content/40";
    const t = type[0]?.toLowerCase() || "";
    if (t.includes("image")) return "text-success";
    if (t.includes("video")) return "text-error";
    return "text-warning";
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card bg-base-200">
              <div className="skeleton h-40 rounded-t-xl" />
              <div className="card-body p-4 gap-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
                <div className="skeleton h-3 w-1/3" />
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
            <HiCloudUpload className="text-primary" />
            Uploads
          </h1>
          <p className="text-base-content/60 mt-1">
            {uploads.length} file{uploads.length !== 1 && "s"} uploaded across
            all users
          </p>
        </div>
        <div className="input input-bordered flex items-center gap-2 w-full sm:w-80 focus-within:ring-2 focus-within:ring-primary">
          <HiSearch className="text-lg opacity-60 shrink-0" />
          <input
            type="text"
            placeholder="Search uploads..."
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
      {uploads.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <HiCloudUpload className="text-7xl text-base-content/20" />
          <h3 className="text-xl font-semibold">No uploads yet</h3>
          <p className="text-base-content/50 max-w-sm">
            Files uploaded by users will appear here.
          </p>
        </div>
      )}

      {/* No results */}
      {uploads.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <HiSearch className="text-5xl text-base-content/20" />
          <p className="text-base-content/60">No uploads match your search.</p>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((upload) => {
            const TypeIcon = getTypeIcon(upload.type);
            const typeColor = getTypeColor(upload.type);
            const isImage =
              upload.type?.some((t) => t.includes("image")) ||
              upload.url?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
            const isVideo =
              upload.type?.some((t) => t.includes("video")) ||
              upload.url?.match(/\.(mp4|webm|ogg)$/i);

            return (
              <div
                key={upload._id}
                className="card bg-base-200 shadow-md hover:shadow-xl transition-all duration-300 group"
              >
                <figure className="relative h-40 overflow-hidden bg-base-300">
                  {isImage ? (
                    <img
                      src={upload.url}
                      alt={upload.originalName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : isVideo ? (
                    <video
                      src={upload.url}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <TypeIcon className={`text-5xl ${typeColor}`} />
                    </div>
                  )}
                  <button
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
                    onClick={() =>
                      setPreview({ type: isImage ? "image" : isVideo ? "video" : "file", upload })
                    }
                  >
                    <HiEye className="text-3xl text-white drop-shadow-lg" />
                  </button>
                </figure>

                <div className="card-body p-4">
                  <h3 className="card-title text-sm truncate">
                    {upload.originalName || "Unnamed"}
                  </h3>
                  {upload.user && (
                    <p className="text-xs text-base-content/50 truncate">
                      by {upload.user.name || upload.user.email}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-base-content/40 mt-1">
                    {upload.type?.[0] && (
                      <span className="flex items-center gap-1">
                        <TypeIcon className={`text-xs ${typeColor}`} />
                        {upload.type[0].split("/").pop()}
                      </span>
                    )}
                    {upload.createdAt && (
                      <span className="flex items-center gap-1">
                        <HiCalendar className="text-xs" />
                        {formatDate(upload.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="card-actions justify-end mt-2">
                    <a
                      href={upload.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-xs gap-1"
                    >
                      <HiDownload className="text-sm" />
                      Open
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
            {preview.type === "image" && (
              <figure className="rounded-xl overflow-hidden">
                <img
                  src={preview.upload.url}
                  alt={preview.upload.originalName}
                  className="w-full max-h-[75vh] object-contain"
                />
              </figure>
            )}
            {preview.type === "video" && (
              <div className="rounded-xl overflow-hidden">
                <video
                  src={preview.upload.url}
                  controls
                  className="w-full max-h-[75vh]"
                />
              </div>
            )}
            {preview.type === "file" && (
              <div className="rounded-xl overflow-hidden">
                {preview.upload.url?.match(/\.pdf$/i) ? (
                  <iframe
                    src={preview.upload.url}
                    className="w-full aspect-video"
                    title={preview.upload.originalName}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <HiDocument className="text-7xl text-base-content/30" />
                    <p className="text-base-content/60">
                      Preview not available for this file type.
                    </p>
                    <a
                      href={preview.upload.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary gap-2"
                    >
                      <HiDownload className="text-lg" />
                      Download
                    </a>
                  </div>
                )}
              </div>
            )}
            <div className="mt-3 px-2">
              <h4 className="font-bold">
                {preview.upload.originalName || "Unnamed"}
              </h4>
              {preview.upload.user && (
                <p className="text-sm text-base-content/60">
                  Uploaded by {preview.upload.user.name || preview.upload.user.email}
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

export default AdminUploads;

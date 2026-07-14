import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  HiVideoCamera,
  HiSearch,
  HiX,
  HiEye,
  HiUser,
} from "react-icons/hi";
import useAxios from "../../hooks/useAxios";

const AdminVideos = () => {
  const app = useAxios();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [previewVideo, setPreviewVideo] = useState(null);

  const fetchVideos = useCallback(async () => {
    try {
      const { data } = await app.get("admin/all-videos");
      if (data.success) setVideos(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load videos");
    } finally {
      setLoading(false);
    }
  }, [app]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const filtered = videos.filter((v) => {
    const q = search.toLowerCase();
    return (
      !q ||
      v.name?.toLowerCase().includes(q) ||
      v.url?.toLowerCase().includes(q) ||
      v.user?.name?.toLowerCase().includes(q) ||
      v.user?.email?.toLowerCase().includes(q) ||
      (v.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  });

  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const id = url.includes("youtu.be")
        ? url.split("/").pop()
        : new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("vimeo.com")) {
      const id = url.split("/").pop();
      return `https://player.vimeo.com/video/${id}`;
    }
    return null;
  };

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
            <HiVideoCamera className="text-primary" />
            All Videos
          </h1>
          <p className="text-base-content/60 mt-1">
            {videos.length} video{videos.length !== 1 && "s"} across all users
          </p>
        </div>
        <div className="input input-bordered flex items-center gap-2 w-full sm:w-80 focus-within:ring-2 focus-within:ring-primary">
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
      </div>

      {/* Empty */}
      {videos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <HiVideoCamera className="text-7xl text-base-content/20" />
          <h3 className="text-xl font-semibold">No videos yet</h3>
          <p className="text-base-content/50 max-w-sm">
            Videos uploaded by users will appear here.
          </p>
        </div>
      )}

      {/* No results */}
      {videos.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <HiSearch className="text-5xl text-base-content/20" />
          <p className="text-base-content/60">No videos match your search.</p>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((vid) => {
            const embedUrl = getEmbedUrl(vid.url);
            return (
              <div
                key={vid._id}
                className={`card shadow-md hover:shadow-xl transition-all duration-300 group ${vid.isDeleted ? "bg-base-200/50 opacity-60" : "bg-base-200"}`}
              >
                <figure className="relative h-48 overflow-hidden bg-base-300">
                  {embedUrl ? (
                    <iframe
                      src={embedUrl}
                      className="w-full h-full"
                      allowFullScreen
                      title={vid.name}
                    />
                  ) : (
                    <video
                      src={vid.url}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                  )}
                  {vid.isDeleted && (
                    <div className="absolute top-2 left-2 badge badge-error badge-sm shadow z-10">
                      Deleted
                    </div>
                  )}
                  <button
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
                    onClick={() => setPreviewVideo(vid)}
                  >
                    <HiEye className="text-3xl text-white drop-shadow-lg" />
                  </button>
                </figure>

                <div className="card-body p-4">
                  <h3 className="card-title text-sm truncate">
                    {vid.name || "Untitled"}
                  </h3>
                  {vid.user && (
                    <p className="text-xs text-base-content/50 flex items-center gap-1 truncate">
                      <HiUser className="text-xs shrink-0" />
                      {vid.user.name || vid.user.email}
                    </p>
                  )}
                  {vid.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {vid.tags.map((tag) => (
                        <span key={tag} className="badge badge-outline badge-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewVideo && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-4xl p-2 bg-base-100">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 z-10"
              onClick={() => setPreviewVideo(null)}
            >
              <HiX className="text-xl" />
            </button>
            {(() => {
              const embedUrl = getEmbedUrl(previewVideo.url);
              return embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="w-full aspect-video rounded-xl"
                  allowFullScreen
                  title={previewVideo.name}
                />
              ) : (
                <video
                  src={previewVideo.url}
                  controls
                  className="w-full max-h-[75vh] rounded-xl"
                />
              );
            })()}
            <div className="mt-3 px-2">
              <h4 className="font-bold">
                {previewVideo.name || "Untitled"}
              </h4>
              {previewVideo.user && (
                <p className="text-sm text-base-content/60 mt-1">
                  Uploaded by{" "}
                  {previewVideo.user.name || previewVideo.user.email}
                </p>
              )}
              {previewVideo.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {previewVideo.tags.map((tag) => (
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
            onClick={() => setPreviewVideo(null)}
          />
        </dialog>
      )}
    </div>
  );
};

export default AdminVideos;

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  HiPhotograph,
  HiSearch,
  HiX,
  HiEye,
  HiTag,
  HiUser,
} from "react-icons/hi";
import useAxios from "../../hooks/useAxios";
import Pagination from "../../component/Pagination/Pagination";

const AdminImages = () => {
  const app = useAxios();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [previewImg, setPreviewImg] = useState(null);

  const fetchImages = useCallback(async () => {
    try {
      const { data } = await app.get("admin/all-images");
      if (data.success) setImages(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load images");
    } finally {
      setLoading(false);
    }
  }, [app]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const allTags = [...new Set(images.flatMap((img) => img.tags || []))];

  const filtered = images.filter((img) => {
    const matchTag = !filterTag || (img.tags || []).includes(filterTag);
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      img.name?.toLowerCase().includes(q) ||
      img.alt?.toLowerCase().includes(q) ||
      img.user?.name?.toLowerCase().includes(q) ||
      img.user?.email?.toLowerCase().includes(q) ||
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
  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handleFilterTag = (val) => { setFilterTag(val); setPage(1); };
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
                <div className="skeleton h-6 w-20" />
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
            <HiPhotograph className="text-primary" />
            All Images
          </h1>
          <p className="text-base-content/60 mt-1">
            {images.length} image{images.length !== 1 && "s"} across all users
          </p>
        </div>
        <div className="input input-bordered flex items-center gap-2 w-full sm:w-80 focus-within:ring-2 focus-within:ring-primary">
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
      </div>
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-6">
          <HiTag className="text-lg opacity-60 shrink-0" />
          <button
            className={`badge badge-lg cursor-pointer transition-all ${
              !filterTag ? "badge-primary" : "badge-ghost hover:badge-outline"
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

      {/* Empty */}
      {images.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <HiPhotograph className="text-7xl text-base-content/20" />
          <h3 className="text-xl font-semibold">No images yet</h3>
          <p className="text-base-content/50 max-w-sm">
            Images uploaded by users will appear here.
          </p>
        </div>
      )}

      {/* No results */}
      {images.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <HiSearch className="text-5xl text-base-content/20" />
          <p className="text-base-content/60">No images match your search.</p>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map((img) => (
            <div
              key={img._id}
              className={`card shadow-md hover:shadow-xl transition-all duration-300 group ${img.isDeleted ? "bg-base-200/50 opacity-60" : "bg-base-200"}`}
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
                {img.isDeleted && (
                  <div className="absolute top-2 left-2 badge badge-error badge-sm shadow">
                    Deleted
                  </div>
                )}
                <button
                  className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
                  onClick={() => setPreviewImg(img)}
                >
                  <HiEye className="text-3xl text-white drop-shadow-lg" />
                </button>
              </figure>

              <div className="card-body p-4">
                <h3 className="card-title text-sm truncate">
                  {img.name || "Untitled"}
                </h3>
                {img.user && (
                  <p className="text-xs text-base-content/50 flex items-center gap-1 truncate">
                    <HiUser className="text-xs shrink-0" />
                    {img.user.name || img.user.email}
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
              </div>
            </div>
          ))}
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

      {/* Lightbox */}
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
              {previewImg.user && (
                <p className="text-sm text-base-content/60 mt-1">
                  Uploaded by {previewImg.user.name || previewImg.user.email}
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

export default AdminImages;

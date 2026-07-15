import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router";
import { toast } from "react-toastify";
import {
  HiArrowLeft,
  HiUser,
  HiPhotograph,
  HiVideoCamera,
  HiDocument,
  HiCalendar,
  HiEye,
  HiDownload,
  HiX,
  HiMail,
  HiIdentification,
  HiClock,
  HiCheckCircle,
  HiTrash,
  HiPencil,
  HiDocumentText,
  HiExclamationCircle,
} from "react-icons/hi";
import useAxios from "../../hooks/useAxios";

const TABS = [
  { key: "images", label: "Images", icon: HiPhotograph },
  { key: "videos", label: "Videos", icon: HiVideoCamera },
  { key: "files", label: "Files", icon: HiDocument },
  { key: "notes", label: "Notes", icon: HiDocumentText },
];

const AdminUserDetail = () => {
  const { id } = useParams();
  const app = useAxios();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("images");
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  // Edit states
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete states
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await app.get(`admin/${id}`);
      if (data.success) setUser(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  }, [app, id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUser();
  }, [fetchUser]);

  const fetchItems = useCallback(async () => {
    setItemsLoading(true);
    try {
      const { data } = await app.get(`admin/${id}/${activeTab}`);
      if (data.success) setItems(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load items");
      setItems([]);
    } finally {
      setItemsLoading(false);
    }
  }, [app, id, activeTab]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchItems();
  }, [activeTab, id, fetchItems]);

  const startEdit = () => {
    setEditName(user?.name || "");
    setEditEmail(user?.email || "");
    setEditRole(user?.role || "user");
    setEditing(true);
  };

  const saveUser = async () => {
    if (!editName.trim()) return toast.error("Name is required");
    if (!editEmail.trim()) return toast.error("Email is required");
    setSaving(true);
    try {
      const { data } = await app.patch(`admin/${id}`, {
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
      });
      if (data.success) {
        setUser(data.data);
        toast.success("User updated");
        setEditing(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async () => {
    setDeleting(true);
    try {
      const { data } = await app.delete(`admin/${id}`);
      if (data.success) {
        toast.success("User deleted");
        setDeleteConfirm(false);
        setUser((prev) => ({ ...prev, isDeleted: true }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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

  const roleColors = {
    admin: "badge-error",
    moderator: "badge-warning",
    user: "badge-primary",
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="skeleton h-6 w-24 mb-6" />
        <div className="flex items-center gap-4 mb-8">
          <div className="skeleton w-24 h-24 rounded-full" />
          <div className="flex flex-col gap-2">
            <div className="skeleton h-6 w-48" />
            <div className="skeleton h-4 w-64" />
            <div className="skeleton h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
        <div className="skeleton h-12 w-full mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card bg-base-200">
              <div className="skeleton h-40 rounded-t-xl" />
              <div className="card-body p-4 gap-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-8 text-center">
        <HiExclamationCircle className="text-6xl text-base-content/20 mx-auto mb-4" />
        <p className="text-base-content/60 mb-4">User not found.</p>
        <Link to="/admin/users" className="btn btn-primary rounded-lg">
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Back */}
      <Link to="/admin/users" className="btn btn-ghost btn-sm gap-1 mb-6">
        <HiArrowLeft className="text-lg" />
        Back to Users
      </Link>

      {/* User Header Card */}
      <div className="card bg-base-200 shadow mb-8">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="avatar">
              <div
                className={`rounded-full w-24 ${user.isDeleted ? "bg-base-300" : ""}`}
              >
                <img src="/profile.png" alt="Profile" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                {user.isDeleted && (
                  <span className="badge badge-error badge-sm">Deleted</span>
                )}
              </div>
              <p className="text-base-content/60 mt-1">{user.email}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span
                  className={`badge ${roleColors[user.role] || "badge-ghost"} badge-sm`}
                >
                  {user.role}
                </span>
                <span className="text-xs text-base-content/40 flex items-center gap-1">
                  <HiCalendar className="text-sm" />
                  Joined {formatDate(user.createdAt)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                className="btn btn-ghost btn-sm gap-1"
                onClick={startEdit}
              >
                <HiPencil className="text-sm" />
                Edit
              </button>
              {!user.isDeleted && (
                <button
                  className="btn btn-error btn-outline btn-sm gap-1"
                  onClick={() => setDeleteConfirm(true)}
                >
                  <HiTrash className="text-sm" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Account Info */}
        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <h2 className="card-title text-lg flex items-center gap-2">
              <HiIdentification className="text-xl" />
              Account Details
            </h2>
            <div className="divider my-0" />
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between py-2 border-b border-base-300">
                <span className="text-sm text-base-content/60 flex items-center gap-2">
                  <HiUser className="text-sm" /> Name
                </span>
                <span className="font-medium">{user.name}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-base-300">
                <span className="text-sm text-base-content/60 flex items-center gap-2">
                  <HiMail className="text-sm" /> Email
                </span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-base-300">
                <span className="text-sm text-base-content/60">Role</span>
                <span
                  className={`badge ${roleColors[user.role] || "badge-ghost"} badge-sm`}
                >
                  {user.role}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-base-300">
                <span className="text-sm text-base-content/60 flex items-center gap-2">
                  <HiCheckCircle className="text-sm" /> Status
                </span>
                <span
                  className={`badge ${user.isDeleted ? "badge-error" : "badge-success"} badge-sm`}
                >
                  {user.isDeleted ? "Deleted" : "Active"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-base-300">
                <span className="text-sm text-base-content/60 flex items-center gap-2">
                  <HiCalendar className="text-sm" /> Created
                </span>
                <span className="text-sm">
                  {formatDateTime(user.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-base-300">
                <span className="text-sm text-base-content/60 flex items-center gap-2">
                  <HiClock className="text-sm" /> Updated
                </span>
                <span className="text-sm">
                  {formatDateTime(user.updatedAt)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-base-content/60">User ID</span>
                <span className="text-xs font-mono text-base-content/50">
                  {user._id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Stats */}
        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <h2 className="card-title text-lg flex items-center gap-2">
              <HiPhotograph className="text-xl" />
              Content Summary
            </h2>
            <div className="divider my-0" />
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="text-center p-4 bg-success/10 rounded-xl">
                <HiPhotograph className="text-3xl text-success mx-auto mb-2" />
                <p className="text-3xl font-bold">{user.images?.length || 0}</p>
                <p className="text-sm text-base-content/60">Images</p>
              </div>
              <div className="text-center p-4 bg-error/10 rounded-xl">
                <HiVideoCamera className="text-3xl text-error mx-auto mb-2" />
                <p className="text-3xl font-bold">{user.videos?.length || 0}</p>
                <p className="text-sm text-base-content/60">Videos</p>
              </div>
              <div className="text-center p-4 bg-warning/10 rounded-xl">
                <HiDocument className="text-3xl text-warning mx-auto mb-2" />
                <p className="text-3xl font-bold">{user.files?.length || 0}</p>
                <p className="text-sm text-base-content/60">Files</p>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-xl">
                <HiDocumentText className="text-3xl text-primary mx-auto mb-2" />
                <p className="text-3xl font-bold">{user.notes?.length || 0}</p>
                <p className="text-sm text-base-content/60">Notes</p>
              </div>
            </div>
            <div className="stat bg-base-300 rounded-xl p-4 mt-4">
              <div className="stat-title">Total Content</div>
              <div className="stat-value text-2xl">
                {(user.images?.length || 0) +
                  (user.videos?.length || 0) +
                  (user.files?.length || 0) +
                  (user.notes?.length || 0)}
              </div>
              <div className="stat-desc">images + videos + files + notes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-base-200 p-1 mb-6">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`tab gap-2 flex-1 ${
              activeTab === key ? "tab-active" : ""
            }`}
            onClick={() => {
              setActiveTab(key);
              setItems([]);
            }}
          >
            <Icon className="text-lg" />
            {label}
          </button>
        ))}
      </div>

      {/* Items loading */}
      {itemsLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card bg-base-200">
              <div className="skeleton h-40 rounded-t-xl" />
              <div className="card-body p-4 gap-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!itemsLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          {activeTab === "images" && (
            <HiPhotograph className="text-6xl text-base-content/20" />
          )}
          {activeTab === "videos" && (
            <HiVideoCamera className="text-6xl text-base-content/20" />
          )}
          {activeTab === "files" && (
            <HiDocument className="text-6xl text-base-content/20" />
          )}
          {activeTab === "notes" && (
            <HiDocumentText className="text-6xl text-base-content/20" />
          )}
          <p className="text-base-content/50">No {activeTab} uploaded yet.</p>
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === "notes" && !itemsLoading && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((note) => (
            <div
              key={note._id}
              className={`card shadow-md hover:shadow-xl transition-all duration-300 ${note.isDeleted ? "bg-base-200/50 opacity-60" : "bg-base-200"}`}
            >
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h3 className="card-title text-sm">
                    {note.title || "Untitled"}
                  </h3>
                  {note.isDeleted && (
                    <span className="badge badge-error badge-xs">Deleted</span>
                  )}
                </div>
                <p className="text-sm text-base-content/60 line-clamp-3 whitespace-pre-wrap">
                  {note.content || "No content"}
                </p>
                <div className="text-xs text-base-content/40 mt-2">
                  {formatDateTime(note.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Items Grid */}
      {activeTab !== "notes" && !itemsLoading && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item._id}
              className={`card shadow-md hover:shadow-xl transition-all duration-300 group ${item.isDeleted ? "bg-base-200/50 opacity-60" : "bg-base-200"}`}
            >
              {/* Preview */}
              {activeTab === "images" && (
                <figure className="relative h-48 overflow-hidden bg-base-300">
                  <img
                    src={item.url}
                    alt={item.alt || item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  {item.isDeleted && (
                    <div className="absolute top-2 left-2 badge badge-error badge-sm shadow z-10">
                      Deleted
                    </div>
                  )}
                  <button
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
                    onClick={() => setPreview({ type: "image", item })}
                  >
                    <HiEye className="text-3xl text-white drop-shadow-lg" />
                  </button>
                </figure>
              )}

              {activeTab === "videos" && (
                <figure className="relative h-48 overflow-hidden bg-base-300">
                  {item.url?.includes("youtube.com") ||
                  item.url?.includes("youtu.be") ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${item.url.includes("youtu.be") ? item.url.split("/").pop() : new URL(item.url).searchParams.get("v")}`}
                      className="w-full h-full"
                      allowFullScreen
                      title={item.name}
                    />
                  ) : item.url?.includes("vimeo.com") ? (
                    <iframe
                      src={`https://player.vimeo.com/video/${item.url.split("/").pop()}`}
                      className="w-full h-full"
                      allowFullScreen
                      title={item.name}
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                  )}
                  {item.isDeleted && (
                    <div className="absolute top-2 left-2 badge badge-error badge-sm shadow z-10">
                      Deleted
                    </div>
                  )}
                  <button
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
                    onClick={() => setPreview({ type: "video", item })}
                  >
                    <HiEye className="text-3xl text-white drop-shadow-lg" />
                  </button>
                </figure>
              )}

              {activeTab === "files" && (
                <figure className="relative h-48 overflow-hidden bg-base-300 flex items-center justify-center">
                  {item.url?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : item.url?.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                  ) : item.url?.match(/\.pdf$/i) ? (
                    <iframe
                      src={item.url}
                      className="w-full h-full"
                      title={item.name}
                    />
                  ) : (
                    <HiDocument className="text-6xl text-base-content/30" />
                  )}
                  {item.isDeleted && (
                    <div className="absolute top-2 left-2 badge badge-error badge-sm shadow z-10">
                      Deleted
                    </div>
                  )}
                  <button
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
                    onClick={() => setPreview({ type: "file", item })}
                  >
                    <HiEye className="text-3xl text-white drop-shadow-lg" />
                  </button>
                </figure>
              )}

              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <h3 className="card-title text-sm truncate">
                    {item.name || "Untitled"}
                  </h3>
                  {item.isDeleted && (
                    <span className="badge badge-error badge-xs">Deleted</span>
                  )}
                </div>
                <p className="text-xs text-base-content/40">
                  {formatDateTime(item.createdAt)}
                </p>
                {item.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.tags.map((tag) => (
                      <span key={tag} className="badge badge-outline badge-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="card-actions justify-end mt-2">
                  <a
                    href={item.url}
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
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <dialog className={`modal ${editing ? "modal-open" : ""}`}>
        <div className="modal-box max-w-md bg-base-200">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => setEditing(false)}
          >
            <HiX />
          </button>
          <h3 className="font-bold text-lg mb-4">Edit User</h3>
          <div className="flex flex-col gap-3">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Role</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={saveUser}
                disabled={saving}
              >
                {saving ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
        <div
          className="modal-backdrop bg-black/50"
          onClick={() => setEditing(false)}
        />
      </dialog>

      {/* Delete Confirmation Modal */}
      <dialog className={`modal ${deleteConfirm ? "modal-open" : ""}`}>
        <div className="modal-box max-w-sm bg-base-200">
          <div className="flex flex-col items-center gap-3 text-center">
            <HiExclamationCircle className="text-5xl text-error" />
            <h3 className="font-bold text-lg">Delete User?</h3>
            <p className="text-base-content/60">
              <span className="font-semibold">{user.name}</span> will be soft
              deleted. They can be restored later.
            </p>
          </div>
          <div className="modal-action justify-center gap-3">
            <button
              className="btn btn-ghost"
              onClick={() => setDeleteConfirm(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-error text-white gap-2"
              onClick={deleteUser}
              disabled={deleting}
            >
              {deleting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  <HiTrash className="text-lg" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
        <div
          className="modal-backdrop bg-black/50"
          onClick={() => setDeleteConfirm(false)}
        />
      </dialog>

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
                  src={preview.item.url}
                  alt={preview.item.alt || preview.item.name}
                  className="w-full max-h-[75vh] object-contain"
                />
              </figure>
            )}
            {preview.type === "video" && (
              <div className="rounded-xl overflow-hidden">
                {preview.item.url?.includes("youtube.com") ||
                preview.item.url?.includes("youtu.be") ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${preview.item.url.includes("youtu.be") ? preview.item.url.split("/").pop() : new URL(preview.item.url).searchParams.get("v")}`}
                    className="w-full aspect-video"
                    allowFullScreen
                    title={preview.item.name}
                  />
                ) : preview.item.url?.includes("vimeo.com") ? (
                  <iframe
                    src={`https://player.vimeo.com/video/${preview.item.url.split("/").pop()}`}
                    className="w-full aspect-video"
                    allowFullScreen
                    title={preview.item.name}
                  />
                ) : (
                  <video
                    src={preview.item.url}
                    controls
                    className="w-full max-h-[75vh]"
                  />
                )}
              </div>
            )}
            {preview.type === "file" && (
              <div className="rounded-xl overflow-hidden">
                {preview.item.url?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                  <img
                    src={preview.item.url}
                    alt={preview.item.name}
                    className="w-full max-h-[75vh] object-contain"
                  />
                ) : preview.item.url?.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video
                    src={preview.item.url}
                    controls
                    className="w-full max-h-[75vh]"
                  />
                ) : (
                  <iframe
                    src={preview.item.url}
                    className="w-full aspect-video"
                    title={preview.item.name}
                  />
                )}
              </div>
            )}
            <div className="mt-3 px-2">
              <h4 className="font-bold">{preview.item.name || "Untitled"}</h4>
              {preview.item.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {preview.item.tags.map((tag) => (
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
            onClick={() => setPreview(null)}
          />
        </dialog>
      )}
    </div>
  );
};

export default AdminUserDetail;

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";
import {
  HiUsers,
  HiSearch,
  HiTrash,
  HiEye,
  HiPhotograph,
  HiVideoCamera,
  HiDocument,
  HiOutlineExclamationCircle,
  HiPencil,
  HiX,
} from "react-icons/hi";
import useAxios from "../../hooks/useAxios";

const AdminUsers = () => {
  const app = useAxios();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editRole, setEditRole] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const [usersRes, imagesRes, videosRes, filesRes] = await Promise.all([
        app.get("admin"),
        app.get("admin/all-images"),
        app.get("admin/all-videos"),
        app.get("admin/all-files"),
      ]);

      const usersData = usersRes.data.success ? usersRes.data.data : [];
      const images = imagesRes.data.success ? imagesRes.data.data : [];
      const videos = videosRes.data.success ? videosRes.data.data : [];
      const files = filesRes.data.success ? filesRes.data.data : [];

      // Build content counts per user
      const counts = {};
      images.forEach((img) => {
        const uid = img.user?._id || img.user;
        if (!counts[uid]) counts[uid] = { images: 0, videos: 0, files: 0 };
        counts[uid].images++;
      });
      videos.forEach((vid) => {
        const uid = vid.user?._id || vid.user;
        if (!counts[uid]) counts[uid] = { images: 0, videos: 0, files: 0 };
        counts[uid].videos++;
      });
      files.forEach((f) => {
        const uid = f.user?._id || f.user;
        if (!counts[uid]) counts[uid] = { images: 0, videos: 0, files: 0 };
        counts[uid].files++;
      });

      // Merge counts into users
      const enriched = usersData.map((u) => ({
        ...u,
        images: Array(u.images?.length || 0).fill(null),
        videos: Array(u.videos?.length || 0).fill(null),
        files: Array(u.files?.length || 0).fill(null),
        _counts: counts[u._id] || { images: 0, videos: 0, files: 0 },
      }));

      setUsers(enriched);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [app]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { data } = await app.delete(`admin/${deleteTarget._id}`);
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
        toast.success("User deleted");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const openEdit = (u) => {
    setEditTarget(u);
    setEditRole(u.role || "user");
  };

  const saveRole = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const { data } = await app.patch(`admin/${editTarget._id}`, {
        role: editRole,
      });
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === editTarget._id ? { ...u, role: editRole } : u,
          ),
        );
        toast.success("Role updated");
        setEditTarget(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  const roleColors = {
    admin: "badge-error",
    moderator: "badge-warning",
    user: "badge-primary",
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                {["User", "Email", "Role", "Content", "Actions"].map((h) => (
                  <th key={h}>
                    <div className="skeleton h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td>
                    <div className="skeleton h-4 w-32" />
                  </td>
                  <td>
                    <div className="skeleton h-4 w-40" />
                  </td>
                  <td>
                    <div className="skeleton h-6 w-16 rounded-full" />
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <div className="skeleton h-4 w-8" />
                      <div className="skeleton h-4 w-8" />
                      <div className="skeleton h-4 w-8" />
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <div className="skeleton h-8 w-8 rounded-full" />
                      <div className="skeleton h-8 w-8 rounded-full" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            <HiUsers className="text-primary" />
            Users
          </h1>
          <p className="text-base-content/60 mt-1">
            {users.length} registered user{users.length !== 1 && "s"}
          </p>
        </div>
        <div className="input input-bordered flex items-center gap-2 w-full sm:w-80 focus-within:ring-2 focus-within:ring-primary">
          <HiSearch className="text-lg opacity-60 shrink-0" />
          <input
            type="text"
            placeholder="Search users..."
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
      {users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <HiUsers className="text-7xl text-base-content/20" />
          <h3 className="text-xl font-semibold">No users found</h3>
          <p className="text-base-content/50 max-w-sm">
            There are no registered users yet.
          </p>
        </div>
      )}

      {/* No results */}
      {users.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <HiSearch className="text-5xl text-base-content/20" />
          <p className="text-base-content/60">No users match your search.</p>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="overflow-x-auto bg-base-200 rounded-xl shadow">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Content</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id} className="hover">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="rounded-full w-10">
                          <img src="/profile.png" alt="Profile" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-base-content/50">
                          {u._id.slice(-6)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm">{u.email}</td>
                  <td>
                    <span
                      className={`badge ${roleColors[u.role] || "badge-ghost"} badge-sm`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-3 text-sm text-base-content/60">
                      <span className="flex items-center gap-1">
                        <HiPhotograph className="text-xs" />
                        {u._counts?.images || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <HiVideoCamera className="text-xs" />
                        {u._counts?.videos || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <HiDocument className="text-xs" />
                        {u._counts?.files || 0}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <Link
                        to={`/admin/users/${u._id}`}
                        className="btn btn-ghost btn-xs gap-1"
                      >
                        <HiEye className="text-sm" />
                        View
                      </Link>
                      <button
                        className="btn btn-ghost btn-xs gap-1"
                        onClick={() => openEdit(u)}
                      >
                        <HiPencil className="text-sm" />
                        Role
                      </button>
                      <button
                        className="btn btn-ghost btn-xs gap-1 text-error"
                        onClick={() => setDeleteTarget(u)}
                      >
                        <HiTrash className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Role Modal */}
      <dialog className={`modal ${editTarget ? "modal-open" : ""}`}>
        <div className="modal-box max-w-sm bg-base-200">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => setEditTarget(null)}
          >
            <HiX />
          </button>
          <h3 className="font-bold text-lg mb-4">Change Role</h3>
          <p className="text-sm text-base-content/60 mb-4">
            Update role for <span className="font-semibold">{editTarget?.name}</span>
          </p>
          <select
            className="select select-bordered w-full"
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
          >
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={() => setEditTarget(null)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={saveRole}
              disabled={saving || editRole === editTarget?.role}
            >
              {saving ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
        <div
          className="modal-backdrop bg-black/50"
          onClick={() => setEditTarget(null)}
        />
      </dialog>

      {/* Delete Modal */}
      <dialog className={`modal ${deleteTarget ? "modal-open" : ""}`}>
        <div className="modal-box max-w-sm bg-base-200">
          <div className="flex flex-col items-center gap-3 text-center">
            <HiOutlineExclamationCircle className="text-5xl text-error" />
            <h3 className="font-bold text-lg">Delete User?</h3>
            <p className="text-base-content/60">
              <span className="font-semibold">{deleteTarget?.name}</span> and
              all their data will be permanently removed.
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
          onClick={() => setDeleteTarget(null)}
        />
      </dialog>
    </div>
  );
};

export default AdminUsers;

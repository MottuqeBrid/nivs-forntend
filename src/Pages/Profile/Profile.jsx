import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import {
  HiUser,
  HiLockClosed,
  HiPencil,
  HiTrash,
  HiOutlineExclamationCircle,
  HiPhotograph,
  HiVideoCamera,
  HiDocument,
  HiCalendar,
  HiChevronDown,
  HiChevronUp,
} from "react-icons/hi";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import Avatar from "../../component/Avatar/Avatar";

const Profile = () => {
  const { user, setUser, logout, loading: authLoading } = useAuth();
  const app = useAxios();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const startEdit = () => {
    setName(user?.name || "");
    setEditing(true);
  };

  const saveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      const { data } = await app.patch("users", { name: name.trim() });
      if (data.success) {
        setUser((prev) => ({ ...prev, name: name.trim() }));
        toast.success("Name updated");
        setEditing(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update name");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) return toast.error("Current password is required");
    if (newPassword.length < 6)
      return toast.error("New password must be at least 6 characters");
    setChangingPass(true);
    try {
      const { data } = await app.patch("users?password=password", {
        password: newPassword,
        currentPassword,
      });
      if (data.success) {
        toast.success("Password updated");
        setShowPassword(false);
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setChangingPass(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      const { data } = await app.delete("users");
      if (data.success) {
        toast.success("Account deleted");
        logout();
        navigate("/");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete account");
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  if (!user && !authLoading) {
    navigate("/login");
    return null;
  }

  const roleColors = {
    admin: "badge-error",
    moderator: "badge-warning",
    user: "badge-primary",
  };

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="py-8 max-w-2xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-8">
        <Avatar name={user.name} size="xl" />
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-base-content/60">{user.email}</p>
          {memberSince && (
            <p className="text-xs text-base-content/40 flex items-center gap-1 mt-1">
              <HiCalendar className="text-sm" />
              Member since {memberSince}
            </p>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="stat bg-base-200 rounded-xl p-4 shadow">
          <div className="stat-title text-xs">Role</div>
          <div className="mt-1">
            <span
              className={`badge ${roleColors[user.role] || "badge-ghost"} badge-sm`}
            >
              {user.role}
            </span>
          </div>
        </div>
        <div className="stat bg-base-200 rounded-xl p-4 shadow">
          <div className="stat-title text-xs flex items-center gap-1">
            <HiPhotograph className="text-xs" /> Images
          </div>
          <div className="stat-value text-lg">{user.images?.length || 0}</div>
        </div>
        <div className="stat bg-base-200 rounded-xl p-4 shadow">
          <div className="stat-title text-xs flex items-center gap-1">
            <HiVideoCamera className="text-xs" /> Videos
          </div>
          <div className="stat-value text-lg">{user.videos?.length || 0}</div>
        </div>
        <div className="stat bg-base-200 rounded-xl p-4 shadow">
          <div className="stat-title text-xs flex items-center gap-1">
            <HiDocument className="text-xs" /> Files
          </div>
          <div className="stat-value text-lg">{user.files?.length || 0}</div>
        </div>
      </div>

      {/* ── Edit Name ── */}
      <div className="card bg-base-200 shadow mb-4">
        <div className="card-body">
          <div className="flex items-center justify-between mb-2">
            <h2 className="card-title text-lg">
              <HiUser className="text-xl" />
              Personal Info
            </h2>
            {!editing && (
              <button
                className="btn btn-ghost btn-sm gap-1"
                onClick={startEdit}
              >
                <HiPencil className="text-sm" />
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={saveName} className="flex flex-col gap-3">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={saving}
                >
                  {saving ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-base-content/50">Name</p>
              <p className="font-medium">{user.name}</p>
              <div className="divider my-1" />
              <p className="text-sm text-base-content/50">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Change Password ── */}
      <div className="card bg-base-200 shadow mb-4">
        <div className="card-body">
          <button
            className="flex items-center justify-between w-full text-left"
            onClick={() => setShowPassword((s) => !s)}
          >
            <h2 className="card-title text-lg">
              <HiLockClosed className="text-xl" />
              Change Password
            </h2>
            {showPassword ? (
              <HiChevronUp className="text-xl" />
            ) : (
              <HiChevronDown className="text-xl" />
            )}
          </button>

          {showPassword && (
            <form
              onSubmit={changePassword}
              className="flex flex-col gap-3 mt-4"
            >
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Current Password
                  </span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">New Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={changingPass}
                >
                  {changingPass ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="card bg-base-200 shadow border border-error/30">
        <div className="card-body">
          <h2 className="card-title text-lg text-error">
            <HiOutlineExclamationCircle className="text-xl" />
            Danger Zone
          </h2>
          <p className="text-sm text-base-content/60">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
          <div className="flex justify-end">
            <button
              className="btn btn-error btn-sm gap-1"
              onClick={() => setDeleteConfirm(true)}
            >
              <HiTrash className="text-sm" />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      <dialog className={`modal ${deleteConfirm ? "modal-open" : ""}`}>
        <div className="modal-box max-w-sm bg-base-200">
          <div className="flex flex-col items-center gap-3 text-center">
            <HiOutlineExclamationCircle className="text-5xl text-error" />
            <h3 className="font-bold text-lg">Delete Account?</h3>
            <p className="text-base-content/60">
              This will permanently delete your account, all your images,
              videos, files, and notes. This cannot be undone.
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
              onClick={deleteAccount}
              disabled={deleting}
            >
              {deleting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  <HiTrash className="text-lg" />
                  Delete Everything
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
    </div>
  );
};

export default Profile;

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import {
  HiUsers,
  HiPhotograph,
  HiVideoCamera,
  HiDocument,
  HiCloudUpload,
  HiArrowRight,
  HiTrash,
  HiClock,
  HiUser,
  HiTrendingUp,
  HiDatabase,
  HiCheckCircle,
} from "react-icons/hi";
import useAxios from "../../hooks/useAxios";

const AdminDashboard = () => {
  const app = useAxios();
  const [data, setData] = useState({
    users: [],
    images: [],
    videos: [],
    files: [],
    uploads: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, imagesRes, videosRes, filesRes, uploadsRes] =
        await Promise.all([
          app.get("admin"),
          app.get("admin/all-images"),
          app.get("admin/all-videos"),
          app.get("admin/all-files"),
          app.get("admin/uploads"),
        ]);

      setData({
        users: usersRes.data.success ? usersRes.data.data : [],
        images: imagesRes.data.success ? imagesRes.data.data : [],
        videos: videosRes.data.success ? videosRes.data.data : [],
        files: filesRes.data.success ? filesRes.data.data : [],
        uploads: uploadsRes.data.success ? uploadsRes.data.data : [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [app]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived stats
  const activeUsers = data.users.filter((u) => !u.isDeleted).length;
  const deletedUsers = data.users.filter((u) => u.isDeleted).length;
  const adminUsers = data.users.filter((u) => u.role === "admin").length;
  const deletedImages = data.images.filter((i) => i.isDeleted).length;
  const deletedVideos = data.videos.filter((v) => v.isDeleted).length;
  const deletedFiles = data.files.filter((f) => f.isDeleted).length;
  const totalDeleted = deletedImages + deletedVideos + deletedFiles;

  // Recent uploads (last 5)
  const recentUploads = [...data.uploads]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Recent users (last 5)
  const recentUsers = [...data.users]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Top uploaders
  const userUploadCount = {};
  data.uploads.forEach((u) => {
    const userId = u.user?._id || u.user;
    const name = u.user?.name || u.user?.email || "Unknown";
    if (!userUploadCount[userId]) userUploadCount[userId] = { name, count: 0 };
    userUploadCount[userId].count++;
  });
  const topUploaders = Object.values(userUploadCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Content per user
  const userContent = data.users.map((u) => ({
    name: u.name,
    email: u.email,
    images: u.images?.length || 0,
    videos: u.videos?.length || 0,
    files: u.files?.length || 0,
    total:
      (u.images?.length || 0) +
      (u.videos?.length || 0) +
      (u.files?.length || 0),
  }));
  const topContentUsers = [...userContent]
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const mainCards = [
    {
      label: "Total Users",
      value: data.users.length,
      sub: `${activeUsers} active`,
      icon: HiUsers,
      color: "text-primary",
      bg: "bg-primary/10",
      to: "/admin/users",
    },
    {
      label: "Images",
      value: data.images.length,
      sub: deletedImages > 0 ? `${deletedImages} deleted` : null,
      icon: HiPhotograph,
      color: "text-success",
      bg: "bg-success/10",
      to: "/admin/images",
    },
    {
      label: "Videos",
      value: data.videos.length,
      sub: deletedVideos > 0 ? `${deletedVideos} deleted` : null,
      icon: HiVideoCamera,
      color: "text-error",
      bg: "bg-error/10",
      to: "/admin/videos",
    },
    {
      label: "Files",
      value: data.files.length,
      sub: deletedFiles > 0 ? `${deletedFiles} deleted` : null,
      icon: HiDocument,
      color: "text-warning",
      bg: "bg-warning/10",
      to: "/admin/files",
    },
    {
      label: "Uploads",
      value: data.uploads.length,
      sub: totalDeleted > 0 ? `${totalDeleted} deleted` : null,
      icon: HiCloudUpload,
      color: "text-secondary",
      bg: "bg-secondary/10",
      to: "/admin/uploads",
    },
  ];

  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-base-content/60 mt-1">Overview of your system</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {mainCards.map(({ label, value, sub, icon: Icon, color, bg, to }) => (
          <Link
            key={label}
            to={to}
            className="card bg-base-200 shadow hover:shadow-lg transition-all group"
          >
            <div className="card-body p-4">
              {loading ? (
                <div className="skeleton h-8 w-16" />
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/60">{label}</p>
                    <p className="text-3xl font-bold mt-1">{value}</p>
                    {sub && (
                      <p className="text-xs text-base-content/40 mt-0.5">
                        {sub}
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-xl ${bg}`}>
                    <Icon className={`text-2xl ${color}`} />
                  </div>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card bg-base-200 shadow">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <HiCheckCircle className="text-xl text-success" />
              </div>
              <div>
                <p className="text-sm text-base-content/60">Active Users</p>
                <p className="text-2xl font-bold">{loading ? "..." : activeUsers}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card bg-base-200 shadow">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-error/10">
                <HiTrash className="text-xl text-error" />
              </div>
              <div>
                <p className="text-sm text-base-content/60">Deleted Items</p>
                <p className="text-2xl font-bold">{loading ? "..." : totalDeleted}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card bg-base-200 shadow">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <HiTrendingUp className="text-xl text-primary" />
              </div>
              <div>
                <p className="text-sm text-base-content/60">Total Content</p>
                <p className="text-2xl font-bold">
                  {loading
                    ? "..."
                    : data.images.length + data.videos.length + data.files.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Recent Uploads */}
        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <div className="flex items-center justify-between mb-2">
              <h2 className="card-title text-lg flex items-center gap-2">
                <HiClock className="text-xl" />
                Recent Uploads
              </h2>
              <Link
                to="/admin/uploads"
                className="btn btn-ghost btn-xs gap-1"
              >
                View all
                <HiArrowRight className="text-sm" />
              </Link>
            </div>
            {loading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-12 w-full" />
                ))}
              </div>
            ) : recentUploads.length === 0 ? (
              <p className="text-base-content/50 text-sm py-4 text-center">
                No uploads yet
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {recentUploads.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-base-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {u.user && (
                        <div className="avatar placeholder shrink-0">
                          <div className="bg-primary text-primary-content rounded-full w-8">
                            <span className="text-xs font-bold">
                              {u.user.name?.charAt(0).toUpperCase() || "U"}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {u.originalName || "Unnamed"}
                        </p>
                        <p className="text-xs text-base-content/50 truncate">
                          {u.user?.name || "Unknown"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-base-content/40 shrink-0 ml-2">
                      {formatTime(u.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <div className="flex items-center justify-between mb-2">
              <h2 className="card-title text-lg flex items-center gap-2">
                <HiUser className="text-xl" />
                Recent Users
              </h2>
              <Link
                to="/admin/users"
                className="btn btn-ghost btn-xs gap-1"
              >
                View all
                <HiArrowRight className="text-sm" />
              </Link>
            </div>
            {loading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-12 w-full" />
                ))}
              </div>
            ) : recentUsers.length === 0 ? (
              <p className="text-base-content/50 text-sm py-4 text-center">
                No users yet
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {recentUsers.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-base-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="avatar placeholder shrink-0">
                        <div className="bg-primary text-primary-content rounded-full w-8">
                          <span className="text-xs font-bold">
                            {u.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{u.name}</p>
                        <p className="text-xs text-base-content/50 truncate">
                          {u.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`badge badge-sm ${
                          u.role === "admin"
                            ? "badge-error"
                            : u.role === "moderator"
                              ? "badge-warning"
                              : "badge-primary"
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Leaders & Top Uploaders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Top Content Creators */}
        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <h2 className="card-title text-lg flex items-center gap-2">
              <HiDatabase className="text-xl" />
              Top Content Creators
            </h2>
            {loading ? (
              <div className="flex flex-col gap-2 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-10 w-full" />
                ))}
              </div>
            ) : topContentUsers.length === 0 ? (
              <p className="text-base-content/50 text-sm py-4 text-center">
                No content yet
              </p>
            ) : (
              <div className="overflow-x-auto mt-2">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th className="text-center">Images</th>
                      <th className="text-center">Videos</th>
                      <th className="text-center">Files</th>
                      <th className="text-center">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topContentUsers.map((u, i) => (
                      <tr key={i}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="avatar placeholder">
                              <div className="bg-primary text-primary-content rounded-full w-7">
                                <span className="text-xs font-bold">
                                  {u.name?.charAt(0).toUpperCase() || "U"}
                                </span>
                              </div>
                            </div>
                            <span className="text-sm truncate max-w-[120px]">
                              {u.name}
                            </span>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="badge badge-success badge-sm">
                            {u.images}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="badge badge-error badge-sm">
                            {u.videos}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="badge badge-warning badge-sm">
                            {u.files}
                          </span>
                        </td>
                        <td className="text-center font-bold">{u.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Top Uploaders */}
        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <h2 className="card-title text-lg flex items-center gap-2">
              <HiTrendingUp className="text-xl" />
              Top Uploaders
            </h2>
            {loading ? (
              <div className="flex flex-col gap-2 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-10 w-full" />
                ))}
              </div>
            ) : topUploaders.length === 0 ? (
              <p className="text-base-content/50 text-sm py-4 text-center">
                No uploads yet
              </p>
            ) : (
              <div className="flex flex-col gap-1 mt-2">
                {topUploaders.map((u, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-base-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-base-content/40 w-5">
                        #{i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-base-content/50">
                          {u.count} upload{u.count !== 1 && "s"}
                        </p>
                      </div>
                    </div>
                    <div
                      className="radial-progress text-primary text-xs font-bold"
                      style={{
                        "--value": Math.round(
                          (u.count / (data.uploads.length || 1)) * 100,
                        ),
                        width: "2.5rem",
                        height: "2.5rem",
                      }}
                    >
                      {Math.round(
                        (u.count / (data.uploads.length || 1)) * 100,
                      )}
                      %
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/admin/users"
          className="card bg-base-200 shadow hover:shadow-lg transition-all group"
        >
          <div className="card-body flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <HiUsers className="text-2xl text-primary" />
              <div>
                <h3 className="font-bold">Manage Users</h3>
                <p className="text-sm text-base-content/60">
                  View, edit roles, delete users
                </p>
              </div>
            </div>
            <HiArrowRight className="text-xl text-base-content/30 group-hover:text-primary transition-colors" />
          </div>
        </Link>

        <Link
          to="/admin/uploads"
          className="card bg-base-200 shadow hover:shadow-lg transition-all group"
        >
          <div className="card-body flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <HiCloudUpload className="text-2xl text-secondary" />
              <div>
                <h3 className="font-bold">All Uploads</h3>
                <p className="text-sm text-base-content/60">
                  Browse all uploaded files
                </p>
              </div>
            </div>
            <HiArrowRight className="text-xl text-base-content/30 group-hover:text-primary transition-colors" />
          </div>
        </Link>

        <Link
          to="/"
          className="card bg-base-200 shadow hover:shadow-lg transition-all group"
        >
          <div className="card-body flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <HiPhotograph className="text-2xl text-success" />
              <div>
                <h3 className="font-bold">View Site</h3>
                <p className="text-sm text-base-content/60">
                  Go to public homepage
                </p>
              </div>
            </div>
            <HiArrowRight className="text-xl text-base-content/30 group-hover:text-primary transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;

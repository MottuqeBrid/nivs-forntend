import { Outlet, Navigate, NavLink } from "react-router";
import Navbar from "../component/Navbar/Navbar";
import { useAuth } from "../hooks/useAuth";
import {
  HiUsers,
  HiCloudUpload,
  HiPhotograph,
  HiVideoCamera,
  HiDocument,
  HiDocumentText,
  HiHome,
} from "react-icons/hi";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: HiHome, end: true },
  { to: "/admin/users", label: "Users", icon: HiUsers },
  { to: "/admin/uploads", label: "Uploads", icon: HiCloudUpload },
  { to: "/admin/images", label: "Images", icon: HiPhotograph },
  { to: "/admin/videos", label: "Videos", icon: HiVideoCamera },
  { to: "/admin/files", label: "Files", icon: HiDocument },
  { to: "/admin/notes", label: "Notes", icon: HiDocumentText },
];

const AdminLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 min-h-[calc(100vh-4rem)] bg-base-200 border-r border-base-300 sticky top-16">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-base-content/50 uppercase tracking-wider mb-4">
              Admin Panel
            </h2>
            <ul className="flex flex-col gap-1">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary text-primary-content"
                          : "text-base-content/70 hover:bg-base-300 hover:text-base-content"
                      }`
                    }
                  >
                    <Icon className="text-lg" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-base-200 border-t border-base-300">
          <div className="flex justify-around py-2">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-2 py-1 text-xs transition-all ${
                    isActive
                      ? "text-primary"
                      : "text-base-content/50 hover:text-base-content"
                  }`
                }
              >
                <Icon className="text-xl" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Main */}
        <main className="flex-1 mx-auto max-w-7xl px-4 pb-20 lg:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

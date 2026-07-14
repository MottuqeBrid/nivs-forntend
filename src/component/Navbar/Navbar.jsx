import { NavLink, useNavigate } from "react-router";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  HiHome,
  HiPhotograph,
  HiVideoCamera,
  HiDocumentText,
  HiLogin,
  HiInformationCircle,
  HiMenu,
  HiX,
  HiSun,
  HiMoon,
  HiUser,
  HiCog,
  HiLogout,
} from "react-icons/hi";
import logo from "../../assets/logo.png";
import { useAuth } from "../../hooks/useAuth";

const Navbar = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark",
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = useMemo(() => {
    const links = [
      { to: "/", label: "Home", icon: HiHome },
      { to: "/about", label: "About", icon: HiInformationCircle },
    ];

    if (!loading && user) {
      links.splice(
        1,
        0,
        { to: "/images", label: "Images", icon: HiPhotograph },
        { to: "/videos", label: "Videos", icon: HiVideoCamera },
        { to: "/files", label: "Files", icon: HiDocumentText },
      );
    }
    if (!loading && user?.role === "admin") {
      links.splice(1, 0, { to: "/admin", label: "Admin", icon: HiCog });
    }

    if (!loading && !user) {
      links.push({ to: "/login", label: "Login", icon: HiLogin });
    }

    return links;
  }, [user, loading]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleEscape = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileOpen]);

  useEffect(() => {
    const fun = () => {
      setMobileOpen(false);
      setUserMenuOpen(false);
    };
    fun();
  }, [navigate]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const handleLogout = useCallback(() => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  }, [logout, navigate]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="sticky top-0 z-50 bg-base-200/80 backdrop-blur-xl border-b border-base-300/50 shadow-sm">
      <div className="navbar max-w-7xl mx-auto px-4">
        {/* ── Left ── */}
        <div className="navbar-start gap-1">
          <button
            className="btn btn-ghost btn-circle lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <HiX className="text-xl" />
            ) : (
              <HiMenu className="text-xl" />
            )}
          </button>

          <NavLink to="/" className="btn btn-ghost gap-2 px-2">
            <img src={logo} alt="NIVS" className="h-8 w-8 rounded-lg" />
            <span className="text-lg font-bold hidden sm:inline tracking-tight">
              NIVS
            </span>
          </NavLink>
        </div>

        {/* ── Center: Desktop links ── */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    [
                      "gap-2 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-content shadow-md shadow-primary/25"
                        : "hover:bg-base-300",
                    ].join(" ")
                  }
                >
                  <Icon className="text-lg" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Right ── */}
        <div className="navbar-end gap-1">
          {/* Theme toggle */}
          <button
            className="btn btn-ghost btn-circle swap swap-rotate"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <HiSun
              className={`text-xl absolute transition-all duration-300 ${
                theme === "dark"
                  ? "rotate-0 scale-100 text-warning opacity-100"
                  : "rotate-90 scale-0 opacity-0"
              }`}
            />
            <HiMoon
              className={`text-xl absolute transition-all duration-300 ${
                theme === "light"
                  ? "rotate-0 scale-100 text-secondary opacity-100"
                  : "-rotate-90 scale-0 opacity-0"
              }`}
            />
          </button>

          {/* Auth section */}
          {!loading && user && (
            <div className="dropdown dropdown-end">
              <button
                className="btn btn-ghost btn-circle avatar placeholder"
                onClick={() => setUserMenuOpen((o) => !o)}
              >
                <div className="bg-primary text-primary-content rounded-full w-9">
                  <span className="text-sm font-semibold">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              </button>

              {userMenuOpen && (
                <ul className="menu dropdown-content bg-base-200 rounded-box z-50 w-52 shadow-lg border border-base-300/50 mt-3 p-2">
                  <li className="menu-title px-4 py-2">
                    <span>{user.name}</span>
                    <span className="text-xs opacity-50 font-normal">
                      {user.email}
                    </span>
                  </li>
                  <div className="divider my-0" />
                  <li>
                    <NavLink
                      to="/profile"
                      className="gap-2"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <HiUser className="text-lg" />
                      Profile
                    </NavLink>
                  </li>
                  {user.role === "admin" && (
                    <li>
                      <NavLink
                        to="/admin"
                        className="gap-2"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <HiCog className="text-lg" />
                        Admin
                      </NavLink>
                    </li>
                  )}
                  <div className="divider my-0" />
                  <li>
                    <button onClick={handleLogout} className="gap-2 text-error">
                      <HiLogout className="text-lg" />
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          )}

          {!loading && !user && (
            <NavLink
              to="/login"
              className="btn btn-primary btn-sm rounded-lg hidden lg:flex"
            >
              <HiLogin className="text-lg" />
              Login
            </NavLink>
          )}

          {loading && <div className="skeleton w-9 h-9 rounded-full" />}
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobile}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div
          className={`absolute left-0 top-0 h-full w-72 bg-base-200 shadow-2xl transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer header */}
          <div className="flex items-center gap-3 p-5 border-b border-base-300/50">
            <img src={logo} alt="NIVS" className="h-10 w-10 rounded-lg" />
            <span className="text-xl font-bold tracking-tight">NIVS</span>
          </div>

          {/* Drawer links */}
          <ul className="menu p-4 gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    [
                      "gap-3 py-3 text-lg rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-content shadow-md shadow-primary/25"
                        : "hover:bg-base-300",
                    ].join(" ")
                  }
                >
                  <Icon className="text-xl" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Drawer footer */}
          {user && (
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-base-300/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-10">
                    <span className="text-sm font-semibold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                </div>
                <div className="truncate">
                  <p className="font-semibold truncate">{user.name}</p>
                  <p className="text-xs opacity-50 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-error btn-outline btn-sm w-full gap-2 rounded-lg"
              >
                <HiLogout className="text-lg" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;

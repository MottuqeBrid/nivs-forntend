import { NavLink, useNavigate } from "react-router";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  HiPencilAlt,
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
  const userMenuRef = useRef(null);

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
        { to: "/notes", label: "Notes", icon: HiPencilAlt },
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
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [navigate]);

  // click-outside close for user dropdown
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [userMenuOpen]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const handleLogout = useCallback(() => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  }, [logout, navigate]);

  const closeMobile = () => setMobileOpen(false);

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <div className="sticky top-0 z-50 bg-base-100/70 backdrop-blur-xl border-b border-base-300/40 shadow-sm supports-[backdrop-filter]:bg-base-100/60">
        <div className="navbar max-w-7xl mx-auto px-3 sm:px-4">
          {/* ── Left ── */}
          <div className="navbar-start gap-1">
            <button
              className="btn btn-ghost btn-square sm:btn-circle text-xl min-w-[2.75rem] lg:hidden hover:bg-base-300/70 transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <HiX /> : <HiMenu />}
            </button>

            <NavLink
              to="/"
              className="btn btn-ghost gap-2 px-2 min-h-[2.75rem] hover:bg-transparent group"
            >
              <img
                src={logo}
                alt="NIVS"
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg ring-1 ring-base-300/60 group-hover:ring-primary/50 transition-all"
              />
              <span className="text-base sm:text-lg font-bold hidden sm:inline tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                NIVS
              </span>
            </NavLink>
          </div>

          {/* ── Center: Desktop links ── */}
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal gap-1 p-0">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      [
                        "gap-2 rounded-lg transition-all duration-200 font-medium",
                        isActive
                          ? "bg-primary text-primary-content shadow-md shadow-primary/25"
                          : "hover:bg-base-300/70 text-base-content/80 hover:text-base-content",
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
              className="btn btn-ghost btn-square sm:btn-circle min-w-[2.75rem] min-h-[2.75rem] relative overflow-hidden hover:bg-base-300/70 transition-colors"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <HiSun
                className={`text-xl absolute transition-all duration-300 ease-out ${
                  theme === "dark"
                    ? "rotate-0 scale-100 text-warning opacity-100"
                    : "rotate-180 scale-0 opacity-0"
                }`}
              />
              <HiMoon
                className={`text-xl absolute transition-all duration-300 ease-out ${
                  theme === "light"
                    ? "rotate-0 scale-100 text-secondary opacity-100"
                    : "-rotate-180 scale-0 opacity-0"
                }`}
              />
            </button>

            {/* Auth section */}
            {!loading && user && (
              <div className="dropdown dropdown-end" ref={userMenuRef}>
                <button
                  className="btn btn-ghost btn-circle avatar placeholder min-w-[2.75rem] min-h-[2.75rem] ring-1 ring-base-300/60 hover:ring-primary/50 transition-all"
                  onClick={() => setUserMenuOpen((o) => !o)}
                >
                  <div className="rounded-full w-8 h-8 bg-primary/15 text-primary flex items-center justify-center text-xs font-bold">
                    {initials || <HiUser className="text-base" />}
                  </div>
                </button>

                {userMenuOpen && (
                  <ul className="menu dropdown-content bg-base-200 rounded-box z-50 w-56 shadow-xl border border-base-300/50 mt-3 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    <li className="menu-title px-3 py-2">
                      <span className="font-semibold text-base-content">
                        {user.name}
                      </span>
                      <span className="text-xs opacity-50 font-normal">
                        {user.email}
                      </span>
                    </li>
                    <div className="divider my-0" />
                    <li>
                      <NavLink
                        to="/profile"
                        className="gap-2 rounded-lg"
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
                          className="gap-2 rounded-lg"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <HiCog className="text-lg" />
                          Admin
                        </NavLink>
                      </li>
                    )}
                    <div className="divider my-0" />
                    <li>
                      <button
                        onClick={handleLogout}
                        className="gap-2 rounded-lg text-error hover:bg-error/10"
                      >
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
                className="btn btn-primary btn-sm rounded-lg hidden lg:flex gap-2 shadow-md shadow-primary/20"
              >
                <HiLogin className="text-lg" />
                Login
              </NavLink>
            )}

            {loading && <div className="skeleton w-8 h-8 rounded-full" />}
          </div>
        </div>
      </div>

      {/* ── Mobile drawer — sibling of blur wrapper, not child ── */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMobile}
        />

        <div
          className={`absolute left-0 top-0 h-full w-[min(85vw,18rem)] bg-base-200 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-base-300/50">
            <NavLink
              to="/"
              className="flex items-center gap-3"
              onClick={closeMobile}
            >
              <img src={logo} alt="NIVS" className="h-9 w-9 rounded-lg" />
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                NIVS
              </span>
            </NavLink>
            <button
              className="btn btn-ghost btn-square btn-sm min-w-[2.25rem] min-h-[2.25rem]"
              onClick={closeMobile}
              aria-label="Close menu"
            >
              <HiX className="text-xl" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-3">
            <ul className="flex flex-col gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      [
                        "flex items-center gap-3 py-2.5 px-3 text-sm font-medium rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-content shadow-md shadow-primary/25"
                          : "text-base-content/80 hover:bg-base-300/70 hover:text-base-content",
                      ].join(" ")
                    }
                  >
                    <Icon className="text-lg shrink-0" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {user && (
            <div className="p-4 border-t border-base-300/50 bg-base-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-full w-10 h-10 bg-primary/15 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                  {initials || <HiUser className="text-lg" />}
                </div>
                <div className="min-w-0 flex-1">
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
    </>
  );
};

export default Navbar;

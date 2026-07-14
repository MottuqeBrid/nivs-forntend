import { NavLink } from "react-router";
import { useState, useEffect } from "react";
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
} from "react-icons/hi";
import logo from "../../assets/logo.png";

const navLinks = [
  { to: "/", label: "Home", icon: HiHome },
  { to: "/images", label: "Images", icon: HiPhotograph },
  { to: "/videos", label: "Videos", icon: HiVideoCamera },
  { to: "/files", label: "Files", icon: HiDocumentText },
  { to: "/login", label: "Login", icon: HiLogin },
  { to: "/about", label: "About", icon: HiInformationCircle },
];

const Navbar = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="navbar bg-base-200 shadow-md sticky top-0 z-50 px-4">
      {/* Left: Logo + Brand */}
      <div className="navbar-start">
        <button
          className="btn btn-ghost btn-circle lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <HiX className="text-xl" /> : <HiMenu className="text-xl" />}
        </button>
        <NavLink to="/" className="btn btn-ghost text-xl gap-2">
          <img src={logo} alt="NIVS" className="h-8 w-8 rounded" />
          <span className="font-bold hidden sm:inline">NIVS</span>
        </NavLink>
      </div>

      {/* Center: Desktop nav links */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `gap-2 ${isActive ? "active bg-primary text-primary-content" : ""}`
                }
              >
                <Icon className="text-lg" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Right: Theme toggle */}
      <div className="navbar-end">
        <button
          className="btn btn-ghost btn-circle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <HiSun className="text-xl text-warning" />
          ) : (
            <HiMoon className="text-xl text-secondary" />
          )}
        </button>
      </div>

      {/* Mobile: Slide-in drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={closeMobile}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute left-0 top-0 h-full w-64 bg-base-200 shadow-xl p-4 pt-20"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="menu gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      `gap-2 text-lg ${isActive ? "active bg-primary text-primary-content" : ""}`
                    }
                  >
                    <Icon className="text-xl" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;

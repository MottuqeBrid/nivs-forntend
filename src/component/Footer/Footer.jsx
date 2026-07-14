import { Link } from "react-router";
import {
  HiPhotograph,
  HiVideoCamera,
  HiDocument,
  HiInformationCircle,
  HiLogin,
} from "react-icons/hi";
import logo from "../../assets/logo.png";
import { useAuth } from "../../hooks/useAuth";

const Footer = () => {
  const { user } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-base-200 border-t border-base-300 mt-16">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <img src={logo} alt="NIVS" className="h-8 w-8 rounded-lg" />
              <span className="text-lg font-bold tracking-tight">NIVS</span>
            </Link>
            <p className="text-sm text-base-content/60">
              Networked Information Vault System. Store, organize, and access
              your media from anywhere.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-base-content/60 hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm text-base-content/60 hover:text-primary transition-colors"
                >
                  About
                </Link>
              </li>
              {user && (
                <>
                  <li>
                    <Link
                      to="/images"
                      className="text-sm text-base-content/60 hover:text-primary transition-colors"
                    >
                      Images
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/videos"
                      className="text-sm text-base-content/60 hover:text-primary transition-colors"
                    >
                      Videos
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/files"
                      className="text-sm text-base-content/60 hover:text-primary transition-colors"
                    >
                      Files
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Content */}
          <div>
            <h3 className="font-semibold mb-3">Content</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  to="/images"
                  className="text-sm text-base-content/60 hover:text-primary transition-colors flex items-center gap-2"
                >
                  <HiPhotograph className="text-sm" />
                  Images
                </Link>
              </li>
              <li>
                <Link
                  to="/videos"
                  className="text-sm text-base-content/60 hover:text-primary transition-colors flex items-center gap-2"
                >
                  <HiVideoCamera className="text-sm" />
                  Videos
                </Link>
              </li>
              <li>
                <Link
                  to="/files"
                  className="text-sm text-base-content/60 hover:text-primary transition-colors flex items-center gap-2"
                >
                  <HiDocument className="text-sm" />
                  Files
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold mb-3">Account</h3>
            <ul className="flex flex-col gap-2">
              {user ? (
                <>
                  <li>
                    <Link
                      to="/profile"
                      className="text-sm text-base-content/60 hover:text-primary transition-colors"
                    >
                      Profile
                    </Link>
                  </li>
                  {user.role === "admin" && (
                    <li>
                      <Link
                        to="/admin"
                        className="text-sm text-base-content/60 hover:text-primary transition-colors"
                      >
                        Admin Panel
                      </Link>
                    </li>
                  )}
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/login"
                      className="text-sm text-base-content/60 hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <HiLogin className="text-sm" />
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/signup"
                      className="text-sm text-base-content/60 hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <HiInformationCircle className="text-sm" />
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="divider my-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-base-content/50">
            &copy; {year} NIVS. All rights reserved.
          </p>
          <p className="text-sm text-base-content/50">
            Built with React, Vite & DaisyUI
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { Link } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../assets/logo.png";

const Hero = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center text-center py-16">
      <img
        src={logo}
        alt="NIVS"
        className="w-24 h-24 rounded-2xl mb-6 shadow-lg"
      />
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
        Networked{" "}
        <span className="text-primary">Information</span>{" "}
        Vault System
      </h1>
      <p className="text-base-content/60 max-w-2xl text-lg mb-8">
        Your all-in-one media management platform. Store images, host videos,
        manage files — all in one secure, fast, and beautiful interface.
      </p>
      <div className="flex gap-3">
        {user ? (
          <Link
            to="/images"
            className="btn btn-primary btn-lg rounded-lg gap-2"
          >
            My Images
          </Link>
        ) : (
          <>
            <Link
              to="/signup"
              className="btn btn-primary btn-lg rounded-lg gap-2"
            >
              Get Started Free
            </Link>
            <Link
              to="/about"
              className="btn btn-ghost btn-lg rounded-lg gap-2"
            >
              Learn More
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Hero;

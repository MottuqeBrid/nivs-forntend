import { Link } from "react-router";
import {
  HiPhotograph,
  HiVideoCamera,
  HiDocument,
  HiShieldCheck,
  HiLightningBolt,
  HiGlobe,
} from "react-icons/hi";
import logo from "../../assets/logo.png";
import { useAuth } from "../../hooks/useAuth";

const features = [
  {
    icon: HiPhotograph,
    title: "Image Storage",
    desc: "Upload, organize, and access your images from anywhere with secure cloud storage.",
    color: "text-success",
  },
  {
    icon: HiVideoCamera,
    title: "Video Hosting",
    desc: "Host your videos with direct streaming. Supports YouTube, Vimeo, and uploaded files.",
    color: "text-error",
  },
  {
    icon: HiDocument,
    title: "File Management",
    desc: "Store documents, code files, archives, and more. Preview directly in the browser.",
    color: "text-warning",
  },
  {
    icon: HiShieldCheck,
    title: "Secure & Private",
    desc: "Your data is protected with JWT authentication and role-based access control.",
    color: "text-primary",
  },
  {
    icon: HiLightningBolt,
    title: "Fast Uploads",
    desc: "Direct-to-cloud uploads via signed URLs. No backend bottleneck, no file size limits.",
    color: "text-accent",
  },
  {
    icon: HiGlobe,
    title: "Accessible Anywhere",
    desc: "Fully responsive design works on desktop, tablet, and mobile. Dark and light themes.",
    color: "text-secondary",
  },
];

const About = () => {
  const { user } = useAuth();

  return (
    <div className="py-12">
      {/* ── Hero ── */}
      <div className="flex flex-col items-center text-center mb-16">
        <img src={logo} alt="NIVS" className="w-20 h-20 rounded-2xl mb-6 shadow-lg" />
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Welcome to <span className="text-primary">NIVS</span>
        </h1>
        <p className="text-base-content/60 max-w-xl text-lg">
          A modern media management platform to store, organize, and access your
          images, videos, and files — all in one place.
        </p>
        {!user && (
          <div className="flex gap-3 mt-8">
            <Link to="/signup" className="btn btn-primary rounded-lg">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-ghost rounded-lg">
              Login
            </Link>
          </div>
        )}
      </div>

      {/* ── Features ── */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
            >
              <div className="card-body">
                <Icon className={`text-3xl ${color} mb-2`} />
                <h3 className="card-title text-lg">{title}</h3>
                <p className="text-sm text-base-content/60">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tech Stack ── */}
      <div className="card bg-base-200 shadow mb-16">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-2xl mb-4">Built With</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "React",
              "Vite",
              "Tailwind CSS",
              "DaisyUI",
              "React Router",
              "Node.js",
              "Express",
              "MongoDB",
              "Supabase",
            ].map((tech) => (
              <span key={tech} className="badge badge-outline badge-lg">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      {!user && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-base-content/60 mb-6">
            Create your free account and start managing your media today.
          </p>
          <Link to="/signup" className="btn btn-primary btn-lg rounded-lg">
            Sign Up Free
          </Link>
        </div>
      )}
    </div>
  );
};

export default About;

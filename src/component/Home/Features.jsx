import {
  HiPhotograph,
  HiVideoCamera,
  HiDocument,
  HiShieldCheck,
  HiLightningBolt,
  HiCloudUpload,
  HiSearch,
  HiTag,
  HiEye,
  HiDeviceMobile,
} from "react-icons/hi";

const features = [
  {
    icon: HiPhotograph,
    title: "Image Storage",
    desc: "Upload JPEG, PNG, GIF, WebP, SVG images with drag & drop. Organize with tags and search instantly.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: HiVideoCamera,
    title: "Video Hosting",
    desc: "Stream your uploaded videos or embed YouTube & Vimeo links. Watch directly in the browser.",
    color: "text-error",
    bg: "bg-error/10",
  },
  {
    icon: HiDocument,
    title: "File Management",
    desc: "Store documents, code, archives, and more. Preview PDFs, images, and videos inline.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: HiShieldCheck,
    title: "Secure Access",
    desc: "JWT authentication with role-based access control. Admin, moderator, and user roles.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: HiLightningBolt,
    title: "Fast Uploads",
    desc: "Direct-to-cloud signed URLs bypass the backend. No file size limits, maximum speed.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: HiCloudUpload,
    title: "Cloud Storage",
    desc: "Powered by Supabase for reliable, scalable storage with global CDN distribution.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: HiSearch,
    title: "Smart Search",
    desc: "Search across all your content by name, tags, or type. Find anything in seconds.",
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    icon: HiTag,
    title: "Tag System",
    desc: "Tag your media with custom labels. Filter and browse by tags for easy organization.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: HiEye,
    title: "Instant Preview",
    desc: "Preview images, watch videos, and view documents without downloading. Lightbox included.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: HiDeviceMobile,
    title: "Fully Responsive",
    desc: "Works perfectly on desktop, tablet, and mobile. Dark and light theme support.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

const Features = () => {
  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">
          Everything You Need
        </h2>
        <p className="text-base-content/60 max-w-xl mx-auto">
          A complete media management solution with all the tools you need to
          store, organize, and access your files.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {features.map(({ icon: Icon, title, desc, color, bg }) => (
          <div
            key={title}
            className="card bg-base-200 shadow hover:shadow-lg transition-all group"
          >
            <div className="card-body items-center text-center">
              <div className={`p-3 rounded-xl ${bg} mb-2 group-hover:scale-110 transition-transform`}>
                <Icon className={`text-2xl ${color}`} />
              </div>
              <h3 className="card-title text-sm">{title}</h3>
              <p className="text-xs text-base-content/60">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;

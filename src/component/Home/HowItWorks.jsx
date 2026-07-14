import {
  HiUserAdd,
  HiUpload,
  HiFolderOpen,
  HiShare,
} from "react-icons/hi";

const steps = [
  {
    icon: HiUserAdd,
    step: "01",
    title: "Create Account",
    desc: "Sign up for free in seconds. No credit card required.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: HiUpload,
    step: "02",
    title: "Upload Files",
    desc: "Drag & drop or paste URLs. Direct-to-cloud upload.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: HiFolderOpen,
    step: "03",
    title: "Organize",
    desc: "Tag, name, and categorize your media for easy access.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: HiShare,
    step: "04",
    title: "Access Anywhere",
    desc: "View and manage your files from any device, anytime.",
    color: "text-error",
    bg: "bg-error/10",
  },
];

const HowItWorks = () => {
  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">
          How It Works
        </h2>
        <p className="text-base-content/60 max-w-xl mx-auto">
          Get started in four simple steps. From sign-up to your first upload in
          under a minute.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map(({ icon: Icon, step, title, desc, color, bg }, i) => (
          <div key={step} className="relative">
            <div className="card bg-base-200 shadow hover:shadow-lg transition-all">
              <div className="card-body items-center text-center">
                <div className={`p-4 rounded-xl ${bg} mb-2`}>
                  <Icon className={`text-3xl ${color}`} />
                </div>
                <span className="text-xs font-bold text-base-content/30 mb-1">
                  Step {step}
                </span>
                <h3 className="card-title text-lg">{title}</h3>
                <p className="text-sm text-base-content/60">{desc}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 text-base-content/20 text-2xl z-10">
                →
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;

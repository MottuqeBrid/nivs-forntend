import {
  HiPhotograph,
  HiVideoCamera,
  HiDocument,
  HiUsers,
  HiClock,
  HiShieldCheck,
} from "react-icons/hi";

const stats = [
  {
    icon: HiPhotograph,
    value: "Unlimited",
    label: "Image Storage",
    color: "text-success",
  },
  {
    icon: HiVideoCamera,
    value: "Unlimited",
    label: "Video Hosting",
    color: "text-error",
  },
  {
    icon: HiDocument,
    value: "Unlimited",
    label: "File Storage",
    color: "text-warning",
  },
  {
    icon: HiUsers,
    value: "Free",
    label: "For Everyone",
    color: "text-primary",
  },
  {
    icon: HiClock,
    value: "24/7",
    label: "Access",
    color: "text-secondary",
  },
  {
    icon: HiShieldCheck,
    value: "100%",
    label: "Secure",
    color: "text-info",
  },
];

const Stats = () => {
  return (
    <div className="py-16">
      <div className="bg-base-200 rounded-2xl p-8 sm:p-12 shadow">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            Built for Scale
          </h2>
          <p className="text-base-content/60 max-w-xl mx-auto">
            No limits on storage. No hidden fees. Just a fast, reliable platform
            for all your media.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="text-center">
              <Icon className={`text-3xl ${color} mx-auto mb-2`} />
              <p className="text-2xl sm:text-3xl font-bold">{value}</p>
              <p className="text-sm text-base-content/60 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;

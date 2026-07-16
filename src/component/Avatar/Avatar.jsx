const getInitials = (name) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const sizeMap = {
  xs: "w-6 text-[10px]",
  sm: "w-8 text-xs",
  md: "w-10 text-sm",
  lg: "w-12 text-base",
  xl: "w-20 text-2xl",
  "2xl": "w-24 text-3xl",
};

const Avatar = ({ name, src, size = "md", className = "" }) => {
  const initials = getInitials(name);
  const sizeClass = sizeMap[size] || sizeMap.md;

  return (
    <div className={`avatar shrink-0 ${className}`}>
      <div
        className={`rounded-full bg-primary text-primary-content font-semibold flex items-center justify-center ${sizeClass}`}
      >
        {src ? (
          <img src={src} alt={name || "Profile"} className="rounded-full" />
        ) : (
          initials
        )}
      </div>
    </div>
  );
};

export default Avatar;

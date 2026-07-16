import { HiStar } from "react-icons/hi";
import Avatar from "../Avatar/Avatar";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Photographer",
    content:
      "NIVS is the perfect place to organize my photo shoots. The tag system and search make finding images effortless.",
    rating: 5,
  },
  {
    name: "Marcus Rivera",
    role: "Content Creator",
    content:
      "I love that I can host my videos and share them directly. The YouTube embed support is a game changer.",
    rating: 5,
  },
  {
    name: "Aisha Patel",
    role: "Developer",
    content:
      "As a developer, I use NIVS to store code snippets, documentation, and project files. The file preview is fantastic.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">
          Loved by Users
        </h2>
        <p className="text-base-content/60 max-w-xl mx-auto">
          See what people are saying about NIVS.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map(({ name, role, content, rating }) => (
          <div
            key={name}
            className="card bg-base-200 shadow hover:shadow-lg transition-all"
          >
            <div className="card-body">
              <div className="flex gap-1 mb-2">
                {Array.from({ length: rating }).map((_, i) => (
                  <HiStar key={i} className="text-warning text-lg" />
                ))}
              </div>
              <p className="text-sm text-base-content/70 mb-4">"{content}"</p>
              <div className="flex items-center gap-3">
                <Avatar name={name} size="md" />
                <div>
                  <p className="font-medium text-sm">{name}</p>
                  <p className="text-xs text-base-content/50">{role}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;

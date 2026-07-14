import { Link } from "react-router";
import { HiArrowRight } from "react-icons/hi";
import { useAuth } from "../../hooks/useAuth";

const CTA = () => {
  const { user } = useAuth();

  return (
    <div className="py-16">
      <div className="bg-primary rounded-2xl p-8 sm:p-12 text-center shadow-lg">
        <h2 className="text-3xl sm:text-4xl font-bold text-primary-content mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-primary-content/80 max-w-xl mx-auto mb-8">
          Join NIVS today and start managing your media with the fastest, most
          secure platform available.
        </p>
        <div className="flex justify-center gap-3">
          {user ? (
            <Link
              to="/images"
              className="btn btn-lg rounded-lg gap-2 bg-white text-primary hover:bg-white/90 border-none"
            >
              Go to Dashboard
              <HiArrowRight className="text-xl" />
            </Link>
          ) : (
            <>
              <Link
                to="/signup"
                className="btn btn-lg rounded-lg gap-2 bg-white text-primary hover:bg-white/90 border-none"
              >
                Create Free Account
                <HiArrowRight className="text-xl" />
              </Link>
              <Link
                to="/login"
                className="btn btn-lg rounded-lg gap-2 btn-outline border-white text-white hover:bg-white hover:text-primary"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CTA;

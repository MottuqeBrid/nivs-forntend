import { Link } from "react-router";

const NotFound = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center mt-10">
        404 - Page Not Found
      </h1>
      <Link
        to="/"
        className="text-blue-500 hover:underline text-center block mt-4"
      >
        Go back to Home
      </Link>
    </div>
  );
};

export default NotFound;

import { Outlet } from "react-router";
import Navbar from "../component/Navbar/Navbar";

const HomeLayout = () => {
  return (
    <div className="mx-auto max-w-7xl min-h-screen">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default HomeLayout;

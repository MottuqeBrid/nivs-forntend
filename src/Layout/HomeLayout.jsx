import { Outlet } from "react-router";
import Navbar from "../component/Navbar/Navbar";

const HomeLayout = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4">
        <Outlet />
      </main>
    </div>
  );
};

export default HomeLayout;

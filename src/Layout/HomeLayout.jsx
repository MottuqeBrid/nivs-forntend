import { Outlet } from "react-router";
import Navbar from "../component/Navbar/Navbar";
import Footer from "../component/Footer/Footer";

const HomeLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default HomeLayout;

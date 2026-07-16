import { Outlet } from "react-router";
import Navbar from "../component/Navbar/Navbar";
import Footer from "../component/Footer/Footer";
import ScrollToTop from "../component/ScrollToTop/ScrollToTop";

const HomeLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default HomeLayout;

import { createBrowserRouter } from "react-router";
import HomeLayout from "../Layout/HomeLayout";
import NotFound from "../component/Not-Found/Not-Found";
import Home from "../Pages/Home/Home";
import Images from "../Pages/Images/Images";
import Videos from "../Pages/Videos/Videos";
import Files from "../Pages/Files/Files";
import Login from "../Pages/Login/Login";
import SignUp from "../Pages/SignUp/SignUp";
import About from "../Pages/About/About";
import Profile from "../Pages/Profile/Profile";
import AdminLayout from "../Layout/AdminLayout";
import AdminDashboard from "../Pages/Admin/AdminDashboard";
import AdminUsers from "../Pages/Admin/AdminUsers";
import AdminUserDetail from "../Pages/Admin/AdminUserDetail";
import AdminUploads from "../Pages/Admin/AdminUploads";
import AdminImages from "../Pages/Admin/AdminImages";
import AdminVideos from "../Pages/Admin/AdminVideos";
import AdminFiles from "../Pages/Admin/AdminFiles";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomeLayout,
    children: [
      { index: true, Component: Home },
      { path: "images", Component: Images },
      { path: "videos", Component: Videos },
      { path: "files", Component: Files },
      { path: "login", Component: Login },
      { path: "signup", Component: SignUp },
      { path: "about", Component: About },
      { path: "profile", Component: Profile },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "users", Component: AdminUsers },
      { path: "users/:id", Component: AdminUserDetail },
      { path: "uploads", Component: AdminUploads },
      { path: "images", Component: AdminImages },
      { path: "videos", Component: AdminVideos },
      { path: "files", Component: AdminFiles },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);

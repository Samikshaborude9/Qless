import { Outlet } from "react-router";

const Layout = () => {
  return (
    <div className="max-w-[85vw] mx-auto">
      <Outlet />
    </div>
  );
};

export default Layout;

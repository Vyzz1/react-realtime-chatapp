import { Toaster } from "@/components/ui/toaster";
import { Outlet } from "react-router-dom";

const LayoutDefault = () => {
  return (
    <>
      <main className="min-h-screen  antialiased ">
        <Outlet />
        <Toaster />
      </main>
    </>
  );
};

export default LayoutDefault;

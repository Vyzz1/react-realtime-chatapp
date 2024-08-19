import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import SwitchTheme from "@/components/shared/SwitchTheme";

const ProtectedRoute = () => {
  const { auth: myAuth, handleDeleteAuth } = useContext(AuthContext);
  const auth = getAuth();

  const location = useLocation();

  const handleSignOut = async () => {
    signOut(auth)
      .then(() => {
        handleDeleteAuth();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      {myAuth ? (
        <>
          <aside className="w-full mt-5">
            <div className="max-w-7xl mx-auto flex justify-end gap-3">
              <SwitchTheme />
              <Popover>
                <PopoverTrigger>
                  <img
                    src={myAuth.photoURL}
                    alt={myAuth.displayName}
                    className="w-10 h-10 rounded-full cursor-pointer"
                  />
                </PopoverTrigger>

                <PopoverContent className="max-w-[200px]">
                  <div className="flex flex-col gap-y-4 items-center justify-center">
                    <p className="text-slate-900 dark:text-emerald-200 ">
                      {" "}
                      {myAuth.displayName}{" "}
                    </p>

                    <Button
                      variant="ghost"
                      className="text-sm"
                      onClick={() => handleSignOut()}
                    >
                      Đăng xuất
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </aside>
          <Outlet />
        </>
      ) : (
        <Navigate to={"/"} state={{ from: location }} replace />
      )}
    </>
  );
};

export default ProtectedRoute;

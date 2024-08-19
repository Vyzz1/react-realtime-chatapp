import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LayoutDefault from "./layout/LayoutDefault";
import Home from "./pages/Home";
import ProtectedRoute from "./layout/ProtectedRoute";
import Main from "./pages/Main";

const App = () => {
  const routers = createBrowserRouter([
    {
      path: "/",
      element: <LayoutDefault />,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: "/auth",
          element: <ProtectedRoute />,
          children: [
            {
              index: true,
              element: <Main />,
            },
            {
              path: "test",
              element: <div>Test</div>,
            },
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={routers} />;
};

export default App;

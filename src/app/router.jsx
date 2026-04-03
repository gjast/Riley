import { createBrowserRouter } from "react-router-dom";
import Landing from "../pages/Landing/Landing";
import Portfolio from "../pages/Portfolio/Portfolio";
import Admin from "../pages/Admin/Admin";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/portfolio/:caseId",
    element: <Portfolio />,
  },
  {
    path: "/admin",
    element: <Admin />,
  },
]);

export default router;

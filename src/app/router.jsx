import {
  createBrowserRouter,
} from "react-router-dom";
import Landing from "../pages/Landing/Landing";
import Portfolio from "../pages/Portfolio/Portfolio";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/portfolio/:caseId",
    element: <Portfolio />,
  },
]);

export default router;

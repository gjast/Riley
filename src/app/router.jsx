import {
  createBrowserRouter,
} from "react-router-dom";
import Landing from "../pages/Landing/Landing";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
]);

export default router;

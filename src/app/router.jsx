import { useLayoutEffect } from "react";
import {
  createBrowserRouter,
  Outlet,
  useLocation,
} from "react-router-dom";
import Landing from "../pages/Landing/Landing";
import Portfolio from "../pages/Portfolio/Portfolio";
import ServicePortfolio from "../pages/Portfolio/ServicePortfolio";
import Admin from "../pages/Admin/Admin";

/**
 * При переходах между страницами SPA окно сохраняет scrollY с предыдущего маршрута.
 * Сбрасываем в начало до отрисовки, чтобы портфолио не открывалось «с середины» / у футера.
 */
function RootLayout() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    html.style.scrollBehavior = prev;
  }, [pathname]);
  return <Outlet />;
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/portfolio/:caseId", element: <Portfolio /> },
      { path: "/services/:serviceKey", element: <ServicePortfolio /> },
      { path: "/admin", element: <Admin /> },
    ],
  },
]);

export default router;

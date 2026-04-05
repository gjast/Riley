/* eslint-disable react-refresh/only-export-components -- маршруты: lazy + createBrowserRouter */
import { lazy, Suspense, useLayoutEffect } from "react";
import {
  createBrowserRouter,
  Outlet,
  useLocation,
} from "react-router-dom";

const Landing = lazy(() => import("../pages/Landing/Landing"));
const Portfolio = lazy(() => import("../pages/Portfolio/Portfolio"));
const ServicePortfolio = lazy(
  () => import("../pages/Portfolio/ServicePortfolio"),
);
const Admin = lazy(() => import("../pages/Admin/Admin"));

function PageFallback() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-(--color-background) text-[15px] text-[#6A6A6D]"
      role="status"
      aria-live="polite"
    >
      Loading…
    </div>
  );
}

const landingRoute = (
  <Suspense fallback={<PageFallback />}>
    <Landing />
  </Suspense>
);
const portfolioRoute = (
  <Suspense fallback={<PageFallback />}>
    <Portfolio />
  </Suspense>
);
const servicePortfolioRoute = (
  <Suspense fallback={<PageFallback />}>
    <ServicePortfolio />
  </Suspense>
);
const adminRoute = (
  <Suspense fallback={<PageFallback />}>
    <Admin />
  </Suspense>
);

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
      { path: "/", element: landingRoute },
      { path: "/portfolio/:caseId", element: portfolioRoute },
      { path: "/services/:serviceKey", element: servicePortfolioRoute },
      { path: "/admin", element: adminRoute },
    ],
  },
]);

export default router;

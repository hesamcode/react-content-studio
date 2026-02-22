import { useEffect, useState } from "react";
import WorkspacePage from "../features/drafts/WorkspacePage";
import AboutPage from "./AboutPage";
import AppShell from "./AppShell";

const VALID_ROUTES = new Set(["/workspace", "/about"]);
const DEFAULT_ROUTE = "/workspace";

function parseHashRoute(hashValue) {
  const rawRoute = hashValue.replace(/^#/, "").trim();

  if (!rawRoute) {
    return DEFAULT_ROUTE;
  }

  if (rawRoute.startsWith("/")) {
    return rawRoute;
  }

  return `/${rawRoute}`;
}

export default function HashRouter() {
  const [route, setRoute] = useState(() => parseHashRoute(window.location.hash));

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = `#${DEFAULT_ROUTE}`;
      return undefined;
    }

    function onHashChange() {
      const nextRoute = parseHashRoute(window.location.hash);

      if (!VALID_ROUTES.has(nextRoute)) {
        window.location.hash = `#${DEFAULT_ROUTE}`;
        return;
      }

      setRoute(nextRoute);
    }

    onHashChange();
    window.addEventListener("hashchange", onHashChange);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  const page = route === "/about" ? <AboutPage /> : <WorkspacePage />;

  return <AppShell route={route}>{page}</AppShell>;
}

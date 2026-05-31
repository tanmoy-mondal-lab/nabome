import { useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

type ScrollPosition = {
  x: number;
  y: number;
};

const scrollPositions = new Map<string, ScrollPosition>();

function getScrollKey(locationKey: string, pathname: string, search: string) {
  return locationKey || `${pathname}${search}`;
}

export default function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const scrollKey = getScrollKey(location.key, location.pathname, location.search);

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    return () => {
      scrollPositions.set(scrollKey, {
        x: window.scrollX,
        y: window.scrollY,
      });
    };
  }, [scrollKey]);

  useLayoutEffect(() => {
    const savedPosition = scrollPositions.get(scrollKey);

    if (navigationType === "POP" && savedPosition) {
      window.scrollTo(savedPosition.x, savedPosition.y);
      return;
    }

    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1));
      if (target) {
        target.scrollIntoView();
        return;
      }
    }

    window.scrollTo(0, 0);
  }, [location.hash, navigationType, scrollKey]);

  return null;
}

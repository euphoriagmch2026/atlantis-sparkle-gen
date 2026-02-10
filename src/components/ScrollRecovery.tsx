import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollRecovery() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Forcibly clear any scroll-lock styles left by drawers or modals
    document.body.style.overflow = "unset";
    document.body.style.pointerEvents = "auto";
    document.body.style.paddingRight = "0px";

    // Explicitly remove Radix UI's specific lock attribute
    document.body.removeAttribute("data-scroll-locked");

    // Ensure the new page starts at the top
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

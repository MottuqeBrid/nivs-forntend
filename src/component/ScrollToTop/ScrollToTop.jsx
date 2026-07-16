import { useState, useEffect, useCallback } from "react";
import { HiChevronUp } from "react-icons/hi";

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        scrollToTop();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scrollToTop]);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-24 lg:bottom-8 right-8 z-50 btn btn-circle btn-primary shadow-lg transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      aria-label="Scroll to top (Ctrl+K)"
    >
      <HiChevronUp className="text-xl" />
    </button>
  );
};

export default ScrollToTop;

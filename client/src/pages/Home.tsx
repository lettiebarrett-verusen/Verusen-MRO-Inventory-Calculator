import { useEffect, useRef } from "react";
import { Calculator } from "@/components/calculator/Calculator";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sendHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.scrollHeight;
        window.parent.postMessage({ type: "verusen-calculator-resize", height }, "*");
      }
    };

    sendHeight();

    const observer = new ResizeObserver(sendHeight);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const mutationObserver = new MutationObserver(sendHeight);
    if (containerRef.current) {
      mutationObserver.observe(containerRef.current, { childList: true, subtree: true, attributes: true });
    }

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="font-sans">
      <Calculator />
    </div>
  );
}

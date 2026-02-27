import { useEffect, useRef, useCallback } from "react";
import { Calculator } from "@/components/calculator/Calculator";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastHeightRef = useRef<number>(0);

  const sendHeight = useCallback(() => {
    if (containerRef.current) {
      const height = Math.max(
        containerRef.current.scrollHeight,
        containerRef.current.offsetHeight,
        document.body.scrollHeight
      );
      if (height !== lastHeightRef.current && height > 0) {
        lastHeightRef.current = height;
        window.parent.postMessage({ type: "verusen-calculator-resize", height }, "*");
      }
    }
  }, []);

  useEffect(() => {
    sendHeight();

    const resizeObserver = new ResizeObserver(() => {
      sendHeight();
      setTimeout(sendHeight, 100);
      setTimeout(sendHeight, 400);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    resizeObserver.observe(document.body);

    const mutationObserver = new MutationObserver(() => {
      sendHeight();
      setTimeout(sendHeight, 100);
      setTimeout(sendHeight, 300);
      setTimeout(sendHeight, 600);
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    const interval = setInterval(sendHeight, 500);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      clearInterval(interval);
    };
  }, [sendHeight]);

  return (
    <div ref={containerRef} className="font-sans">
      <Calculator />
    </div>
  );
}

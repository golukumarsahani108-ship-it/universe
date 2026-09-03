"use client";

import { useEffect, useRef } from "react";

export default function UniverseOrb() {
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const orb = orbRef.current;

      if (!orb) return;

      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;

      orb.style.setProperty("--orb-x", `${x}`);
      orb.style.setProperty("--orb-y", `${y}`);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={orbRef}
      className="universe"
      aria-label="My Little Universe"
    >
      <div className="ring" />
      <div className="ring r2" />
      <div className="ring r3" />

      <div className="core">
        <b>
          ✦
          <br />
          MY SPACE
        </b>
      </div>

      <div className="tags t1">ME</div>
      <div className="tags t2">VIBES</div>
      <div className="tags t3">DREAMS</div>
      <div className="tags t4">MEMORIES</div>
    </div>
  );
}
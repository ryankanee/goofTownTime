"use client";
import { useEffect, useState } from "react";

export default function Clock() {
  const [time, setTime] = useState(new Date());
  const [hasMounted, setHasMounted] = useState(false);
  const [timeOffset, setTimeOffset] = useState(0);
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const fetchTimeOffset = async () => {
      try {
        const response = await fetch("/api/admin-time");
        const data = await response.json();

        if (data.hasCustomTime) {
          setTimeOffset(data.offset);
          setIsCustomTime(true);
        } else {
          setTimeOffset(0);
          setIsCustomTime(false);
        }
      } catch (error) {
        console.error("Error fetching time offset:", error);
        setTimeOffset(0);
        setIsCustomTime(false);
      }
    };

    fetchTimeOffset();

    // Check for offset updates every 5 seconds
    const offsetCheckInterval = setInterval(fetchTimeOffset, 5000);

    // Update time every second (either real time or offset time)
    const timeUpdateInterval = setInterval(() => {
      const currentTime = new Date(Date.now() + timeOffset);
      setTime(currentTime);
    }, 1000);

    return () => {
      clearInterval(offsetCheckInterval);
      clearInterval(timeUpdateInterval);
      window.removeEventListener("resize", checkMobile);
    };
  }, [timeOffset]);

  if (!hasMounted) return null;

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;

  const numbers = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="clock-container">
      <h1 className="clock-header">Please Slop Responsibly.</h1>
      <div className="clock">
        {numbers.map((num) => {
          const angle = (num - 3) * 30 * (Math.PI / 180); // rotate for clock alignment
          const radius = isMobile ? 60 : 85; // Responsive radius
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);

          const isLabel = num === 11 || num === 3;

          return (
            <div
              key={num}
              className={isLabel ? "number" : "tick"}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: isLabel
                  ? `translate(-50%, -50%)`
                  : `translate(-50%, -100%) rotate(${90 + (num - 3) * 30}deg)`,
              }}
            >
              {isLabel ? num : ""}
            </div>
          );
        })}

        <div
          className="hand hour"
          style={{ transform: `rotate(${hourDeg}deg)` }}
        />
        <div
          className="hand minute"
          style={{ transform: `rotate(${minuteDeg}deg)` }}
        />
        <div
          className="hand second"
          style={{ transform: `rotate(${secondDeg}deg)` }}
        />
        <div className="center" />
      </div>
      <div className="bottom-section">
        <h1 className="slop-text">Slop-O-Clock</h1>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";

export default function Clock() {
  const [time, setTime] = useState(new Date());
  const [hasMounted, setHasMounted] = useState(false);
  const [isCustomTime, setIsCustomTime] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    const fetchTime = async () => {
      try {
        const response = await fetch("/api/admin-time");
        const data = await response.json();

        if (data.hasCustomTime) {
          setTime(new Date(data.customTime));
          setIsCustomTime(true);
        } else {
          setTime(new Date());
          setIsCustomTime(false);
        }
      } catch (error) {
        console.error("Error fetching time:", error);
        setTime(new Date());
        setIsCustomTime(false);
      }
    };

    fetchTime();

    // Set up interval to check for custom time updates every 5 seconds
    const timeCheckInterval = setInterval(fetchTime, 5000);

    // Only update real time if not using custom time
    let realTimeInterval;
    if (!isCustomTime) {
      realTimeInterval = setInterval(() => {
        if (!isCustomTime) {
          setTime(new Date());
        }
      }, 1000);
    }

    return () => {
      clearInterval(timeCheckInterval);
      if (realTimeInterval) {
        clearInterval(realTimeInterval);
      }
    };
  }, [isCustomTime]);

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
          const radius = 85;
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

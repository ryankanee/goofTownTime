"use client";
import { useState, useEffect } from "react";

export default function AdminPage() {
  const [customTime, setCustomTime] = useState("");
  const [currentCustomTime, setCurrentCustomTime] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCurrentCustomTime();
  }, []);

  const fetchCurrentCustomTime = async () => {
    try {
      const response = await fetch("/api/admin-time");
      const data = await response.json();
      if (data.hasCustomTime) {
        setCurrentCustomTime(data.customTime);
      }
    } catch (error) {
      console.error("Error fetching custom time:", error);
    }
  };

  const handleSetTime = async (e) => {
    e.preventDefault();

    if (!customTime) {
      setMessage("Please enter a time (HH:MM format)");
      return;
    }

    try {
      const response = await fetch("/api/admin-time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ time: customTime }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Time set successfully!");
        setCurrentCustomTime(data.customTime);
        setCustomTime("");
      } else {
        setMessage(data.error || "Error setting time");
      }
    } catch (error) {
      setMessage("Error setting time");
      console.error("Error:", error);
    }
  };

  const handleClearTime = async () => {
    try {
      const response = await fetch("/api/admin-time", {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Custom time cleared - showing real time");
        setCurrentCustomTime(null);
      } else {
        setMessage("Error clearing time");
      }
    } catch (error) {
      setMessage("Error clearing time");
      console.error("Error:", error);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Clock Admin Panel</h1>

      <div
        style={{
          marginBottom: "2rem",
          padding: "1rem",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <h3>Current Status:</h3>
        {currentCustomTime ? (
          <p>
            Custom time is set to:{" "}
            <strong>{new Date(currentCustomTime).toLocaleString()}</strong>
          </p>
        ) : (
          <p>Showing real-time clock</p>
        )}
      </div>

      <form onSubmit={handleSetTime} style={{ marginBottom: "1rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="time-input"
            style={{ display: "block", marginBottom: "0.5rem" }}
          >
            Set Custom Time (for today):
          </label>
          <input
            id="time-input"
            type="time"
            value={customTime}
            onChange={(e) => setCustomTime(e.target.value)}
            style={{
              padding: "0.5rem",
              fontSize: "1rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              width: "200px",
            }}
          />
          <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.5rem" }}>
            Time will be applied to today&apos;s date
          </p>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="submit"
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Set Time
          </button>

          <button
            type="button"
            onClick={handleClearTime}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Clear Custom Time
          </button>
        </div>
      </form>

      {message && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: message.includes("Error") ? "#f8d7da" : "#d4edda",
            color: message.includes("Error") ? "#721c24" : "#155724",
            borderRadius: "4px",
            marginTop: "1rem",
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#e9ecef",
          borderRadius: "8px",
        }}
      >
        <h4>Instructions:</h4>
        <ul>
          <li>Set a custom time that all users will see on the clock</li>
          <li>The clock will be frozen at the time you set</li>
          <li>
            Click &quot;Clear Custom Time&quot; to return to real-time clock
          </li>
          <li>The custom time persists until cleared or server restart</li>
        </ul>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import "./Timer.css";

const Timer = ({ duration, onTimeUp, isActive = true }) => {
    const [timeLeft, setTimeLeft] = useState(duration); // in seconds

    useEffect(() => {
        if (!isActive || timeLeft <= 0) {
            if (timeLeft === 0) {
                onTimeUp();
            }
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft, isActive, onTimeUp]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const isLowTime = timeLeft < 60; // Less than 1 minute
    const isCritical = timeLeft < 30; // Less than 30 seconds

    return (
        <div className={`timer ${isLowTime ? "warning" : ""} ${isCritical ? "critical" : ""}`}>
            <div className="timer-icon">⏱️</div>
            <div className="timer-display">
                <span className="timer-minutes">{String(minutes).padStart(2, "0")}</span>
                <span className="timer-separator">:</span>
                <span className="timer-seconds">{String(seconds).padStart(2, "0")}</span>
            </div>
        </div>
    );
};

export default Timer;

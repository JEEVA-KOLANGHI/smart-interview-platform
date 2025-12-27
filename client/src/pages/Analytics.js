import { useEffect, useState } from "react";
import API from "../services/api";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Analytics = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await API.get("/analytics");
                setData(res.data);
            } catch (error) {
                alert("Failed to load analytics");
            }
        };

        fetchAnalytics();
    }, []);

    if (data.length === 0) {
        return <h3>No analytics data yet</h3>;
    }

    const chartData = {
        labels: data.map((item) => item.topic),
        datasets: [
            {
                label: "Accuracy %",
                data: data.map((item) => item.accuracy),
            },
        ],
    };

    return (
        <div style={{ padding: "40px" }}>
            <h2>Performance Analytics</h2>

            <Bar data={chartData} />

            <ul>
                {data.map((item, index) => (
                    <li key={index}>
                        {item.topic} → Attempts: {item.attempts}, Accuracy:{" "}
                        {item.accuracy}%
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Analytics;

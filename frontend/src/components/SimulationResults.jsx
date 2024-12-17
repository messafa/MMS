import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SimulationResults = ({ results }) => {
  const chartData = {
    labels: ["Average Queue Length (L)", "Average Wait Time (W)"],
    datasets: [
      {
        label: "Simulation Results",
        data: [results.L, results.W],
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Queue Simulation Results",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Simulation Results</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Metrics</h3>
          <p>Average Queue Length (L): {results.L.toFixed(2)}</p>
          <p>Average Wait Time (W): {results.W.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default SimulationResults;

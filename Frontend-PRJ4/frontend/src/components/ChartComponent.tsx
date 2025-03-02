import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartComponentProps {
  listCount: number;
  userCount: number;
  isLoading: boolean;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ listCount, userCount, isLoading }) => {
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  const data = {
    labels: [currentMonth],
    datasets: [
      {
        label: "Aktive Brugere",
        data: isLoading ? [] : [userCount],
        backgroundColor: "rgba(99, 102, 241, 0.5)", // Indigo farve
        borderColor: "rgb(99, 102, 241)",
        borderWidth: 1,
      },
      {
        label: "Indkøbslister",
        data: isLoading ? [] : [listCount],
        backgroundColor: "rgba(168, 85, 247, 0.5)", // Purple farve
        borderColor: "rgb(168, 85, 247)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "rgb(156, 163, 175)", // gray-400 for better visibility in both themes
        },
      },
      title: {
        display: true,
        text: "System Aktivitet for " + currentMonth,
        color: "rgb(156, 163, 175)", // gray-400
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "rgb(156, 163, 175)", // gray-400
        },
        grid: {
          color: "rgba(156, 163, 175, 0.1)", // Subtle grid lines
        },
      },
      x: {
        ticks: {
          color: "rgb(156, 163, 175)", // gray-400
        },
        grid: {
          color: "rgba(156, 163, 175, 0.1)", // Subtle grid lines
        },
      },
    },
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Aktivitets Oversigt
      </h2>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Indlæser data...</p>
        </div>
      ) : (
        <Bar options={options} data={data} />
      )}
    </div>
  );
};

export default ChartComponent;

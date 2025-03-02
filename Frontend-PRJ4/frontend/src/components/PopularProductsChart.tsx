import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PopularProductsChartProps {
  productData: {
    [key: string]: number;
  };
  isLoading: boolean;
  onRefresh: () => void;
}

const PopularProductsChart: React.FC<PopularProductsChartProps> = ({ 
  productData, 
  isLoading,
  onRefresh 
}) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Populære Produkter
          </h2>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={`${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-500 hover:bg-indigo-600'
            } text-white px-4 py-2 rounded transition-colors duration-200`}
          >
            {isLoading ? 'Opdaterer...' : 'Opdater data'}
          </button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  const labels = Object.keys(productData);
  const values = Object.values(productData);

  const data = {
    labels,
    datasets: [
      {
        label: 'Antal gange tilføjet',
        data: values,
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)',
        },
      },
      title: {
        display: true,
        text: 'Mest populære produkter',
        color: 'rgb(156, 163, 175)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: 'rgb(156, 163, 175)',
        },
      },
      x: {
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Populære Produkter
        </h2>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={`${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-indigo-500 hover:bg-indigo-600'
          } text-white px-4 py-2 rounded transition-colors duration-200`}
        >
          {isLoading ? 'Opdaterer...' : 'Opdater data'}
        </button>
      </div>
      
      {/* Statistik sektion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Produkt</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {labels[values.indexOf(Math.max(...values))]} ({Math.max(...values)} gange)
          </p>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tilføjelser</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {values.reduce((a, b) => a + b, 0)} produkter
          </p>
        </div>
      </div>

      <Bar options={options} data={data} />
    </div>
  );
};

export default PopularProductsChart; 
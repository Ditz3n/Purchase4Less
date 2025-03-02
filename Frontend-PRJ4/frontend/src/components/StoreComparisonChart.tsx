import React, { useEffect, useState } from 'react';
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

interface StoreComparisonChartProps {
  storeData: {
    [key: string]: number;
  };
  isLoading: boolean;
  onRefresh: () => void;
}

const StoreComparisonChart: React.FC<StoreComparisonChartProps> = ({ 
  storeData, 
  isLoading,
  onRefresh 
}) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Butik Sammenligning
          </h2>
          <button
            onClick={onRefresh}
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
          >
            Opdater data
          </button>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Indlæser butiksdata...</p>
        </div>
      </div>
    );
  }

  const labels = Object.keys(storeData);
  const totalPrices = labels.map(label => storeData[label]);
  
  // Beregn gennemsnitspris
  const averagePrice = totalPrices.reduce((acc, curr) => acc + curr, 0) / totalPrices.length;
  
  // Beregn afvigelser fra gennemsnittet
  const deviations = totalPrices.map(price => ((price - averagePrice) / averagePrice) * 100);
  
  // Nye udregninger
  const lowestPrice = Math.min(...totalPrices);
  const highestPrice = Math.max(...totalPrices);
  const priceRange = highestPrice - lowestPrice;
  const potentialSavings = highestPrice - lowestPrice;
  
  // Find billigste og dyreste butik
  const cheapestStore = labels[totalPrices.indexOf(lowestPrice)];
  const mostExpensiveStore = labels[totalPrices.indexOf(highestPrice)];
  
  // Beregn median pris
  const sortedPrices = [...totalPrices].sort((a, b) => a - b);
  const medianPrice = sortedPrices.length % 2 === 0
    ? (sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2
    : sortedPrices[Math.floor(sortedPrices.length / 2)];

  const data = {
    labels,
    datasets: [
      {
        label: 'Total Pris',
        data: totalPrices,
        backgroundColor: totalPrices.map(price => 
          price < averagePrice 
            ? 'rgba(34, 197, 94, 0.5)'  // Grøn for under gennemsnit
            : 'rgba(239, 68, 68, 0.5)'  // Rød for over gennemsnit
        ),
        borderColor: totalPrices.map(price => 
          price < averagePrice 
            ? 'rgb(34, 197, 94)'
            : 'rgb(239, 68, 68)'
        ),
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
        text: 'Butik Prissammenligning',
        color: 'rgb(156, 163, 175)',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const price = context.raw;
            const deviation = deviations[context.dataIndex];
            return [
              `Pris: ${price.toFixed(2)} kr`,
              `${deviation > 0 ? '+' : ''}${deviation.toFixed(1)}% ift. gennemsnit`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value + ' kr';
          },
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
          Butik Sammenligning
        </h2>
        <button
          onClick={onRefresh}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
        >
          Opdater data
        </button>
      </div>
      
      {/* Statistik sektion */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Prisstatistik</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Gennemsnit: {averagePrice.toFixed(2)} kr</p>
          <p className="text-gray-600 dark:text-gray-300">Median: {medianPrice.toFixed(2)} kr</p>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Besparelsespotentiale</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Op til {potentialSavings.toFixed(2)} kr</p>
          <p className="text-gray-600 dark:text-gray-300">({((potentialSavings/highestPrice) * 100).toFixed(1)}% mulig besparelse)</p>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Prisinterval</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Billigst: {cheapestStore}</p>
          <p className="text-gray-600 dark:text-gray-300">Dyrest: {mostExpensiveStore}</p>
        </div>
      </div>

      {/* Eksisterende graf */}
      <Bar options={options} data={data} />
    </div>
  );
};

export default StoreComparisonChart;
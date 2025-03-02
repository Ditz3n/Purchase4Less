import React from "react";

interface TotalPrice {
  source: string;
  total: number;
}

interface TotalPricesProps {
  totalPrices: TotalPrice[];
  sourceLogos: { [key: string]: string };
}

const TotalPrices: React.FC<TotalPricesProps> = ({ totalPrices, sourceLogos }) => {
  if (totalPrices.length === 0) {
    return null;
  }

  // Find the lowest total price
  const minTotal = Math.min(...totalPrices.map((total) => total.total));

  return (
    <div className="mt-8 w-full border-t border-gray-600">
      <h2 className="mt-4 text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500">
        Totalpriser
      </h2>
      <div className="flex justify-between items-center mt-4">
        {totalPrices.map((total) => (
          <div key={total.source} className="text-center">
            <div
              className={`relative w-20 h-20 mx-auto mb-2 ${
                total.total === minTotal ? "ring-4 ring-green-500 rounded-full" : ""
              }`}
            >
              <img
                src={sourceLogos[total.source]}
                alt={`${total.source} logo`}
                className="w-full h-full rounded-full"
              />
            </div>
            <div
              className={`text-lg font-medium ${
                total.total === minTotal ? "text-green-500" : ""
              }`}
            >
              {total.total.toFixed(2)} kr
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TotalPrices;

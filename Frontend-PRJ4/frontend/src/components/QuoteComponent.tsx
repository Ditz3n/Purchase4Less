import React, { useState, useEffect } from 'react';

const quotes = [
  { text: "Den bedste besparelse er den, du ikke behøver at lede efter", author: "Purchase4Less" },
  { text: "Sammenligning er nøglen til klog shopping", author: "Purchase4Less" },
  { text: "Spar smart, lev bedre", author: "Purchase4Less" },
  { text: "Hver krone tæller", author: "Purchase4Less" },
  { text: "Tid er penge - lad os spare begge dele", author: "Purchase4Less" },
  { text: "Små besparelser bliver til store summer over tid", author: "Purchase4Less" },
  { text: "Lad teknologien arbejde for din pengepung", author: "Purchase4Less" },
  { text: "Gør det nemt at spare penge", author: "Purchase4Less" },
  { text: "Jeg tager pis", author: "Mustafa Sagirkaya" },
  { text: "Hvad mangler vi?", author: "Shadi .S" },
  { text: "Jeg skulle lige køre min far", author: "Daahir" },
  { text: "Etiopien har opfundet kaffe", author: "Nahom" },
  { text: "*Ser sur ud*", author: "Altaf" },
  { text: "Sorte penge, fuck SU", author: "Gilli" },



];

const QuoteComponent: React.FC = () => {
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setQuote(randomQuote);
    }, 10000); // Skift citat hvert 10. sekund

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Dagens Visdom
      </h2>
      <div className="space-y-2">
        <p className="text-gray-600 dark:text-gray-400 italic">"{quote.text}"</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">- {quote.author}</p>
      </div>
    </div>
  );
};

export default QuoteComponent; 
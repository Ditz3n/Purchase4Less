import React, { useState } from "react";

const ReseedButton: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [log, setLog] = useState<string[]>([]);

    const handleAction = async () => {
        setIsLoading(true);
        setMessage(null);
        setLog((prevLog) => [...prevLog, "Starter database opdatering..."]);
        console.log("Starter database opdatering...");
        
        try {
            const response = await fetch("http://localhost:5000/api/Database/reseed", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessage(data.message);
                setLog((prevLog) => [...prevLog, data.message]);
                console.log(data.message);
            } else {
                const errorMsg = `Fejl: ${data.error}`;
                setMessage(errorMsg);
                setLog((prevLog) => [...prevLog, errorMsg]);
                console.error(errorMsg);
            }
        } catch (error) {
            const errorMsg = 'Der opstod en fejl ved opdatering';
            setMessage(errorMsg);
            setLog((prevLog) => [...prevLog, errorMsg]);
            console.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Database Administration</h2>
            <div className="max-w-2xl mx-auto space-y-4">
                <button 
                    onClick={handleAction} 
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Opdaterer..." : "Opdater Database"}
                </button>

                {message && (
                    <p className={`mt-4 p-4 rounded ${
                        message.includes('Fejl') 
                            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100' 
                            : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100'
                    }`}>
                        {message}
                    </p>
                )}

                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Log</h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {log.map((entry, index) => (
                            <li key={index}>{entry}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ReseedButton;

import React from 'react';

// Define the type for each statistic
interface Stat {
  id: number;
  name: string;
  value: string;
  suffix: string;
}

// Define the props type for the StatsSection component
interface StatsSectionProps {
  stats: Stat[];
}

// The StatsSection functional component
const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  return (
    <div className="relative isolate overflow-hidden bg-white dark:bg-gray-800 py-24 sm:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.800),theme(colors.gray.800))] opacity-20" />
      
      {/* Decorative skewed element */}
      <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white dark:bg-gray-800 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 dark:ring-indigo-900" />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <dl className="grid grid-cols-1 gap-x-16 gap-y-16 text-center lg:grid-cols-3">
            {stats.map((stat) => (
              <div 
                key={stat.id} 
                className="mx-auto flex max-w-xs flex-col gap-y-2 p-8 rounded-2xl
                          backdrop-blur-sm bg-white/30 dark:bg-gray-700/30
                          border border-white/20 dark:border-gray-700/30
                          shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]
                          transform hover:translate-y-[-4px] transition-all duration-300"
              >
                <dd className="text-4xl font-semibold tracking-tight text-indigo-600 dark:text-indigo-400 sm:text-5xl">
                  {stat.value}
                </dd>
                <dt className="text-base font-medium leading-7 text-gray-900 dark:text-white">
                  {stat.name}
                </dt>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {stat.suffix}
                </p>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;